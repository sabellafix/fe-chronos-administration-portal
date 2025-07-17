import { Component, OnInit, OnDestroy } from '@angular/core';
import { Booking } from '@app/core/models/bussiness/booking';
import { BookingStatus } from '@app/core/models/bussiness/enums';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OffcanvasBookingService } from '@app/core/services/shared/offcanvas-booking.service';
import { BookingService } from '@app/core/services/http/booking.service';
import { UserService } from '@app/core/services/http/user.service';
import { User } from '@app/core/models/bussiness/user';
import { RolesConst } from '@app/core/models/constants/roles.const';
import { Subscription } from 'rxjs';
import { forkJoin } from 'rxjs';
import { TimeUtils } from '@app/core/utils/time.utils';
import { DateUtils } from '@app/core/utils/date.utils';

@Component({
  selector: 'app-bookings-supplier',
  templateUrl: './bookings-supplier.component.html',
  styleUrl: './bookings-supplier.component.scss'
})
export class BookingsSupplierComponent implements OnInit, OnDestroy {

  currentDate: Date = new Date();
  stylists: User[] = [];
  bookings: Booking[] = [];
  loading: boolean = false;
  private scrollListener?: () => void;
  private subscriptions: Subscription[] = [];
  imageUser: string = "../assets/images/user-image.jpg";

  constructor(
    private snackBar: MatSnackBar, 
    private offcanvasBookingService: OffcanvasBookingService,
    private bookingService: BookingService,
    private userService: UserService
  ){
    
  }

  ngOnInit(): void {
    this.initStickyHeader();
    this.subscribeToBookingService();
    this.loadData();
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

  loadData(): void {
    this.loading = true;
    
    forkJoin({
      stylists: this.userService.getUsersByRole(RolesConst._STYLIST),
      bookings: this.bookingService.getByDay(this.currentDate)
    }).subscribe({
      next: ({ stylists, bookings }) => {
        this.stylists = stylists;
        this.bookings = bookings;

        this.bookings.forEach(booking => {
          booking.startTime = TimeUtils.stringToTimeOnly(booking.startTime.toString());
          booking.endTime = TimeUtils.stringToTimeOnly(booking.endTime.toString());  
          booking.bookingDate = DateUtils.stringToDateOnly(booking.bookingDate.toString());
        });
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Error al cargar los datos', 'Cerrar', { duration: 4000 });
        this.loading = false;
        console.error('Error loading data:', error);
      }
    });
  }

  changeDate(days: number): void {
    const newDate = new Date(this.currentDate);
    newDate.setDate(newDate.getDate() + days);
    this.currentDate = newDate;
    this.loadBookingsForCurrentDate();
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.loadBookingsForCurrentDate();
  }

  private loadBookingsForCurrentDate(): void {
    this.loading = true;
    this.bookingService.getByDay(this.currentDate).subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        console.log("bookings", this.bookings);
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Error al cargar las reservas', 'Cerrar', { duration: 4000 });
        this.loading = false;
        console.error('Error loading bookings:', error);
      }
    });
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

  openBookingModal(userId: string, hour?: number): void {
    this.offcanvasBookingService.openBookingModal(this.currentDate, hour);
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

  getBookingsForStylistAndHour(userId: string, hour: number): Booking[] {
    return this.bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate.year, booking.bookingDate.month - 1, booking.bookingDate.day);
      const bookingHour = booking.startTime.hour;
      
      return bookingDate.toDateString() == this.currentDate.toDateString() && 
             booking.supplierId == userId && 
             bookingHour == hour;
    });
  }

  getBookingsForStylist(userId: string): Booking[] {
    return this.bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate.year, booking.bookingDate.month - 1, booking.bookingDate.day);
      return bookingDate.toDateString() === this.currentDate.toDateString() && 
             booking.supplierId === userId;
    });
  }

  getStylistExistInBookings(stylists: User[]): User[] {
    return stylists.filter(stylist => this.getBookingsForStylist(stylist.id).length > 0);
  }

  hasBookings(userId: string, hour: number): boolean {
    return this.getBookingsForStylistAndHour(userId, hour).length > 0;
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
    
    return `Servicios: ${services} | Duración: ${duration} | Precio: ${price}`;
  }

  getStylistFullName(stylist: User): string {
    return `${stylist.firstName} ${stylist.lastName}`;
  }

  getConfirmedBookingsCount(userId: string): number {
    return this.getBookingsForStylist(userId).filter(booking => 
      booking.status === BookingStatus.Confirmed
    ).length;
  }

  getPendingBookingsCount(userId: string): number {
    return this.getBookingsForStylist(userId).filter(booking => 
      booking.status === BookingStatus.Pending
    ).length;
  }

  getTotalRevenue(userId: string): number {
    return this.getBookingsForStylist(userId).reduce((total, booking) => 
      total + booking.totalPrice, 0
    );
  }
}
