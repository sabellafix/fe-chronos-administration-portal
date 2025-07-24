import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
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
import { DateItem } from '@app/core/models/bussiness/calendar/dateItem';
import { Service } from '@app/core/models/bussiness/service';

@Component({
  selector: 'app-bookings-supplier',
  templateUrl: './bookings-supplier.component.html',
  styleUrl: './bookings-supplier.component.scss'
})
export class BookingsSupplierComponent implements OnInit, OnDestroy, OnChanges {

  @Input('date') date: Date = new Date();
  @Input('loading') loading: boolean = false;
  @Input('services') services: Service[] = [];
  @Input('stylists') stylists: User[] = [];
  currentDate: DateItem = new DateItem();
  bookings: Booking[] = [];
  bookingsFiltered: Booking[] = [];
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['date'] && !changes['date'].firstChange) {
      this.initCurrentDate();
      this.loadBookingsForCurrentDate();
    }
    if((changes['services'] && !changes['services'].firstChange) || 
    (changes['stylists'] && !changes['stylists'].firstChange)){
   this.filterBookings();
 }
  }

  ngOnInit(): void {
    this.initCurrentDate();
    this.initStickyHeader();
    this.subscribeToBookingService();
    this.loadBookingsForCurrentDate();
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

  initBookings(): void {
    this.bookings = [];
  }

  initCurrentDate(): void {
    this.currentDate.date = new Date(this.date);
    const today = new Date();
    this.currentDate.isToday = this.currentDate.date.toDateString() === today.toDateString();
    this.currentDate.isActive = true;
  }

  loadBookingsForCurrentDate(): void {
    this.loading = true;
    
    forkJoin({
      stylists: this.userService.getUsersByRole(RolesConst._STYLIST),
      bookings: this.bookingService.getByDay(this.currentDate.date)
    }).subscribe({
      next: ({ stylists, bookings }) => {
        this.stylists = stylists;
        this.bookings = bookings;

        this.bookings.forEach(booking => {
          booking.startTime = TimeUtils.stringToTimeOnly(booking.startTime.toString());
          booking.endTime = TimeUtils.stringToTimeOnly(booking.endTime.toString());  
          booking.bookingDate = DateUtils.stringToDateOnly(booking.bookingDate.toString());
        });
        this.filterBookings();
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Error al cargar los datos', 'Cerrar', { duration: 4000 });
        this.loading = false;
        console.error('Error loading data:', error);
      }
    });
  }

  filterBookings(){
    let filteredBookings = this.bookings;
    
    if(this.services.length > 0){
      filteredBookings = filteredBookings.filter(booking => 
        this.services.some(service => service.id === booking.services?.[0]?.id)
      );
    }
    
    if(this.stylists.length > 0){
      filteredBookings = filteredBookings.filter(booking => 
        this.stylists.some(stylist => stylist.id === booking.supplierId)
      );
    }
    
    this.bookingsFiltered = filteredBookings;
  }
  getFormattedCurrentDate(): string {
    return this.currentDate.date.toLocaleDateString('es-ES', {
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
    this.offcanvasBookingService.openBookingModal(this.currentDate.date, hour);
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
    return this.bookingsFiltered.filter(booking => {
      const bookingDate = new Date(booking.bookingDate.year, booking.bookingDate.month - 1, booking.bookingDate.day);
      const bookingHour = booking.startTime.hour;
      
      return bookingDate.toDateString() == this.currentDate.date.toDateString() && 
             booking.supplierId == userId && 
             bookingHour == hour;
    });
  }

  getBookingsForStylist(userId: string): Booking[] {
    return this.bookingsFiltered.filter(booking => {
      const bookingDate = new Date(booking.bookingDate.year, booking.bookingDate.month - 1, booking.bookingDate.day);
      return bookingDate.toDateString() === this.currentDate.date.toDateString() && 
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
