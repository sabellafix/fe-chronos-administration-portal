import { Component, OnInit, OnDestroy } from '@angular/core';
import { DateItem } from '@app/core/models/bussiness/calendar/dateItem';
import { Booking } from '@app/core/models/bussiness/booking';
import { BookingStatus } from '@app/core/models/bussiness/enums';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Service } from '@app/core/models/bussiness/service';
import { OffcanvasBookingService } from '@app/core/services/shared/offcanvas-booking.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-calendar-daily',
  templateUrl: './calendar-daily.component.html',
  styleUrl: './calendar-daily.component.scss'
})
export class CalendarDailyComponent implements OnInit, OnDestroy {

  dateNow: Date = new Date();
  currentDate: DateItem = new DateItem();
  bookings: Booking[] = [];
  private scrollListener?: () => void;
  private subscriptions: Subscription[] = [];

  constructor(private snackBar: MatSnackBar, private offcanvasBookingService: OffcanvasBookingService){
    this.initCurrentDate();
    this.getStaticBookings();
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
    const calendarDailyHeader = document.getElementById("calendar-daily-header");
    if (calendarDailyHeader) {
      this.scrollListener = () => {
        const scrollPosition = window.scrollY;
        if (scrollPosition >= 30) {
          calendarDailyHeader.classList.add("sticky");
        } else {
          calendarDailyHeader.classList.remove("sticky");
        }
      };
      
      window.addEventListener("scroll", this.scrollListener);
    }
  }

  initCurrentDate(): void {
    this.currentDate.date = new Date(this.dateNow);
    this.currentDate.isToday = true;
    this.currentDate.isActive = true;
  }

  navigateToDate(direction: 'prev' | 'next'): void {
    const newDate = new Date(this.currentDate.date);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    
    this.currentDate.date = newDate;
    this.currentDate.isToday = newDate.toDateString() === this.dateNow.toDateString();
  }

  getHoursRange(): number[] {
    const hours: number[] = [];
    for (let i = 7; i <= 22; i++) {
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

  openBookingModal(date: Date, hour?: number): void {
    console.log("openBookingModal");
    console.log("hour", hour);
    console.log("date", date);
    
    this.offcanvasBookingService.openBookingModal(date, hour);
  }

  onBookingCreated(booking: Booking): void {
    this.bookings.push(booking);
    this.snackBar.open('Reserva creada exitosamente', 'Cerrar', {
      duration: 3000,
      panelClass: 'snackbar-success'
    });
  }

  onBookingCancelled(): void {
    console.log('Creación de cita cancelada');
  }

  getStaticBookings(): void {
    const booking1 = new Booking();
    booking1.id = '1';
    booking1.customerId = '1';
    booking1.supplierId = 'supplier-1';
    booking1.serviceId = 'service-1';
    booking1.bookingReference = 'Haircut and Styling';
    booking1.bookingDate.year = 2025;
    booking1.bookingDate.month = 1;
    booking1.bookingDate.day = new Date().getDate();
    booking1.startTime.hour = 12;
    booking1.startTime.minute = 0;
    booking1.endTime.hour = 14;
    booking1.endTime.minute = 0;
    booking1.durationMinutes = 120;
    booking1.totalPrice = 120;
    booking1.status = BookingStatus.Pending;
    booking1.services = [new Service()];
    booking1.services[0].serviceName = 'Haircut and Styling';
    booking1.services[0].color = '#5d77a2';
    booking1.customer.photo = '../assets/images/users/user3.png';
    booking1.customer.firstName = 'Rick';
    booking1.customer.lastName = 'Sanchez';

    const booking2 = new Booking();
    booking2.id = '2';
    booking2.customerId = '2';
    booking2.supplierId = 'supplier-1';
    booking2.serviceId = 'service-1';
    booking2.bookingReference = 'Keratin Treatment';
    booking2.bookingDate.year = 2025;
    booking2.bookingDate.month = 1;
    booking2.bookingDate.day = new Date().getDate();
    booking2.startTime.hour = 8;
    booking2.startTime.minute = 0;
    booking2.endTime.hour = 10;
    booking2.endTime.minute = 0;
    booking2.durationMinutes = 120;
    booking2.totalPrice = 260;
    booking2.status = BookingStatus.Confirmed;
    booking2.services = [new Service()];
    booking2.services[0].serviceName = 'Keratin Treatment';
    booking2.services[0].color = '#6bbe60';
    booking2.customer.photo = '../assets/images/users/user5.png';
    booking2.customer.firstName = 'Morty';
    booking2.customer.lastName = 'Smith';

    const booking3 = new Booking();
    booking3.id = '3';
    booking3.customerId = '3';
    booking3.supplierId = 'supplier-1';
    booking3.serviceId = 'service-1';
    booking3.bookingReference = 'Bridal and Event Hair Styling';
    booking3.bookingDate.year = 2025;
    booking3.bookingDate.month = 1;
    booking3.bookingDate.day = new Date().getDate();
    booking3.startTime.hour = 16;
    booking3.startTime.minute = 0;
    booking3.endTime.hour = 18;
    booking3.endTime.minute = 0;
    booking3.durationMinutes = 120;
    booking3.totalPrice = 100;
    booking3.status = BookingStatus.InProgress;
    booking3.services = [new Service()];
    booking3.services[0].serviceName = 'Bridal and Event Hair Styling';
    booking3.services[0].color = '#c44f4f';
    booking3.customer.photo = '../assets/images/users/user21.png';
    booking3.customer.firstName = 'Summer';
    booking3.customer.lastName = 'Smith';

    this.bookings = [booking1, booking2, booking3];
  }

  getBookingsForDateTime(date: Date, hour: number): Booking[] {
    return this.bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate.year, booking.bookingDate.month - 1, booking.bookingDate.day);
      const bookingHour = booking.startTime.hour;
      
      return bookingDate.toDateString() === date.toDateString() && bookingHour === hour;
    });
  }

  getBookingsForDate(date: Date): Booking[] {
    return this.bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate.year, booking.bookingDate.month - 1, booking.bookingDate.day);
      return bookingDate.toDateString() === date.toDateString();
    });
  }

  hasBookings(date: Date, hour: number): boolean {
    return this.getBookingsForDateTime(date, hour).length > 0;
  }

  getBookingStatusColor(booking: Booking): string {
    switch (booking.status) {
      case BookingStatus.Pending: return '#fed485'; // Amarillo
      case BookingStatus.Confirmed: return '#a4ebbc'; // Verde
      case BookingStatus.InProgress: return '#b8d8fd'; // Azul
      case BookingStatus.Completed: return '#6c757d'; // Gris
      case BookingStatus.Cancelled: return '#dc3545'; // Rojo
      default: return '#6c757d';
    }
  }

  getCurrentDayName(): string {
    return this.currentDate.date.toLocaleString('es-ES', { weekday: 'long' });
  }

  getCurrentMonthName(): string {
    return this.currentDate.date.toLocaleString('es-ES', { month: 'long' });
  }

  getConfirmedBookingsCount(date: Date): number {
    return this.getBookingsForDate(date).filter(booking => 
      booking.status === BookingStatus.Confirmed
    ).length;
  }

  getPendingBookingsCount(date: Date): number {
    return this.getBookingsForDate(date).filter(booking => 
      booking.status === BookingStatus.Pending
    ).length;
  }

  getTotalRevenue(date: Date): number {
    return this.getBookingsForDate(date).reduce((total, booking) => 
      total + booking.totalPrice, 0
    );
  }
}
