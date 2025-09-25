import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DateItem } from '@app/core/models/bussiness/calendar/dateItem';
import { Booking } from '@app/core/models/bussiness/booking';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OffcanvasBookingService } from '@app/core/services/shared/offcanvas-booking.service';
import { BookingService } from '@app/core/services/http/booking.service';
import { Subscription } from 'rxjs';
import { TimeUtils } from '@app/core/utils/time.utils';
import { DateUtils } from '@app/core/utils/date.utils';
import { Service } from '@app/core/models/bussiness/service';
import { User } from '@app/core/models/bussiness/user';
import { UserService } from '@app/core/services/http/user.service';
import { Router } from '@angular/router';

interface StylistBookings {
  stylist: User;
  bookings: Booking[];
}

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
  @Input('users') users: User[] = [];
  dateNow: Date = new Date();
  bookings: Booking[] = [];
  bookingsFiltered: Booking[] = [];
  stylistsBookings: StylistBookings[] = [];
  allStylists: User[] = [];
  isLoadingBookings: boolean = false;
  private scrollListener?: () => void;
  private subscriptions: Subscription[] = [];
  imageUser: string = "../assets/images/user-image.jpg";

  constructor(
    private snackBar: MatSnackBar, 
    private offcanvasBookingService: OffcanvasBookingService,
    private bookingService: BookingService,
    private userService: UserService,
    private router: Router
  ){
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['date'] && !changes['date'].firstChange) {
      this.loadBookingsForCurrentDay();
    }
    if((changes['services'] && !changes['services'].firstChange) || 
       (changes['stylists'] && !changes['stylists'].firstChange)){
      this.filterBookings();
    }
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

    const bookingUpdatedSubscription = this.offcanvasBookingService.bookingUpdated$.subscribe((booking: Booking) => {
      this.onBookingUpdated(booking);
    });

    this.subscriptions.push(bookingCreatedSubscription, bookingUpdatedSubscription);
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

  openBookingModal(stylistId?: string, hour?: number): void {
    this.offcanvasBookingService.openBookingModal(this.date, hour, stylistId);
  }

  onCellClick(stylistId: string, hour: number, event: Event): void {
    const target = event.target as HTMLElement;
    const isBookingClick = target.closest('app-card-booking') !== null;
    
    if (!isBookingClick) {
      this.openBookingModal(stylistId, hour);
    }
  }

  onBookingClick(event: Event): void {
    event.stopPropagation();
  }

  onBookingCreated(booking: Booking | null): void {
    if(booking !== null){
      this.bookings.push(booking);
      const newBooking = this.bookings[this.bookings.length - 1];
      newBooking.startTime = TimeUtils.stringToTimeOnly(booking.startTime.toString());
      newBooking.endTime = TimeUtils.stringToTimeOnly(booking.endTime.toString());
      newBooking.bookingDate = DateUtils.stringToDateOnly(booking.bookingDate.toString());
      
      this.filterBookings();
      this.snackBar.open('Cita creada exitosamente', 'Cerrar', {
        duration: 3000,
        panelClass: 'snackbar-success'
      });
    }
  }

  onBookingCancelled(): void {
    console.log('Creación de cita cancelada');
  }

  editBooking(bookingId: string, event: Event): void {
    event.stopPropagation();
    
    this.offcanvasBookingService.openUpdateBookingModal(bookingId);
  }

  onBookingUpdated(booking: Booking): void {
    const index = this.bookings.findIndex(b => b.id === booking.id);
    if (index !== -1) {
      this.bookings[index] = booking;
      this.bookings[index].startTime = TimeUtils.stringToTimeOnly(booking.startTime.toString());
      this.bookings[index].endTime = TimeUtils.stringToTimeOnly(booking.endTime.toString());  
      this.bookings[index].bookingDate = DateUtils.stringToDateOnly(booking.bookingDate.toString());
    }
    
    this.groupBookingsByStylists();
    
    this.snackBar.open('Cita actualizada exitosamente', 'Cerrar', {
      duration: 3000,
      panelClass: 'snackbar-success'
    });
  }

  private loadBookingsForCurrentDay(): void {
    this.isLoadingBookings = true;

    const bookingsSubscription = this.bookingService.getByDay(this.date).subscribe({
      next: (allBookings: Booking[]) => {
        this.bookings = allBookings;
        this.bookings.map(booking => {
          booking.startTime = TimeUtils.stringToTimeOnly(booking.startTime.toString());
          booking.endTime = TimeUtils.stringToTimeOnly(booking.endTime.toString());  
          booking.bookingDate = DateUtils.stringToDateOnly(booking.bookingDate.toString());
        });

        this.allStylists = this.users;
        let usersMap = new Map<string, User>();
        this.users.forEach(user => {
          usersMap.set(user.id, user);
        });

        this.bookings.forEach(booking => {
          booking.user = usersMap.get(booking.supplierId) || new User();
        });

        this.groupBookingsByStylists();
        this.filterBookings();
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

  private groupBookingsByStylists(): void {
    const bookingsGrouped = new Map<string, Booking[]>();
    
    this.bookingsFiltered.forEach(booking => {
      if (!bookingsGrouped.has(booking.supplierId)) {
        bookingsGrouped.set(booking.supplierId, []);
      }
      bookingsGrouped.get(booking.supplierId)!.push(booking);
    });

    this.stylistsBookings = [];
    let count = 0;
    
    bookingsGrouped.forEach((bookings, supplierId) => {
      if (count < 7) {
        const stylist = this.allStylists.find(u => u.id === supplierId);
        if (stylist) {
          this.stylistsBookings.push({
            stylist: stylist,
            bookings: bookings
          });
          count++;
        }
      }
    });

    if (count < 7) {
      const stylistsWithBookings = new Set(Array.from(bookingsGrouped.keys()));
      const stylistsWithoutBookings = this.allStylists.filter(stylist => 
        !stylistsWithBookings.has(stylist.id)
      );

      for (let i = 0; i < stylistsWithoutBookings.length && count < 7; i++) {
        this.stylistsBookings.push({
          stylist: stylistsWithoutBookings[i],
          bookings: []
        });
        count++;
      }
    }
  }

  filterBookings(): void {
    let filteredBookings = this.bookings;
    
    if(this.services.length > 0){
      filteredBookings = filteredBookings.filter(booking => 
        this.services.some(service => service.serviceName === booking.services?.[0]?.serviceName)
      );
    }
    
    if(this.stylists.length > 0){
      filteredBookings = filteredBookings.filter(booking => 
        this.stylists.some(stylist => stylist.id === booking.supplierId)
      );
    }
    
    this.bookingsFiltered = filteredBookings;
    this.groupBookingsByStylists();
  }

  refreshCalendar(): void {
    this.loadBookingsForCurrentDay();
  }

  getBookingsForStylistAndHour(stylistId: string, hour: number): Booking[] {
    const stylistBookings = this.stylistsBookings.find(sb => sb.stylist.id === stylistId);
    if (!stylistBookings) return [];

    return stylistBookings.bookings.filter(booking => {
      const bookingHour = booking.startTime.hour;
      return bookingHour === hour;
    });
  }

  hasBookings(stylistId: string, hour: number): boolean {
    return this.getBookingsForStylistAndHour(stylistId, hour).length > 0;
  }

  getBookingsForStylist(stylistId: string): Booking[] {
    const stylistBookings = this.stylistsBookings.find(sb => sb.stylist.id === stylistId);
    return stylistBookings ? stylistBookings.bookings : [];
  }

  hasBookingsForStylist(stylistId: string): boolean {
    return this.getBookingsForStylist(stylistId).length > 0;
  }

  getStylistDailyTotal(stylistId: string): number {
    return this.getBookingsForStylist(stylistId)
      .reduce((total, booking) => total + (booking.totalPrice || 0), 0);
  }

  getBookingTooltip(booking: Booking): string {
    const services = booking.services?.map(s => s.serviceName).join(', ') || 'Sin servicios';
    const duration = `${booking.durationMinutes} min`;
    const price = `$${booking.totalPrice}`;
    
    return ` Servicios: ${services} | Duración: ${duration} | Precio: ${price}`;
  }

  getBookingTopPosition(booking: Booking): string {
    const minutes = booking.startTime.minute;
    const percentage = (minutes / 60) * 100;
    return `${percentage}%`;
  }

  getBookingHeight(booking: Booking): string {
    const totalMinutes = booking.durationMinutes;
    const minHeightPx = 40;
    const pixelsPerMinute = 1;
    
    let calculatedHeight = totalMinutes * pixelsPerMinute;
    
    calculatedHeight = Math.max(calculatedHeight, minHeightPx);
    
    return `${calculatedHeight}px`;
  }

  getBookingZIndex(booking: Booking, allBookingsInCell: Booking[]): number {
    const baseZIndex = 1000;
    const bookingIndex = allBookingsInCell.findIndex(b => b.id === booking.id);
    return baseZIndex + bookingIndex;
  }

  getBookingLeftOffset(booking: Booking, allBookingsInCell: Booking[]): string {
    if (allBookingsInCell.length <= 1) return '0%';
    
    const bookingIndex = allBookingsInCell.findIndex(b => b.id === booking.id);
    const offsetPercentage = (bookingIndex * 5); // 5% de offset por cada booking adicional
    
    return `${offsetPercentage}%`;
  }

  getBookingWidth(allBookingsInCell: Booking[]): string {
    if (allBookingsInCell.length <= 1) return '100%';
    
    const widthReduction = Math.min(allBookingsInCell.length * 3, 15);
    return `${100 - widthReduction}%`;
  }

  getCellBookings(stylistId: string, hour: number): Booking[] {
    return this.getBookingsForStylistAndHour(stylistId, hour);
  }

  bookingExtendsToNextHour(booking: Booking): boolean {
    const startMinutes = booking.startTime.hour * 60 + booking.startTime.minute;
    const endMinutes = startMinutes + booking.durationMinutes;
    const nextHourMinutes = (booking.startTime.hour + 1) * 60;
    
    return endMinutes > nextHourMinutes;
  }

  getBookingAdditionalHours(booking: Booking): number {
    if (booking.durationMinutes <= 60) return 0;
    
    const remainingMinutes = booking.durationMinutes - (60 - booking.startTime.minute);
    return Math.ceil(remainingMinutes / 60);
  }

  
  trackByBooking(index: number, booking: Booking): string {
    return booking.id;
  }

  trackByStylist(index: number, stylistBooking: StylistBookings): string {
    return stylistBooking.stylist.id;
  }

  getStylistFullName(stylist: User): string {
    return `${stylist.firstName} ${stylist.lastName}`.trim() || stylist.name || stylist.email;
  }

  getStylistPhoto(stylist: User): string {
    return stylist.photo || this.imageUser;
  }

  detailStylist(stylistId: string): void {
    this.router.navigate([`/users/${stylistId}/detail`]);
  }
}
