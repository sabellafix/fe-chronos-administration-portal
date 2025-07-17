import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Booking } from '@app/core/models/bussiness/booking';
import { CreateBookingDto, BookingServiceRequest } from '@app/core/models/bussiness';
import { BookingStatus } from '@app/core/models/bussiness/enums';
import { Service } from '@app/core/models/bussiness/service';
import { Customer } from '@app/core/models/bussiness/customer';
import { Supplier } from '@app/core/models/bussiness/supplier';
import { ServiceService } from '@app/core/services/http/platform-service.service';
import { BookingService } from '@app/core/services/http/booking.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomerService } from '@app/core/services/http/customer.service';
import { User } from '@app/core/models/bussiness/user';
import { UserService } from '@app/core/services/http/user.service';
import { OffcanvasBookingService } from '@app/core/services/shared/offcanvas-booking.service';
import { Subscription } from 'rxjs';
import { RolesConst } from '@app/core/models/constants/roles.const';
import { Option } from '@app/core/models/interfaces/option.interface';

declare var bootstrap: any;

@Component({
  selector: 'app-offcanvas-create-booking',
  templateUrl: './offcanvas-create-booking.component.html',
  styleUrl: './offcanvas-create-booking.component.scss'
})
export class OffcanvasCreateBookingComponent implements OnInit, OnDestroy {
  
  @Input() selectedDate?: Date;
  @Input() selectedHour?: number;
  @Output() bookingCreated = new EventEmitter<Booking>();
  @Output() cancelled = new EventEmitter<void>();

  bookingForm: FormGroup;
  defaultDate: string;
  BookingStatus = BookingStatus; 
  loading: boolean = false;
  private offcanvasInstance: any;
  private subscriptions: Subscription[] = [];
  services: Service[] = [];
  selectedServices: Service[] = [];
  customers: Customer[] = [];
  customer: Customer | null = null;
  customerOptions: Option[] = [];
  users: User[] = []; 
  usersOptions: Option[] = [];
  imageUser: string = "../assets/images/user-image.jpg";
  userImages: string[] = [
    "../assets/images/users/user1.jpg",
    "../assets/images/users/user2.png",
    "../assets/images/users/user3.png",
    "../assets/images/users/user4.png",
  ];
  
  constructor(private formBuilder: FormBuilder, 
    private serviceService: ServiceService, 
    private bookingService: BookingService,
    private customerService: CustomerService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private offcanvasBookingService: OffcanvasBookingService) {
    this.defaultDate = this.selectedDate ? 
      this.selectedDate.toISOString().split('T')[0] : 
      new Date().toISOString().split('T')[0];

    this.bookingForm = this.formBuilder.group({
      customerId: [null, [Validators.required]],
      supplierId: [null, [Validators.required]],
      bookingDate: [this.defaultDate, [Validators.required]],
      startTime: [this.getDefaultTime(), [Validators.required]],
      durationMinutes: [60, [Validators.required, Validators.min(15), Validators.max(480)]],
      clientNotes: [''],
      providerNotes: ['']
    });
  }

  ngOnInit(): void {

    this.getServices();
    const offcanvasElement = document.getElementById('offcanvasCreateBooking');
    if (offcanvasElement) {
      this.offcanvasInstance = new bootstrap.Offcanvas(offcanvasElement);
    }
    this.subscribeToOffcanvasService();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  private subscribeToOffcanvasService(): void {
    const showSubscription = this.offcanvasBookingService.showOffcanvas$.subscribe(() => {
      this.selectedDate = this.offcanvasBookingService.selectedDate || undefined;
      this.selectedHour = this.offcanvasBookingService.selectedHour || undefined;
      this.show();
    });
    

    this.subscriptions.push(showSubscription);
  }

  getServices(): void {
    this.loading = true;
    this.serviceService.getServices().subscribe({
      next: (response: Service[]) => {
        this.services = response;
        this.getCustomers();
      },error: (response) =>{
        this.snackBar.open('Error loading services', 'Close', {duration: 4000});
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
      },error: (response) =>{
        this.snackBar.open('Error loading customers', 'Close', {duration: 4000});
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
      },error: (response) =>{
        this.snackBar.open('Error loading users', 'Close', {duration: 4000});
      }
    });
  }


  private getDefaultTime(): string {
    if (this.selectedHour) {
      return `${this.selectedHour.toString().padStart(2, '0')}:00`;
    }
    return '09:00';
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
    this.updateDateAndTime();
    if (this.offcanvasInstance) {
      this.offcanvasInstance.show();
    }
  }

  public hide(): void {
    if (this.offcanvasInstance) {
      this.offcanvasInstance.hide();
    }
  }

  private updateDateAndTime(): void {
    let dateToUse = this.selectedDate ? new Date(this.selectedDate) : new Date();
    dateToUse.setDate(dateToUse.getDate() - 1);
    const newDate = dateToUse.toISOString().split('T')[0];
    
    this.bookingForm.patchValue({
      bookingDate: newDate,
      startTime: this.getDefaultTime()
    });
  }

  onCancel(): void {
    this.hide();
    this.cancelled.emit();
    this.offcanvasBookingService.onCancelled();
  }

  onConfirm(): void {
    if (this.bookingForm.valid && this.selectedServices.length > 0) {
      const formValue = this.bookingForm.value;
      
      const createBookingDto: CreateBookingDto = new CreateBookingDto();
      createBookingDto.customerId = formValue.customerId;
      createBookingDto.supplierId = formValue.supplierId;
      
      // Configurar serviceId con el primer servicio seleccionado
      createBookingDto.serviceId = this.selectedServices[0].id;
      
      // Configurar bookingDate como string (YYYY-MM-DD)
      const bookingDate = new Date(formValue.bookingDate);
      createBookingDto.bookingDate = bookingDate.toISOString().split('T')[0];
      
      // Configurar startTime como string (HH:MM:SS)
      const [startHour, startMinute] = formValue.startTime.split(':').map(Number);
      createBookingDto.startTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}:00`;
      
      // Calcular duración total y precio total
      const totalDuration = this.calculateTotalDuration();
      const totalPrice = this.calculateTotalPrice();
      
      createBookingDto.durationMinutes = totalDuration;
      createBookingDto.totalPrice = totalPrice;
      createBookingDto.currency = 'COP'; // Configurar moneda por defecto
      
      // Configurar endTime como string (HH:MM:SS)
      const totalMinutes = startMinute + totalDuration;
      const endHour = startHour + Math.floor(totalMinutes / 60);
      const finalMinutes = totalMinutes % 60;
      createBookingDto.endTime = `${endHour.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}:00`;
      
      // Configurar notas
      createBookingDto.clientNotes = formValue.clientNotes || undefined;
      
      // Configurar servicios para la reserva
      createBookingDto.services = this.selectedServices.map((service, index): BookingServiceRequest => ({
        serviceId: service.id,
        name: service.serviceName || 'Sin nombre',
        color: service.color || '#23324d',
        order: index,
        durationInMinutes: service.durationMinutes
      }));
        
      this.bookingService.create(createBookingDto).subscribe({
        next: (response: Booking) => {
          const booking = response;
          console.log("booking", booking);
          this.hide();
          this.bookingCreated.emit(booking);
          this.offcanvasBookingService.onBookingCreated(booking);
          this.resetForm();
          this.snackBar.open('Booking created successfully', 'Close', {duration: 4000, panelClass: 'snackbar-success'});
        },
        error: (error) => {
          if(error.status === 400){
            this.snackBar.open(error.error, 'Close', {duration: 4000});
          }else{
            this.snackBar.open('Error creating booking', 'Close', {duration: 4000});
          }
          this.hide();
          this.bookingCreated.emit(null as any);
          this.offcanvasBookingService.onBookingCreated(null as any);
          this.resetForm();
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
    this.bookingForm.reset({
      customerId: null,
      supplierId: null,
      bookingDate: this.defaultDate,
      startTime: this.getDefaultTime(),
      durationMinutes: 60,
      clientNotes: '',
      providerNotes: ''
    });
    this.selectedServices = [];
    this.customer = null;
  }

  onServiceChange(event: any): void {
    const serviceId = event.target.value;
    const service = this.services.find(s => s.id === serviceId);
    
    if (service && !this.selectedServices.find(s => s.id === serviceId)) {
      this.selectedServices.push(service);
      // Actualizar duración total
      this.updateTotalDuration();
    }
    
    // Resetear el select
    event.target.value = null;
  }

  removeService(serviceId: string): void {
    this.selectedServices = this.selectedServices.filter(s => s.id !== serviceId);
    this.updateTotalDuration();
  }

  asignAutoComplete(option: Option, controlName: string){
    this.bookingForm.get(controlName)?.setValue(option.code!);
  }

  onCustomerChange(event: any): void {
    console.log("event", event);
    const customerId = event.target.value;
    this.customer = this.customers.find(c => c.id === customerId) || null;
    console.log("this.customers", this.customers);
    console.log("customerId", this.bookingForm.get('customerId')?.value);
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

  // Métodos para manejar los servicios seleccionados
  isFormValid(): boolean {
    return this.bookingForm.valid && this.selectedServices.length > 0;
  }

  getAvailableServices(): Service[] {
    return this.services.filter(service => 
      !this.selectedServices.find(selected => selected.id === service.id)
    );
  }

  private generateBookingId(): string {
    return 'BK-' + Date.now().toString() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }

}
