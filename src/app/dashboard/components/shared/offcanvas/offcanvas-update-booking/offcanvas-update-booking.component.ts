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
    this.getServices();
    const offcanvasElement = document.getElementById('offcanvasUpdateBooking');
    if (offcanvasElement) {
      this.offcanvasInstance = new bootstrap.Offcanvas(offcanvasElement);
      
      // Escuchar eventos de cierre del offcanvas
      offcanvasElement.addEventListener('hidden.bs.offcanvas', () => {
        // Notificar al servicio que el modal se cerró
        this.offcanvasBookingService.onUpdateCancelled();
      });
    }
    this.subscribeToOffcanvasService();
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

  loadBooking(): void {
    if (!this.bookingId) {
      this.snackBar.open('ID de booking no proporcionado', 'Cerrar', {duration: 4000});
      return;
    }

    this.loadingBooking = true;
    this.bookingService.getBooking(this.bookingId).subscribe({
      next: (booking: Booking) => {
        this.booking = booking;
        this.populateForm();
        this.loadingBooking = false;
      },
      error: (error) => {
        this.snackBar.open('Error al cargar el booking', 'Cerrar', {duration: 4000});
        this.loadingBooking = false;
        this.hide();
      }
    });
  }

  private populateForm(): void {
    if (!this.booking) return;

    // Formatear la fecha para el input date
    const bookingDate = typeof this.booking.bookingDate === 'string' 
      ? this.booking.bookingDate 
      : DateUtils.dateOnlyToHtmlDateInput(this.booking.bookingDate);

    // Formatear la hora para el input time
    const startTime = typeof this.booking.startTime === 'string'
      ? (this.booking.startTime as string).substring(0, 5) // Solo HH:MM
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

    // Cargar servicios seleccionados
    if (this.booking.services && this.booking.services.length > 0) {
      this.selectedServices = [...this.booking.services];
    } else if (this.booking.serviceId) {
      // Si solo hay un serviceId, buscar el servicio en la lista
      const service = this.services.find(s => s.id === this.booking!.serviceId);
      if (service) {
        this.selectedServices = [service];
      }
    }

    // Cargar información del cliente
    this.customer = this.booking.customer;
  }

  getServices(): void {
    this.loading = true;
    this.serviceService.getServices().subscribe({
      next: (response: Service[]) => {
        this.services = response;
        this.getCustomers();
      },
      error: (response) => {
        this.snackBar.open('Error al cargar servicios', 'Cerrar', {duration: 4000});
        this.getCustomers();
      }
    });
  }

  getCustomers(): void {
    this.loading = true;
    this.customerService.getCustomers().subscribe({
      next: (response: Customer[]) => {
        this.customers = response;
        this.customerOptions = this.customers.map(customer => ({
          id: customer.id,
          name: customer.firstName + ' ' + customer.lastName,
          code: customer.id.toString()
        }));
        this.getUsers();
      },
      error: (response) => {
        this.snackBar.open('Error al cargar clientes', 'Cerrar', {duration: 4000});
        this.getUsers();
      }
    });
  } 

  getUsers(): void {
    this.loading = true;
    this.userService.getUsersByRole(RolesConst._STYLIST).subscribe({
      next: (response: User[]) => {
        this.users = response;
        this.usersOptions = this.users.map(user => ({
          id: user.id,
          name: user.firstName + ' ' + user.lastName,
          code: user.id.toString()
        }));
        this.loading = false;
      },
      error: (response) => {
        this.snackBar.open('Error al cargar usuarios', 'Cerrar', {duration: 4000});
        this.loading = false;
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
      
      // Configurar bookingDate como DateOnly
      updateBookingDto.bookingDate = DateUtils.htmlDateInputToDateOnly(formValue.bookingDate);
      
      // Configurar startTime como TimeOnly
      updateBookingDto.startTime = TimeUtils.htmlTimeInputToTimeOnly(formValue.startTime);
      
      // Calcular duración total y precio total
      const totalDuration = this.calculateTotalDuration();
      const totalPrice = this.calculateTotalPrice();
      
      updateBookingDto.durationMinutes = totalDuration;
      updateBookingDto.totalPrice = totalPrice;
      updateBookingDto.currency = 'COP';
      
      // Configurar endTime como TimeOnly (calculado añadiendo duración al startTime)
      updateBookingDto.endTime = TimeUtils.addMinutes(updateBookingDto.startTime!, totalDuration);
      
      // Configurar notas y estado
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
          this.snackBar.open('Booking actualizado exitosamente', 'Cerrar', {
            duration: 4000, 
            panelClass: 'snackbar-success'
          });
        },
        error: (error) => {
          if(error.status === 400){
            this.snackBar.open(error.error, 'Cerrar', {duration: 4000});
          } else {
            this.snackBar.open('Error al actualizar booking', 'Cerrar', {duration: 4000});
          }
        }
      });
    } else {
      if (this.selectedServices.length === 0) {
        this.snackBar.open('Debe seleccionar al menos un servicio', 'Cerrar', {duration: 4000});
      }
      this.markFormGroupTouched();
    }
  }

  private resetForm(): void {
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
    
    // Resetear el select
    event.target.value = null;
  }

  removeService(serviceId: string): void {
    this.selectedServices = this.selectedServices.filter(s => s.id !== serviceId);
    this.updateTotalDuration();
  }

  asignAutoComplete(option: Option, controlName: string): void {
    this.bookingForm.get(controlName)?.setValue(option.code!);
  }

  onCustomerChange(event: any): void {
    const customerId = event.target.value;
    this.customer = this.customers.find(c => c.id === customerId) || null;
  }

  private updateTotalDuration(): void {
    const totalDuration = this.calculateTotalDuration();
    this.bookingForm.patchValue({
      durationMinutes: totalDuration
    });
  }

  calculateTotalDuration(): number {
    return this.selectedServices.reduce((total, service) => total + service.durationMinutes, 0);
  }

  calculateTotalPrice(): number {
    return this.selectedServices.reduce((total, service) => total + service.price, 0);
  }

  // Helper methods para el template
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

  // Métodos para manejar estados de booking
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
}
