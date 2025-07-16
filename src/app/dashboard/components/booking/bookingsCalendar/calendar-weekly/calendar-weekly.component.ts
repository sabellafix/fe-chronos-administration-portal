import { Component, OnInit, OnDestroy } from '@angular/core';
import { DateItem } from '@app/core/models/bussiness/calendar/dateItem';
import { Booking } from '@app/core/models/bussiness/booking';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OffcanvasBookingService } from '@app/core/services/shared/offcanvas-booking.service';
import { BookingService } from '@app/core/services/http/booking.service';
import { Subscription } from 'rxjs';
import { TimeUtils } from '@app/core/utils/time.utils';
import { DateUtils } from '@app/core/utils/date.utils';

@Component({
  selector: 'app-calendar-weekly',
  templateUrl: './calendar-weekly.component.html',
  styleUrl: './calendar-weekly.component.scss'
})
export class CalendarWeeklyComponent implements OnInit, OnDestroy {

  dateNow : Date = new Date();
  dates: DateItem[] = [];
  activeDate: DateItem = new DateItem();
  bookings: Booking[] = [];
  isLoadingBookings: boolean = false;
  private scrollListener?: () => void;
  private subscriptions: Subscription[] = [];
  imageUser: string = "../assets/images/user-image.jpg";

  constructor(
    private snackBar: MatSnackBar, 
    private offcanvasBookingService: OffcanvasBookingService,
    private bookingService: BookingService
  ){
    this.dates = this.getDates();
  }

  ngOnInit(): void {
    this.initStickyHeader();
    this.subscribeToBookingService();
    this.loadBookingsForCurrentWeek();
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
  
  getDates(){
    const dates: DateItem[] = [];
    
    const today = new Date(this.dateNow);
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : -(dayOfWeek - 1);
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + daysToMonday);
    
    
    for (let i = 0; i < 7; i++) {
      const dateItem = new DateItem();
      const weekDate = new Date(monday);
      weekDate.setDate(monday.getDate() + i);
      
      dateItem.date = weekDate;
      dateItem.isToday = weekDate.toDateString() === today.toDateString();
      
      dates.push(dateItem);
    }
    
    return dates;
  } 

  setActiveDate(date: DateItem = new DateItem()   ){
    this.dates.forEach(date => date.isActive = false);
    date.isActive = true;
    this.activeDate = date;
  }

  getHoursRange(): number[] {
    const hours: number[] = [];
    for (let i = 6; i <= 22; i++) {
      hours.push(i);
    }
    return hours;
  }

  formatHour(hour: string): string {
    const hourNumber = parseInt(hour.split(":")[0]);
    if (hourNumber === 0) {
      return '12 am';
    } else if (hourNumber < 12) {
      return `${hour} am`;
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
      this.loadBookingsForCurrentWeek();
      
      this.snackBar.open('Cita creada exitosamente', 'Cerrar', {
        duration: 3000,
        panelClass: 'snackbar-success'
      });
    }
  }

  onBookingCancelled(): void {
    console.log('Creación de cita cancelada');
  }

  private loadBookings(): void {
    this.isLoadingBookings = true;
    
    const bookingsSubscription = this.bookingService.getBookings().subscribe({
      next: (bookings: Booking[]) => {
        this.bookings = bookings;
        this.isLoadingBookings = false;
      },
      error: (error) => {
        console.error('Error al cargar bookings:', error);
        this.isLoadingBookings = false;
        this.snackBar.open('Error al cargar las citas', 'Cerrar', {
          duration: 5000,
          panelClass: 'snackbar-error'
        });
      }
    });

    this.subscriptions.push(bookingsSubscription);
  }

  reloadBookings(): void {
    this.loadBookings();
  }

  private loadBookingsForCurrentWeek(): void {
    if (this.dates.length === 0) return;
    this.isLoadingBookings = true;

    const bookingsSubscription = this.bookingService.getByWeek(this.dates[0].date).subscribe({
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
        console.error('Error al cargar bookings de la semana:', error);
        this.isLoadingBookings = false;
        this.snackBar.open('Error al cargar las citas de la semana', 'Cerrar', {
          duration: 5000,
          panelClass: 'snackbar-error'
        });
      }
    });
    this.subscriptions.push(bookingsSubscription);
  }

  refreshCalendar(): void {
    this.dates = this.getDates();
    this.loadBookingsForCurrentWeek();
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


  getBookingTooltip(booking: Booking): string {
    // const customerName = `${booking.customer.firstName} ${booking.customer.lastName}`;
    // const timeRange = `${booking.startTime | date:'H'}} - ${booking.endTime | date:'H'}}`;
    const services = booking.services?.map(s => s.serviceName).join(', ') || 'Sin servicios';
    const duration = `${booking.durationMinutes} min`;
    const price = `$${booking.totalPrice}`;
    
    // return `Cliente: ${customerName} | ${timeRange} | Servicios: ${services} | Duración: ${duration} | Precio: ${price}`;
    // return `${timeRange} | Servicios: ${services} | Duración: ${duration} | Precio: ${price}`;
    return ` Servicios: ${services} | Duración: ${duration} | Precio: ${price}`;
  }
}
