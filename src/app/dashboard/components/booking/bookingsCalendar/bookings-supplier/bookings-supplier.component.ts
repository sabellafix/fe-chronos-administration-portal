import { Component, OnInit, OnDestroy } from '@angular/core';
import { DateItem } from '@app/core/models/bussiness/calendar/dateItem';
import { Booking } from '@app/core/models/bussiness/booking';
import { BookingStatus } from '@app/core/models/bussiness/enums';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OffcanvasBookingService } from '@app/core/services/shared/offcanvas-booking.service';
import { Subscription } from 'rxjs';

interface Supplier {
  id: string;
  companyName: string;
  businessDescription?: string;
  rating?: number;
  isVerified?: boolean;
}

@Component({
  selector: 'app-bookings-supplier',
  templateUrl: './bookings-supplier.component.html',
  styleUrl: './bookings-supplier.component.scss'
})
export class BookingsSupplierComponent implements OnInit, OnDestroy {

  currentDate: Date = new Date();
  suppliers: Supplier[] = [];
  bookings: Booking[] = [];
  private scrollListener?: () => void;
  private subscriptions: Subscription[] = [];

  constructor(private snackBar: MatSnackBar, private offcanvasBookingService: OffcanvasBookingService){
    this.getUniqueSuppliers();
  }

  ngOnInit(): void {
    this.initStickyHeader();
    this.subscribeToBookingService();
  }

  ngOnDestroy(): void {
    if (this.scrollListener) {
      window.removeEventListener("scroll", this.scrollListener);
    }
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  private subscribeToBookingService(): void {
    const bookingCreatedSubscription = this.offcanvasBookingService.bookingCreated$.subscribe((booking: Booking) => {
      this.onBookingCreated(booking);
    });

    this.subscriptions.push(bookingCreatedSubscription);
  }

  private initStickyHeader(): void {
    const calendarWeeklyHeader = document.getElementById("calendar-weekly-header");
    if (calendarWeeklyHeader) {
      this.scrollListener = () => {
        const scrollPosition = window.scrollY;
        if (scrollPosition >= 30) {
          calendarWeeklyHeader.classList.add("sticky");
        } else {
          calendarWeeklyHeader.classList.remove("sticky");
        }
      };
      
      window.addEventListener("scroll", this.scrollListener);
    }
  }

  getUniqueSuppliers(): void {
    const supplierMap = new Map<string, Supplier>();
    
    this.bookings.forEach(booking => {
      if (!supplierMap.has(booking.supplierId)) {
       
      }
    });
    
    this.suppliers = Array.from(supplierMap.values());
  }

  changeDate(days: number): void {
    const newDate = new Date(this.currentDate);
    newDate.setDate(newDate.getDate() + days);
    this.currentDate = newDate;
  }

  goToToday(): void {
    this.currentDate = new Date();
  }

  getFormattedCurrentDate(): string {
    return this.currentDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getHoursRange(): number[] {
    const hours: number[] = [];
    for (let i = 6; i <= 22; i++) {
      hours.push(i);
    }
    return hours;
  }

  formatHour(hour: number): string {
    if (hour === 0) {
      return '12 am';
    } else if (hour < 12) {
      return `${hour} am`;
    } else if (hour === 12) {
      return '12 pm';
    } else {
      return `${hour} pm`;
    }
  }

  openBookingModal(supplierId: string, hour?: number): void {
    this.offcanvasBookingService.openBookingModal(this.currentDate, hour);
  }

  onBookingCreated(booking: Booking): void {
    this.bookings.push(booking);
    this.getUniqueSuppliers(); // Actualizar lista de proveedores
    this.snackBar.open('Booking created successfully', 'Cerrar', {
      duration: 3000,
      panelClass: 'snackbar-success'
    });
  }

  onBookingCancelled(): void {
    console.log('Creación de cita cancelada');
  }



  getBookingsForSupplierAndHour(supplierId: string, hour: number): Booking[] {
    return this.bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate.year, booking.bookingDate.month - 1, booking.bookingDate.day);
      const bookingHour = booking.startTime.hour;
      
      return bookingDate.toDateString() === this.currentDate.toDateString() && 
             booking.supplierId === supplierId && 
             bookingHour === hour;
    });
  }

  getBookingsForSupplier(supplierId: string): Booking[] {
    return this.bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate.year, booking.bookingDate.month - 1, booking.bookingDate.day);
      return bookingDate.toDateString() === this.currentDate.toDateString() && 
             booking.supplierId === supplierId;
    });
  }

  hasBookings(supplierId: string, hour: number): boolean {
    return this.getBookingsForSupplierAndHour(supplierId, hour).length > 0;
  }

  getBookingTooltip(booking: Booking): string {
    const customerName = `${booking.customer.firstName} ${booking.customer.lastName}`;
    const timeRange = `${this.formatHour(booking.startTime.hour)} - ${this.formatHour(booking.endTime.hour)}`;
    const services = booking.services?.map(s => s.serviceName).join(', ') || 'Sin servicios';
    const duration = `${booking.durationMinutes} min`;
    const price = `$${booking.totalPrice}`;
    
    return `Cliente: ${customerName} | ${timeRange} | Servicios: ${services} | Duración: ${duration} | Precio: ${price}`;
  }
}
