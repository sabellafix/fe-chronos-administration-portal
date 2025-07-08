import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Booking } from '@app/core/models/bussiness/booking';
import { CreateBookingDto, BookingServiceRequest } from '@app/core/models/bussiness';
import { BookingStatus } from '@app/core/models/bussiness/enums';
import { DateOnly, TimeOnly } from '@app/core/models/bussiness/availability';
import { Service } from '@app/core/models/bussiness/service';
import { Customer } from '@app/core/models/bussiness/customer';
import { ServiceService } from '@app/core/services/http/platform-service.service';
import { BookingService } from '@app/core/services/http/booking.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomerService } from '@app/core/services/http/customer.service';
import { User } from '@app/core/models/bussiness/user';
import { UserService } from '@app/core/services/http/user.service';
import { OffcanvasBookingService } from '@app/core/services/shared/offcanvas-booking.service';
import { Subscription } from 'rxjs';

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
  users: User[] = []; 
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
      serviceId: [null],
      customerId: [null, [Validators.required]],
      bookingDate: [this.defaultDate, [Validators.required]],
      startTime: [this.getDefaultTime(), [Validators.required]],
      durationMinutes: [60, [Validators.required, Validators.min(15), Validators.max(480)]],
      status: [BookingStatus.Confirmed],
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
        this.snackBar.open('Error al obtener los servicios', 'Cerrar', {duration: 4000});
        this.getCustomers();
      }
    });
  }

  getCustomers(): void {
    this.loading = true;
    this.customerService.getCustomers().subscribe({
      next: (response: Customer[]) => {
        this.customers = response;
        this.getUsers();
      },error: (response) =>{
        this.snackBar.open('Error al obtener los clientes', 'Cerrar', {duration: 4000});
        this.getUsers();
      }
    });
  } 

  getUsers(): void {
    this.userService.getUsers().subscribe({
      next: (response: User[]) => {
        this.users = response;
        this.users = this.users.filter(user => user.userRole === 'client');
        this.customers.forEach((customer, index) => {
          if (index < this.userImages.length) {
            (customer as any).photo = this.userImages[index];
          }
        });
        this.loading = false;
      },error: (response) =>{
        this.snackBar.open('Error al obtener los usuarios', 'Cerrar', {duration: 4000});
        this.loading = false;
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
    const newDate = this.selectedDate ? 
      this.selectedDate.toISOString().split('T')[0] : 
      new Date().toISOString().split('T')[0];
    
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
      
      // createBookingDto.serviceId = this.selectedServices[0].id;
      
      const bookingDate = new Date(formValue.bookingDate);
      createBookingDto.bookingDate = bookingDate.toISOString().split('T')[0];
      
      const [startHour, startMinute] = formValue.startTime.split(':').map(Number);
      createBookingDto.startTime = new TimeOnly();
      createBookingDto.startTime.hour = startHour;
      createBookingDto.startTime.minute = startMinute;
      
      const totalDuration = this.calculateTotalDuration();
      const totalPrice = this.calculateTotalPrice();
      
      const endMinutes = startMinute + totalDuration;
      const endHour = startHour + Math.floor(endMinutes / 60);
      const finalMinutes = endMinutes % 60;
      createBookingDto.endTime = new TimeOnly();
      createBookingDto.endTime.hour = endHour % 24;
      createBookingDto.endTime.minute = finalMinutes;
      
      createBookingDto.durationMinutes = totalDuration;
      createBookingDto.totalPrice = totalPrice;
      createBookingDto.currency = this.selectedServices[0].currency || 'USD';
      createBookingDto.clientNotes = formValue.clientNotes || null;
      
      createBookingDto.services = this.selectedServices.map((service, index): BookingServiceRequest => ({
        color: service.color || '#23324d',
        durationInMinutes: service.durationMinutes,
        name: service.serviceName || 'Sin nombre',
        order: index + 1,
        serviceId: service.id
      }));
      
      const requestPayload = {
        createBookingDto: createBookingDto
      };
      
      console.log("Request payload:", requestPayload);
        
      this.bookingService.createBooking(requestPayload).subscribe({
        next: (response: Booking) => {
          const mappedBooking = this.mapCreateBookingDtoToBooking(createBookingDto, requestPayload);
          this.snackBar.open('Reserva creada exitosamente', 'Cerrar', {duration: 4000});
          this.hide();
          this.bookingCreated.emit(mappedBooking);
          this.offcanvasBookingService.onBookingCreated(mappedBooking);
          this.resetForm();
        },
        error: (error) => {
          const fallbackBooking = this.mapCreateBookingDtoToBooking(createBookingDto, requestPayload);
          this.snackBar.open('Error al crear la reserva', 'Cerrar', {duration: 4000});
          console.error('Error creating booking:', error);
          // En caso de error, aún podemos emitir la reserva simulada para testing
          this.hide();
          this.bookingCreated.emit(fallbackBooking);
          this.offcanvasBookingService.onBookingCreated(fallbackBooking);
          this.resetForm();
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
      serviceId: null,
      customerId: null,
      bookingDate: this.defaultDate,
      startTime: this.getDefaultTime(),
      durationMinutes: 60,
      status: BookingStatus.Pending,
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

  getCustomerPhoto(customer: Customer): string {
    return (customer as any).photo || this.imageUser;
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

  private generateBookingReference(): string {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    
    return `REF-${year}${month}${day}-${random}`;
  }

  private mapCreateBookingDtoToBooking(createDto: CreateBookingDto, payload: any): Booking {
    const booking = new Booking();
    
    // Propiedades básicas
    booking.id = this.generateBookingId();
    booking.customerId = createDto.customerId;
    booking.serviceId = this.selectedServices[0]?.id || '';
    booking.durationMinutes = createDto.durationMinutes || 0;
    booking.totalPrice = createDto.totalPrice;
    booking.currency = createDto.currency || 'USD';
    booking.status = BookingStatus.Confirmed;
    booking.clientNotes = createDto.clientNotes || null;
    booking.bookingReference = this.generateBookingReference();
    
    // Fecha de reserva
    const bookingDate = new Date(createDto.bookingDate);
    booking.bookingDate = new DateOnly();
    booking.bookingDate.year = bookingDate.getFullYear();
    booking.bookingDate.month = bookingDate.getMonth() + 1;
    booking.bookingDate.day = bookingDate.getDate();
    
    // Horas
    booking.startTime = createDto.startTime;
    booking.endTime = createDto.endTime || new TimeOnly();
    
    // Datos adicionales
    const now = new Date().toISOString();
    booking.createdAt = now;
    booking.updatedAt = now;
    booking.confirmedAt = now;
    
    // Relaciones
    booking.customer = this.customer || new Customer();
    booking.services = this.selectedServices || null;
    
    return booking;
  }
}
