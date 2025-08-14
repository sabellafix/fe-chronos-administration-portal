import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

// Services
import { BookingService } from '@app/core/services/http/booking.service';
import { ServiceService } from '@app/core/services/http/platform-service.service';
import { CustomerService } from '@app/core/services/http/customer.service';
import { UserService } from '@app/core/services/http/user.service';
import { OffcanvasBookingService } from '@app/core/services/shared/offcanvas-booking.service';

// Models
import { Booking } from '@app/core/models/bussiness/booking';
import { UpdateBookingDto, BookingServiceRequest } from '@app/core/models/bussiness';
import { Service } from '@app/core/models/bussiness/service';
import { Customer } from '@app/core/models/bussiness/customer';
import { User } from '@app/core/models/bussiness/user';
import { Supplier } from '@app/core/models/bussiness/supplier';
import { BookingStatus } from '@app/core/models/bussiness/enums';
import { DateOnly, TimeOnly } from '@app/core/models/bussiness/availability';
import { Option } from '@app/core/models/interfaces/option.interface';
import { RolesConst } from '@app/core/models/constants/roles.const';

// Utils
import { DateUtils } from '@app/core/utils/date.utils';
import { TimeUtils } from '@app/core/utils/time.utils';

declare var bootstrap: any;

@Component({
  selector: 'app-offcanvas-update-booking',
  templateUrl: './offcanvas-update-booking.component.html',
  styleUrl: './offcanvas-update-booking.component.scss'
})
export class OffcanvasUpdateBookingComponent implements OnInit, OnDestroy {
  
  @Input() bookingId?: string;
  @Output() bookingUpdated = new EventEmitter<Booking>();
  @Output() cancelled = new EventEmitter<void>();

  bookingForm: FormGroup;
  BookingStatus = BookingStatus; 
  loading: boolean = false;
  loadingBooking: boolean = false;
  private offcanvasInstance: any;
  private subscriptions: Subscription[] = [];
  
  // Data
  booking: Booking | null = null;
  services: Service[] = [];
  selectedServices: Service[] = [];
  customers: Customer[] = [];
  customer: Customer | null = null;
  customerOptions: Option[] = [];
  users: User[] = []; 
  usersOptions: Option[] = [];
  stylistLocked: boolean = false;
  selectedStylist: User | null = null;
  loadingServices: boolean = false;
  
  // UI
  imageUser: string = "../assets/images/user-image.jpg";
  userImages: string[] = [
    "../assets/images/users/user1.jpg",
    "../assets/images/users/user2.png",
    "../assets/images/users/user3.png",
    "../assets/images/users/user4.png",
  ];
  
  constructor(
    private formBuilder: FormBuilder, 
    private serviceService: ServiceService, 
    private bookingService: BookingService,
    private customerService: CustomerService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private offcanvasBookingService: OffcanvasBookingService
  ) {
    this.bookingForm = this.formBuilder.group({
      customerId: [null, [Validators.required]],
      supplierId: [null, [Validators.required]],
      bookingDate: ['', [Validators.required]],
      startTime: ['', [Validators.required]],
      durationMinutes: [60, [Validators.required, Validators.min(15), Validators.max(480)]],
      clientNotes: [''],
      providerNotes: [''],
      status: [BookingStatus.Confirmed]
    });
  }

  ngOnInit(): void {
    this.getUsers();
    this.getCustomers();
    
    const offcanvasElement = document.getElementById('offcanvasUpdateBooking');
    if (offcanvasElement) {
      this.offcanvasInstance = new bootstrap.Offcanvas(offcanvasElement);
      
      offcanvasElement.addEventListener('hidden.bs.offcanvas', () => {
        this.offcanvasBookingService.onUpdateCancelled();
      });
    }
    this.subscribeToOffcanvasService();
    this.subscribeToStylistChanges();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  private subscribeToOffcanvasService(): void {
    const showSubscription = this.offcanvasBookingService.showUpdateOffcanvas$.subscribe((bookingId: string) => {
      this.bookingId = bookingId;
      this.loadBooking();
      this.show();
    });

    this.subscriptions.push(showSubscription);
  }

  private subscribeToStylistChanges(): void {
    const stylistSubscription = this.bookingForm.get('supplierId')?.valueChanges.subscribe(stylistId => {
      if (stylistId && !this.stylistLocked) {
        this.onStylistSelected(stylistId);
      }
    });

    if (stylistSubscription) {
      this.subscriptions.push(stylistSubscription);
    }
  }

  private onStylistSelected(stylistId: string): void {
    this.selectedStylist = this.users.find(u => u.id === stylistId) || null;
    this.loadServicesByProvider(stylistId);
    this.lockStylist();
  }

  private lockStylist(): void {
    this.stylistLocked = true;
    this.bookingForm.get('supplierId')?.disable();
  }

  public unlockStylist(): void {
    this.stylistLocked = false;
    this.selectedStylist = null;
    this.services = [];
    this.selectedServices = [];
    this.bookingForm.get('supplierId')?.enable();
    this.bookingForm.get('supplierId')?.setValue(null);
    this.updateTotalDuration();
  }

  private loadServicesByProvider(providerId: string): void {
    this.loadingServices = true;
    
    if (!this.booking || this.booking.supplierId !== providerId) {
      this.services = [];
      this.selectedServices = [];
    }
    
    this.serviceService.getServicesByProvider(providerId).subscribe({
      next: (response: Service[]) => {
        this.services = response;
        this.loadingServices = false;
      },
      error: (error) => {
        this.snackBar.open('Error loading services for this stylist', 'Close', {duration: 4000});
        this.loadingServices = false;
      }
    });
  }

  loadBooking(): void {
    if (!this.bookingId) {
      this.snackBar.open('ID de booking no proporcionado', 'Cerrar', {duration: 4000});
      return;
    }

    this.loadingBooking = true;
    this.bookingService.getBooking(this.bookingId).subscribe({
      next: (booking: Booking) => {
        this.booking = booking;
        this.loadBookingData();
      },
      error: (error) => {
        this.snackBar.open('Error al cargar el booking', 'Cerrar', {duration: 4000});
        this.loadingBooking = false;
        this.hide();
      }
    });
  }

  private loadBookingData(): void {
    if (!this.booking) {
      this.loadingBooking = false;
      return;
    }

    if (this.users.length === 0 || this.customers.length === 0) {
      let usersLoaded = this.users.length > 0;
      let customersLoaded = this.customers.length > 0;
      
      if (!usersLoaded) {
        this.userService.getUsersByRole(RolesConst._STYLIST).subscribe({
          next: (response: User[]) => {
            this.users = response;
            this.usersOptions = this.users.map(user => ({
              id: user.id,
              name: user.firstName + ' ' + user.lastName,
              code: user.id.toString()
            }));
            usersLoaded = true;
            if (customersLoaded) this.populateFormWithBookingData();
          }
        });
      }
      
      if (!customersLoaded) {
        this.customerService.getAllCustomers().subscribe({
          next: (response: Customer[]) => {
            this.customers = response;
            this.customerOptions = this.customers.map(customer => ({
              id: customer.id,
              name: customer.firstName + ' ' + customer.lastName,
              code: customer.id.toString()
            }));
            customersLoaded = true;
            if (usersLoaded) this.populateFormWithBookingData();
          }
        });
      }
      
      if (usersLoaded && customersLoaded) {
        this.populateFormWithBookingData();
      }
    } else {
      this.populateFormWithBookingData();
    }
  }

  private populateFormWithBookingData(): void {
    if (!this.booking) return;

    this.customer = this.customers.find(c => c.id === this.booking!.customerId) || this.booking!.customer || null;

    if (this.booking.supplierId) {
      this.selectedStylist = this.users.find(u => u.id === this.booking!.supplierId) || null;
      
      if (this.selectedStylist) {
        this.loadingServices = true;
        this.serviceService.getServicesByProvider(this.booking.supplierId).subscribe({
          next: (response: Service[]) => {
            this.services = response;
            this.loadingServices = false;
            this.lockStylist();
            this.loadSelectedServices();
            this.populateForm();
            this.loadingBooking = false;
          },
          error: (error) => {
            console.error('Error loading services:', error);
            this.loadingServices = false;
            this.populateForm();
            this.loadingBooking = false;
          }
        });
      } else {
        this.populateForm();
        this.loadingBooking = false;
      }
    } else {
      this.populateForm();
      this.loadingBooking = false;
    }
  }

  private loadSelectedServices(): void {
    if (!this.booking) return;

    this.selectedServices = [];
    
    if (this.booking.services && this.booking.services.length > 0) {
      this.selectedServices = [...this.booking.services];
    } else if (this.booking.serviceId) {
      const service = this.services.find(s => s.id === this.booking!.serviceId);
      if (service) {
        this.selectedServices = [service];
      }
    }
  }

  private populateForm(): void {
    if (!this.booking) return;

    const bookingDate = typeof this.booking.bookingDate === 'string' 
      ? this.booking.bookingDate 
      : DateUtils.dateOnlyToHtmlDateInput(this.booking.bookingDate);

    const startTime = typeof this.booking.startTime === 'string'
      ? (this.booking.startTime as string).substring(0, 5)
      : TimeUtils.timeOnlyToHtmlTimeInput(this.booking.startTime as TimeOnly);

    this.bookingForm.patchValue({
      customerId: this.booking.customerId,
      supplierId: this.booking.supplierId,
      bookingDate: bookingDate,
      startTime: startTime,
      durationMinutes: this.booking.durationMinutes,
      clientNotes: this.booking.clientNotes || '',
      providerNotes: this.booking.providerNotes || '',
      status: this.booking.status
    });

    if (this.selectedServices.length > 0) {
      this.updateTotalDuration();
    }
  }

  getServices(): void {
    this.loading = true;
    this.serviceService.getAllServices().subscribe({
      next: (response: Service[]) => {
        this.services = response;
        this.loading = false;
      },error: (response) =>{
        this.snackBar.open('Error loading services', 'Close', {duration: 4000});
        this.loading = false;
      }
    });
  }

  getCustomers(): void {
    this.customerService.getAllCustomers().subscribe({
      next: (response: Customer[]) => {
        this.customers = response;
        this.customerOptions = this.customers.map(customer => ({
          id: customer.id,
          name: customer.firstName + ' ' + customer.lastName,
          code: customer.id.toString()
        }));
      },error: (response) =>{
        this.snackBar.open('Error loading customers', 'Close', {duration: 4000});
      }
    });
  } 

  getUsers(): void {
    this.userService.getUsersByRole(RolesConst._STYLIST).subscribe({
      next: (response: User[]) => {
        this.users = response;
        this.usersOptions = this.users.map(user => ({
          id: user.id,
          name: user.firstName + ' ' + user.lastName,
          code: user.id.toString()
        }));
      },error: (response) =>{
        this.snackBar.open('Error loading users', 'Close', {duration: 4000});
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.bookingForm.controls).forEach(key => {
      const control = this.bookingForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  public show(): void {
    if (this.offcanvasInstance) {
      this.offcanvasInstance.show();
    }
  }

  public hide(): void {
    if (this.offcanvasInstance) {
      this.offcanvasInstance.hide();
    }
  }

  onCancel(): void {
    this.hide();
    this.cancelled.emit();
    this.offcanvasBookingService.onUpdateCancelled();
    this.resetForm();
  }

  onConfirm(): void {
    if (this.bookingForm.valid && this.selectedServices.length > 0 && this.bookingId) {
      const formValue = this.bookingForm.value;
      
      const updateBookingDto: UpdateBookingDto = new UpdateBookingDto();
      
      const bookingDate = new Date(formValue.bookingDate);
      updateBookingDto.bookingDate = bookingDate.toISOString().split('T')[0];
      
      const [startHour, startMinute] = formValue.startTime.split(':').map(Number);
      updateBookingDto.startTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}:00`;
      
      const totalDuration = this.calculateTotalDuration();
      const totalPrice = this.calculateTotalPrice();
      
      updateBookingDto.durationMinutes = totalDuration;
      updateBookingDto.totalPrice = totalPrice;
      updateBookingDto.currency = 'COP';
      
      const totalMinutes = startMinute + totalDuration;
      const endHour = startHour + Math.floor(totalMinutes / 60);
      const finalMinutes = totalMinutes % 60;
      updateBookingDto.endTime = `${endHour.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}:00`;
      
      updateBookingDto.clientNotes = formValue.clientNotes || undefined;
      updateBookingDto.providerNotes = formValue.providerNotes || undefined;
      updateBookingDto.status = formValue.status;
      
      this.bookingService.updateBooking(this.bookingId, updateBookingDto).subscribe({
        next: (response: Booking) => {
          const booking = response;
          this.hide();
          this.bookingUpdated.emit(booking);
          this.offcanvasBookingService.onBookingUpdated(booking);
          this.resetForm();
          this.snackBar.open('Booking updated successfully', 'Close', {
            duration: 4000, 
            panelClass: 'snackbar-success'
          });
        },
        error: (error) => {
          if(error.status === 400){
            this.snackBar.open(error.error, 'Cerrar', {duration: 4000});
          } else {
            this.snackBar.open('Error updating booking', 'Close', {duration: 4000});
          }
        }
      });
    } else {
      if (this.selectedServices.length === 0) {
        this.snackBar.open('You must select at least one service', 'Close', {duration: 4000});
      }
      this.markFormGroupTouched();
    }
  }

  private resetForm(): void {
    this.unlockStylist();
    this.bookingForm.reset({
      customerId: null,
      supplierId: null,
      bookingDate: '',
      startTime: '',
      durationMinutes: 60,
      clientNotes: '',
      providerNotes: '',
      status: BookingStatus.Confirmed
    });
    this.selectedServices = [];
    this.customer = null;
    this.booking = null;
  }

  onServiceChange(event: any): void {
    const serviceId = event.target.value;
    const service = this.services.find(s => s.id === serviceId);
    
    if (service && !this.selectedServices.find(s => s.id === serviceId)) {
      this.selectedServices.push(service);
      this.updateTotalDuration();
    }
    
    event.target.value = null;
  }

  removeService(serviceId: string): void {
    this.selectedServices = this.selectedServices.filter(s => s.id !== serviceId);
    this.updateTotalDuration();
  }

  asignAutoComplete(option: Option, controlName: string): void {
    this.bookingForm.get(controlName)?.setValue(option.code!);
    
    if (controlName === 'customerId') {
      const customerId = option.code;
      this.customer = this.customers.find(c => c.id === customerId) || null;
      this.updateSelectedServicesWithModifiers();
    }
    
    if (controlName === 'supplierId' && !this.stylistLocked) {
      const stylistId = option.code;
      this.onStylistSelected(stylistId!);
    }
  }

  onCustomerChange(event: any): void {
    const customerId = event.target.value;
    this.customer = this.customers.find(c => c.id === customerId) || null;
    this.updateSelectedServicesWithModifiers();
  }

  private updateTotalDuration(): void {
    const totalDuration = this.calculateTotalDuration();
    this.bookingForm.patchValue({
      durationMinutes: totalDuration
    });
  }

  calculateTotalDuration(): number {
    return this.selectedServices.reduce((total, service) => {
      const modifiedDuration = this.getModifiedDuration(service);
      return total + (modifiedDuration !== null ? modifiedDuration : service.durationMinutes);
    }, 0);
  }

  calculateTotalPrice(): number {
    return this.selectedServices.reduce((total, service) => {
      const modifiedPrice = this.getModifiedPrice(service);
      return total + (modifiedPrice !== null ? modifiedPrice : service.price);
    }, 0);
  }

  getServiceName(service: Service): string {
    return service.serviceName || 'Sin nombre';
  }

  getServiceColor(service: Service): string {
    return service.color || '#23324d';
  }

  getCustomerFullName(customer: Customer): string {
    return `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Cliente sin nombre';
  }

  getUserFullName(user: User): string {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Stylist sin nombre';
  }

  getCustomerPhoto(customer: Customer): string {
    return (customer as any).photo || this.imageUser;
  }

  getSupplierName(supplier: Supplier): string {
    return supplier.companyName || 'Proveedor sin nombre';
  }

  getUserForCustomer(customer: Customer): User | null {
    return this.users.find(u => u.id === customer.userId) || null;
  }

  isFormValid(): boolean {
    return this.bookingForm.valid && this.selectedServices.length > 0;
  }

  getAvailableServices(): Service[] {
    return this.services.filter(service => 
      !this.selectedServices.find(selected => selected.id === service.id)
    );
  }

  getStatusOptions(): {value: BookingStatus, label: string}[] {
    return [
      { value: BookingStatus.Pending, label: 'Pendiente' },
      { value: BookingStatus.Confirmed, label: 'Confirmado' },
      { value: BookingStatus.InProgress, label: 'En Progreso' },
      { value: BookingStatus.Completed, label: 'Completado' },
      { value: BookingStatus.Cancelled, label: 'Cancelado' }
    ];
  }

  getStatusLabel(status: BookingStatus): string {
    const statusOption = this.getStatusOptions().find(option => option.value === status);
    return statusOption ? statusOption.label : 'Desconocido';
  }

  getModifiedPrice(service: Service): number | null {
    if (!this.customer || !this.customer.serviceModifiers) {
      return null;
    }
    
    const modifier = this.customer.serviceModifiers.find(
      sm => sm.serviceId === service.id
    );
    
    return modifier ? modifier.modifiedPrice : null;
  }

  getModifiedDuration(service: Service): number | null {
    if (!this.customer || !this.customer.serviceModifiers) {
      return null;
    }
    
    const modifier = this.customer.serviceModifiers.find(
      sm => sm.serviceId === service.id
    );
    
    return modifier ? modifier.modifiedDurationInMinutes : null;
  }

  hasServiceModifier(service: Service): boolean {
    if (!this.customer || !this.customer.serviceModifiers) {
      return false;
    }
    
    return this.customer.serviceModifiers.some(
      sm => sm.serviceId === service.id
    );
  }

  getServiceDisplayPrice(service: Service): number {
    const modifiedPrice = this.getModifiedPrice(service);
    return modifiedPrice !== null ? modifiedPrice : service.price;
  }

  getServiceDisplayDuration(service: Service): number {
    const modifiedDuration = this.getModifiedDuration(service);
    return modifiedDuration !== null ? modifiedDuration : service.durationMinutes;
  }

  private updateSelectedServicesWithModifiers(): void {
    if (this.selectedServices.length > 0) {
      this.updateTotalDuration();
    }
  }

  getStylistIdForAutocomplete(): number | undefined {
    if (!this.booking?.supplierId || this.usersOptions.length === 0) return undefined;
    const option = this.usersOptions.find(opt => opt.code === this.booking!.supplierId);
    return option ? Number(option.id) : undefined;
  }

  getCustomerIdForAutocomplete(): number | undefined {
    if (!this.booking?.customerId || this.customerOptions.length === 0) return undefined;
    const option = this.customerOptions.find(opt => opt.code === this.booking!.customerId);
    return option ? Number(option.id) : undefined;
  }

  refreshFormData(): void {
    if (this.booking) {
      setTimeout(() => {
        this.populateForm();
      }, 100);
    }
  }
}
