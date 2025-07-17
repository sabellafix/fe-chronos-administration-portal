import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DateItem } from '@app/core/models/bussiness/calendar/dateItem';
import { Booking, BookingStatus } from '@app/core/models/bussiness';
import { OffcanvasBookingService } from '@app/core/services/shared/offcanvas-booking.service';
import { BookingService } from '@app/core/services/http/booking.service';
import { DateUtils } from '@app/core/utils/date.utils';
import { TimeUtils } from '@app/core/utils/time.utils';
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
  isLoadingBookings: boolean = false;
  private scrollListener?: () => void;
  private subscriptions: Subscription[] = [];

  constructor(
    private snackBar: MatSnackBar, 
    private offcanvasBookingService: OffcanvasBookingService,
    private bookingService: BookingService
  ){
    this.initCurrentDate();
  }

  ngOnInit(): void {
    this.initStickyHeader();
    this.subscribeToBookingService();
    this.loadBookingsForCurrentDay();
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
    
    // Cargar bookings para el nuevo día
    this.loadBookingsForCurrentDay();
  }

  getHoursRange(): number[] {
    const hours: number[] = [];
    for (let i = 7; i <= 22; i++) {
      hours.push(i);
    }
    return hours;
  }

  formatHour(hour: string): string {
    const hourNumber = parseInt(hour.split(":")[0]);
    if (hourNumber === 0) {
      return '12 am';
    } else if (hourNumber < 12) {
      return `${hourNumber} am`;
    } else if (hourNumber === 12) {
      return '12 pm';
    } else {
      return `${hourNumber} pm`;
    }
  }

  openBookingModal(date: Date, hour?: number): void {
    this.offcanvasBookingService.openBookingModal(date, hour);
  }

  onBookingCreated(booking: Booking | null): void {
    if(booking !== null){
      this.bookings.push(booking);
      this.loadBookingsForCurrentDay();
      
      this.snackBar.open('Cita creada exitosamente', 'Cerrar', {
        duration: 3000,
        panelClass: 'snackbar-success'
      });
    }
  }

  onBookingCancelled(): void {
    console.log('Creación de cita cancelada');
  }

  private loadBookingsForCurrentDay(): void {
    this.isLoadingBookings = true;

    const bookingsSubscription = this.bookingService.getByDay(this.currentDate.date).subscribe({
      next: (allBookings: Booking[]) => {
        this.bookings = allBookings;
        this.bookings.map(booking => {
          booking.startTime = TimeUtils.stringToTimeOnly(booking.startTime.toString());
          booking.endTime = TimeUtils.stringToTimeOnly(booking.endTime.toString());  
          booking.bookingDate = DateUtils.stringToDateOnly(booking.bookingDate.toString());
        });
        this.isLoadingBookings = false;
      },
      error: (error) => {
        console.error('Error al cargar bookings del día:', error);
        this.isLoadingBookings = false;
        this.snackBar.open('Error al cargar las citas del día', 'Cerrar', {
          duration: 5000,
          panelClass: 'snackbar-error'
        });
      }
    });
    this.subscriptions.push(bookingsSubscription);
  }

  refreshCalendar(): void {
    this.loadBookingsForCurrentDay();
  }

  reloadBookings(): void {
    this.loadBookingsForCurrentDay();
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

  getBookingTooltip(booking: Booking): string {
    const services = booking.services?.map(s => s.serviceName).join(', ') || 'Sin servicios';
    const duration = `${booking.durationMinutes} min`;
    const price = `$${booking.totalPrice}`;
    
    return ` Servicios: ${services} | Duración: ${duration} | Precio: ${price}`;
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
