import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Booking } from '@app/core/models/bussiness/booking';
import { BookingStatus } from '@app/core/models/bussiness/enums';
import { DateOnly, TimeOnly } from '@app/core/models/bussiness/availability';
import { Service } from '@app/core/models/bussiness/service';
import { Customer } from '@app/core/models/bussiness/customer';
import { PlatformServiceService } from '@app/core/services/http/platform-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomerService } from '@app/core/services/http/customer.service';
import { User } from '@app/core/models/bussiness/user';
import { UserService } from '@app/core/services/http/user.service';

declare var bootstrap: any;

@Component({
  selector: 'app-offcanvas-create-booking',
  templateUrl: './offcanvas-create-booking.component.html',
  styleUrl: './offcanvas-create-booking.component.scss'
})
export class OffcanvasCreateBookingComponent implements OnInit {
  
  @Input() selectedDate?: Date;
  @Input() selectedHour?: number;
  @Output() bookingCreated = new EventEmitter<Booking>();
  @Output() cancelled = new EventEmitter<void>();

  bookingForm: FormGroup;
  defaultDate: string;
  BookingStatus = BookingStatus; 
  loading: boolean = false;
  private offcanvasInstance: any;
  services: Service[] = [];
  service: Service = new Service();
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
    private serviceService: PlatformServiceService, 
    private customerService: CustomerService,
    private userService: UserService,
    private snackBar: MatSnackBar) {
    this.defaultDate = this.selectedDate ? 
      this.selectedDate.toISOString().split('T')[0] : 
      new Date().toISOString().split('T')[0];

    this.bookingForm = this.formBuilder.group({
      serviceId: [null, [Validators.required]],
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
        this.customers.forEach((customer, index) => {
          const user = this.users.find(u => u.id === customer.userId);
          if (user) {
            customer.firstName = user.firstName;
            customer.lastName = user.lastName;
            customer.photo = this.userImages[index];
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
  }

  onConfirm(): void {
    if (this.bookingForm.valid) {
      const formValue = this.bookingForm.value;
      const booking = new Booking();
      
      booking.id = this.generateBookingId();
      
      booking.customerId = formValue.customerId;
      booking.supplierId = formValue.supplierId;
      booking.serviceId = formValue.serviceId;
      
      const bookingDate = new Date(formValue.bookingDate);
      booking.bookingDate = new DateOnly();
      booking.bookingDate.year = bookingDate.getFullYear();
      booking.bookingDate.month = bookingDate.getMonth() + 1;
      booking.bookingDate.day = bookingDate.getDate() + 1;
      
      const [startHour, startMinute] = formValue.startTime.split(':').map(Number);
      booking.startTime = new TimeOnly();
      booking.startTime.hour = startHour;
      booking.startTime.minute = startMinute;
      
      const endMinutes = startMinute + formValue.durationMinutes;
      const endHour = startHour + Math.floor(endMinutes / 60);
      const finalMinutes = endMinutes % 60;
      booking.endTime = new TimeOnly();
      booking.endTime.hour = endHour;
      booking.endTime.minute = finalMinutes;
      
      booking.durationMinutes = formValue.durationMinutes;
      booking.totalPrice = formValue.totalPrice;
      booking.currency = formValue.currency;
      booking.status = formValue.status;
      booking.clientNotes = formValue.clientNotes;
      booking.providerNotes = formValue.providerNotes;
      booking.totalPrice = this.service.price;
      booking.service = this.service || new Service();
      booking.customer = this.customer || new Customer(); 
      
      booking.bookingReference = this.generateBookingReference();
      
      const now = new Date().toISOString();
      booking.createdAt = now;
      booking.updatedAt = now;
      
      if (booking.status === BookingStatus.Confirmed) {
        booking.confirmedAt = now;
      }
      console.log("booking", booking);
      
      this.hide();
      this.bookingCreated.emit(booking);
      
      this.resetForm();
    } else {
      this.markFormGroupTouched();
    }
  }

  private resetForm(): void {
    this.bookingForm.reset({
      serviceId: '',
      bookingDate: this.defaultDate,
      startTime: this.getDefaultTime(),
      durationMinutes: 60,
      totalPrice: 0,
      status: BookingStatus.Pending,
      clientNotes: '',
      providerNotes: ''
    });
  }

  onServiceChange(event: any): void {
    const serviceId = event.target.value;
    this.service = this.services.find(s => s.id === serviceId) || new Service();
  }

  onCustomerChange(event: any): void {
    const customerId = event.target.value;
    this.customer = this.customers.find(c => c.id === customerId) || new Customer();
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
}
