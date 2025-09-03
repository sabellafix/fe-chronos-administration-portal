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
import { BlockedTime } from '@app/core/models/bussiness/blocked-time';
import { MockBlockedTimeService } from '@app/core/services/mock/mock-blocked-time.service';

@Component({
  selector: 'app-calendar-weekly',
  templateUrl: './calendar-weekly.component.html',
  styleUrl: './calendar-weekly.component.scss'
})
export class CalendarWeeklyComponent implements OnInit, OnDestroy, OnChanges {

  @Input('date') date: Date = new Date();
  @Input('loading') loading: boolean = false;
  @Input('services') services: Service[] = [];
  @Input('stylists') stylists: User[] = [];
  @Input('users') users: User[] = [];
  
  dateNow : Date = new Date();
  dates: DateItem[] = [];
  activeDate: DateItem = new DateItem();
  bookings: Booking[] = [];
  bookingsFiltered: Booking[] = [];
  blockedTimes: BlockedTime[] = [];
  isLoadingBookings: boolean = false;
  isLoadingBlockedTimes: boolean = false;
  private scrollListener?: () => void;
  private subscriptions: Subscription[] = [];
  imageUser: string = "../assets/images/user-image.jpg";

  constructor(
    private snackBar: MatSnackBar, 
    private offcanvasBookingService: OffcanvasBookingService,
    private bookingService: BookingService,
    private userService: UserService,
    private blockedTimeService: MockBlockedTimeService
  ){
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['date'] && !changes['date'].firstChange) {
      this.updateDates();
      this.loadBookingsForCurrentWeek();
      this.loadBlockedTimesForSingleStylist();
    }
    if((changes['services'] && !changes['services'].firstChange) || 
       (changes['stylists'] && !changes['stylists'].firstChange)){
      this.filterBookings();
      this.loadBlockedTimesForSingleStylist();
    }
  }

  ngOnInit(): void {
    this.updateDates();
    this.initStickyHeader();
    this.subscribeToBookingService();
    this.loadBookingsForCurrentWeek();
    this.loadBlockedTimesForSingleStylist();
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

  private updateDates(): void {
    this.dates = this.getDates();
  }
  
  getDates(){
    const dates: DateItem[] = [];
    
    const today = new Date(this.date);
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : -(dayOfWeek - 1);
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + daysToMonday);
    
    
    for (let i = 0; i < 7; i++) {
      const dateItem = new DateItem();
      const weekDate = new Date(monday);
      weekDate.setDate(monday.getDate() + i);
      
      dateItem.date = weekDate;
      dateItem.isToday = weekDate.toDateString() === this.dateNow.toDateString();
      
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

  onCellClick(date: Date, hour: number, event: Event): void {
    const target = event.target as HTMLElement;
    const isBookingClick = target.closest('app-card-booking') !== null;
    
    if (!isBookingClick) {
      this.openBookingModal(date, hour);
    }
  }

  onBookingClick(event: Event): void {
    event.stopPropagation();
  }

  onBookingCreated(booking: Booking | null): void {
    if (booking !== null && booking.id) {
      const existingBookingIndex = this.bookings.findIndex(b => b.id === booking.id);
      
      if (existingBookingIndex === -1) {
        this.bookingService.getBooking(booking.id).subscribe({
          next: (fullBooking: Booking) => {
            fullBooking.startTime = TimeUtils.stringToTimeOnly(fullBooking.startTime.toString());
            fullBooking.endTime = TimeUtils.stringToTimeOnly(fullBooking.endTime.toString());
            fullBooking.bookingDate = DateUtils.stringToDateOnly(fullBooking.bookingDate.toString());
            
            this.bookings.push(fullBooking);
            
            this.filterBookings();
            
          },
          error: (error) => {
            console.error('Error loading full booking details:', error);
          }
        });
      } else {
        this.filterBookings();
      }
    }
  }

  onBookingCancelled(): void {
    console.log('Booking creation cancelled');
  }

  editBooking(bookingId: string, event: Event): void {
    event.stopPropagation();
    this.offcanvasBookingService.openUpdateBookingModal(bookingId);
  }

  detailBooking(bookingId: string, event: Event): void {
    event.stopPropagation();
    this.offcanvasBookingService.openDetailBookingModal(bookingId);
  }

  onBookingUpdated(booking: Booking): void {
    if (booking && booking.id) {
      const index = this.bookings.findIndex(b => b.id === booking.id);
      
      if (index !== -1) {
        this.bookingService.getBooking(booking.id).subscribe({
          next: (fullBooking: Booking) => {
            fullBooking.startTime = TimeUtils.stringToTimeOnly(fullBooking.startTime.toString());
            fullBooking.endTime = TimeUtils.stringToTimeOnly(fullBooking.endTime.toString());  
            fullBooking.bookingDate = DateUtils.stringToDateOnly(fullBooking.bookingDate.toString());
            
            this.bookings[index] = fullBooking;
            this.filterBookings();
          },
          error: (error) => {
            console.error('Error loading updated booking details:', error);
            
            const fallbackBooking = { ...booking };
            fallbackBooking.startTime = TimeUtils.stringToTimeOnly(booking.startTime.toString());
            fallbackBooking.endTime = TimeUtils.stringToTimeOnly(booking.endTime.toString());  
            fallbackBooking.bookingDate = DateUtils.stringToDateOnly(booking.bookingDate.toString());
            
            if (this.bookings[index].user && !fallbackBooking.user) {
              fallbackBooking.user = this.bookings[index].user;
            }
            
            this.bookings[index] = fallbackBooking;
            this.filterBookings();
          }
        });
      } else {
        console.warn('Booking to update not found in current list:', booking.id);
        this.onBookingCreated(booking);
      }
    }
  }

  private loadBookings(): void {
    this.isLoadingBookings = true;
    
    const bookingsSubscription = this.bookingService.getBookings().subscribe({
      next: (bookings: Booking[]) => {
        this.bookings = bookings;
        this.isLoadingBookings = false;
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.isLoadingBookings = false;
        this.snackBar.open('Error loading bookings', 'Close', {
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
        let usersMap = new Map<string, User>();
        this.users.forEach(user => {
          usersMap.set(user.id, user);
        });

        this.bookings.forEach(booking => {
          booking.user = usersMap.get(booking.supplierId) || new User();
        });

        this.filterBookings();
        this.isLoadingBookings = false;
      },
      error: (error) => {
        console.error('Error loading bookings for the week:', error);
        this.isLoadingBookings = false;
        this.snackBar.open('Error loading bookings for the week', 'Close', {
          duration: 5000,
          panelClass: 'snackbar-error'
        });
      }
    });
    this.subscriptions.push(bookingsSubscription);
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

  refreshCalendar(): void {
    this.dates = this.getDates();
    this.loadBookingsForCurrentWeek();
  }

  getBookingsForDateTime(date: Date, hour: number): Booking[] {
    return this.bookingsFiltered.filter(booking => {
      const bookingDate = new Date(booking.bookingDate.year, booking.bookingDate.month - 1, booking.bookingDate.day);
      const bookingHour = booking.startTime.hour;
      return bookingDate.toDateString() === date.toDateString() && bookingHour === hour;
    });
  }

  getBookingsForDate(date: Date): Booking[] {
    return this.bookingsFiltered.filter(booking => {
      const bookingDate = new Date(booking.bookingDate.year, booking.bookingDate.month - 1, booking.bookingDate.day);
      return bookingDate.toDateString() === date.toDateString();
    });
  }

  hasBookingsForDate(date: Date): boolean {
    return this.getBookingsForDate(date).length > 0;
  }

  getDailyTotal(date: Date): number {
    return this.getBookingsForDate(date)
      .reduce((total, booking) => total + (booking.totalPrice || 0), 0);
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
    const offsetPercentage = (bookingIndex * 5);
    
    return `${offsetPercentage}%`;
  }

  getBookingWidth(allBookingsInCell: Booking[]): string {
    if (allBookingsInCell.length <= 1) return '100%';
    
    const widthReduction = Math.min(allBookingsInCell.length * 3, 15);
    return `${100 - widthReduction}%`;
  }

  getCellBookings(date: Date, hour: number): Booking[] {
    return this.getBookingsForDateTime(date, hour);
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

  private loadBlockedTimesForSingleStylist(): void {
    if (this.stylists.length !== 1 || this.dates.length === 0) {
      this.blockedTimes = [];
      return;
    }

    const stylistId = this.stylists[0].id;
    const weekStartDate = this.dates[0].date;

    this.isLoadingBlockedTimes = true;

    const blockedTimesSubscription = this.blockedTimeService.getBlockedTimesByUserAndWeek(stylistId, weekStartDate).subscribe({
      next: (blockedTimes: BlockedTime[]) => {
        this.blockedTimes = blockedTimes;
        this.isLoadingBlockedTimes = false;      
      },
      error: (error) => {
        console.error('Error loading blocked times:', error);
        this.isLoadingBlockedTimes = false;
        this.blockedTimes = [];
        this.snackBar.open('Error al cargar los tiempos bloqueados', 'Cerrar', {
          duration: 5000,
          panelClass: 'snackbar-error'
        });
      }
    });

    this.subscriptions.push(blockedTimesSubscription);
  }

  hasBlockedTime(date: Date, hour: number): boolean {
    return this.getBlockedTimesForDateTime(date, hour).length > 0;
  }

  getBlockedTimesForDateTime(date: Date, hour: number): BlockedTime[] {
    return this.blockedTimes.filter(blockedTime => {
      const blockedDate = new Date(blockedTime.blockedDate.year, blockedTime.blockedDate.month - 1, blockedTime.blockedDate.day);
      const blockedHour = blockedTime.startTime.hour;
      return blockedDate.toDateString() === date.toDateString() && blockedHour === hour;
    });
  }

  getBlockedTimesForDate(date: Date): BlockedTime[] {
    return this.blockedTimes.filter(blockedTime => {
      const blockedDate = new Date(blockedTime.blockedDate.year, blockedTime.blockedDate.month - 1, blockedTime.blockedDate.day);
      return blockedDate.toDateString() === date.toDateString();
    });
  }

  hasBlockedTimesForDate(date: Date): boolean {
    return this.getBlockedTimesForDate(date).length > 0;
  }

  getBlockedTimeTooltip(blockedTime: BlockedTime): string {
    const timeRange = `${blockedTime.startTime.hour.toString().padStart(2, '0')}:${blockedTime.startTime.minute.toString().padStart(2, '0')} - ${blockedTime.endTime.hour.toString().padStart(2, '0')}:${blockedTime.endTime.minute.toString().padStart(2, '0')}`;
    const reason = blockedTime.reason ? ` | Motivo: ${blockedTime.reason}` : '';
    return `Tiempo bloqueado: ${timeRange}${reason}`;
  }

  getBlockedTimeTopPosition(blockedTime: BlockedTime): string {
    const minutes = blockedTime.startTime.minute;
    const percentage = (minutes / 60) * 100;
    return `${percentage}%`;
  }


  getBlockedTimeHeight(blockedTime: BlockedTime): string {
    const startMinutes = blockedTime.startTime.hour * 60 + blockedTime.startTime.minute;
    const endMinutes = blockedTime.endTime.hour * 60 + blockedTime.endTime.minute;
    const durationMinutes = endMinutes - startMinutes;
    
    const minHeightPx = 30;
    const pixelsPerMinute = 1.2;
    
    let calculatedHeight = durationMinutes * pixelsPerMinute;
    calculatedHeight = Math.max(calculatedHeight, minHeightPx);
    
    return `${calculatedHeight}px`;
  }
}
