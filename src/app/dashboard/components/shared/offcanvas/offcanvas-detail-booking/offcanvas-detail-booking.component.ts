import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { Booking } from '@app/core/models/bussiness/booking';
import { Service } from '@app/core/models/bussiness/service';
import { Customer } from '@app/core/models/bussiness/customer';
import { User } from '@app/core/models/bussiness/user';
import { BookingStatus } from '@app/core/models/bussiness/enums';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BookingService } from '@app/core/services/http/booking.service';
import { CustomerService } from '@app/core/services/http/customer.service';
import { UserService } from '@app/core/services/http/user.service';
import { OffcanvasBookingService } from '@app/core/services/shared/offcanvas-booking.service';
import { RolesConst } from '@app/core/models/constants/roles.const';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

declare var bootstrap: any;

@Component({
  selector: 'app-offcanvas-detail-booking',
  templateUrl: './offcanvas-detail-booking.component.html',
  styleUrl: './offcanvas-detail-booking.component.scss'
})
export class OffcanvasDetailBookingComponent implements OnInit, OnDestroy {
  
  @Input() bookingId?: string;
  @Output() closed = new EventEmitter<void>();

  bookingForm: FormGroup;
  BookingStatus = BookingStatus;
  loading: boolean = false;
  loadingBooking: boolean = false;
  private offcanvasInstance: any;
  private subscriptions: Subscription[] = [];
  
  // Data
  booking: Booking | null = null;
  customer: Customer | null = null;
  selectedStylist: User | null = null;
  selectedServices: Service[] = [];
  users: User[] = [];
  customers: Customer[] = [];
  
  // UI
  imageUser: string = "../assets/images/user-image.jpg";
  
  constructor(
    private formBuilder: FormBuilder, 
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
    
    const offcanvasElement = document.getElementById('offcanvasDetailBooking');
    if (offcanvasElement) {
      this.offcanvasInstance = new bootstrap.Offcanvas(offcanvasElement);
      
      offcanvasElement.addEventListener('hidden.bs.offcanvas', () => {
        this.closed.emit();
        this.offcanvasBookingService.onDetailClosed();
      });
    }
    this.subscribeToOffcanvasService();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  private subscribeToOffcanvasService(): void {
    const showSubscription = this.offcanvasBookingService.showDetailOffcanvas$.subscribe((bookingId: string) => {
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

    // Cargar customer
    this.customer = this.customers.find(c => c.id === this.booking!.customerId) || this.booking!.customer || null;
    
    // Cargar stylist
    this.selectedStylist = this.users.find(u => u.id === this.booking!.supplierId) || null;
    
    // Cargar servicios
    this.loadSelectedServices();
    
    this.loadingBooking = false;
  }

  private loadSelectedServices(): void {
    if (!this.booking) return;

    this.selectedServices = [];
    
    if (this.booking.services && this.booking.services.length > 0) {
      this.selectedServices = [...this.booking.services];
    }
  }

  getCustomers(): void {
    this.customerService.getAllCustomers().subscribe({
      next: (response: Customer[]) => {
        this.customers = response;
      },
      error: (response) => {
        console.error('Error loading customers', response);
      }
    });
  } 

  getUsers(): void {
    this.userService.getUsersByRole(RolesConst._STYLIST).subscribe({
      next: (response: User[]) => {
        this.users = response;
      },
      error: (response) => {
        console.error('Error loading users', response);
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

  onClose(): void {
    this.hide();
    this.closed.emit();
    this.offcanvasBookingService.onDetailClosed();
  }

  calculateTotalDuration(): number {
    if (!this.booking) return 0;
    return this.selectedServices.reduce((total, service) => {
      const modifiedDuration = this.getModifiedDuration(service);
      return total + (modifiedDuration !== null ? modifiedDuration : service.durationMinutes);
    }, 0) || this.booking.durationMinutes;
  }

  calculateTotalPrice(): number {
    if (!this.booking) return 0;
    return this.selectedServices.reduce((total, service) => {
      const modifiedPrice = this.getModifiedPrice(service);
      return total + (modifiedPrice !== null ? modifiedPrice : service.price);
    }, 0) || this.booking.totalPrice;
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

  getUserForCustomer(customer: Customer): User | null {
    return this.users.find(u => u.id === customer.userId) || null;
  }

  getStatusLabel(status: BookingStatus): string {
    const statusOptions = [
      { value: BookingStatus.Pending, label: 'Pendiente' },
      { value: BookingStatus.Confirmed, label: 'Confirmado' },
      { value: BookingStatus.InProgress, label: 'En Progreso' },
      { value: BookingStatus.Completed, label: 'Completado' },
      { value: BookingStatus.Cancelled, label: 'Cancelado' }
    ];
    
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.label : 'Desconocido';
  }

  getStatusBadgeClass(status: BookingStatus): string {
    switch (status) {
      case BookingStatus.Pending:
        return 'badge bg-warning';
      case BookingStatus.Confirmed:
        return 'badge bg-info';
      case BookingStatus.InProgress:
        return 'badge bg-primary';
      case BookingStatus.Completed:
        return 'badge bg-success';
      case BookingStatus.Cancelled:
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
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

  formatDate(date: any): string {
    if (!date) return 'No especificada';
    
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString('es-ES');
    }
    
    if (date.year && date.month && date.day) {
      return `${date.day}/${date.month}/${date.year}`;
    }
    
    return 'Fecha inválida';
  }

  formatTime(time: any): string {
    if (!time) return 'No especificada';
    
    if (typeof time === 'string') {
      return time.substring(0, 5);
    }
    
    if (time.hour !== undefined && time.minute !== undefined) {
      return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
    }
    
    return 'Hora inválida';
  }
}
