import { Component, OnInit, OnDestroy, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DateItem } from '@app/core/models/bussiness/calendar/dateItem';
import { Booking } from '@app/core/models/bussiness/booking';
import { OffcanvasBookingService } from '@app/core/services/shared/offcanvas-booking.service';
import { Subscription } from 'rxjs';
import { BookingService } from '@app/core/services/http/booking.service';
import { TimeUtils } from '@app/core/utils/time.utils';
import { DateUtils } from '@app/core/utils/date.utils';
import { Service } from '@app/core/models/bussiness/service';
import { User } from '@app/core/models/bussiness/user';
import { UserService } from '@app/core/services/http/user.service';

@Component({
  selector: 'app-calendar-monthly',
  templateUrl: './calendar-monthly.component.html',
  styleUrl: './calendar-monthly.component.scss'
})
export class CalendarMonthlyComponent implements OnInit, OnDestroy, OnChanges {

  @Input('date') date: Date = new Date();
  @Input('loading') loading: boolean = false;
  @Input('services') services: Service[] = [];
  @Input('stylists') stylists: User[] = [];
  dateNow: Date = new Date(); 
  currentMonth: Date = new Date();
  monthDays: DateItem[][] = [];
  daysOfWeek: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  bookings: Booking[] = [];
  bookingsFiltered: Booking[] = [];
  isLoadingBookings: boolean = false;
  private scrollListener?: () => void;
  private subscriptions: Subscription[] = [];

  constructor(private snackBar: MatSnackBar, 
              private offcanvasBookingService: OffcanvasBookingService, 
              private bookingService: BookingService,
              private userService: UserService) {
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['date'] && !changes['date'].firstChange) {
      this.updateCurrentMonth();
      this.generateMonthDays();
      this.loadBookingsForCurrentMoenth();
    }
    if((changes['services'] && !changes['services'].firstChange) || 
       (changes['stylists'] && !changes['stylists'].firstChange)){
      this.filterBookings();
    }
  }

  ngOnInit(): void {
    this.updateCurrentMonth();
    this.generateMonthDays();
    this.loadBookingsForCurrentMoenth();
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
    const calendarMonthlyHeader = document.getElementById("calendar-monthly-header");
    if (calendarMonthlyHeader) {
      this.scrollListener = () => {
        const scrollPosition = window.scrollY;
        if (scrollPosition >= 30) {
          calendarMonthlyHeader.classList.add("sticky");
        } else {
          calendarMonthlyHeader.classList.remove("sticky");
        }
      };
      
      window.addEventListener("scroll", this.scrollListener);
    }
  }

  private updateCurrentMonth(): void {
    this.currentMonth = new Date(this.date.getFullYear(), this.date.getMonth(), 1);
  }
  
  generateMonthDays(): void {
    const weeks: DateItem[][] = [];
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);
    
    const firstDayOfWeek = startOfMonth.getDay();
    const daysToSubtract = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - daysToSubtract);

    const totalDaysToShow = Math.ceil((daysToSubtract + endOfMonth.getDate()) / 7) * 7;
    const weeksNeeded = Math.max(5, Math.ceil(totalDaysToShow / 7));
    
    const currentDate = new Date(startDate);
    for (let week = 0; week < weeksNeeded; week++) {
      const weekDays: DateItem[] = [];
      
      for (let day = 0; day < 7; day++) {
        const dateItem = new DateItem();
        dateItem.date = new Date(currentDate);
        dateItem.isToday = this.isSameDate(currentDate, this.dateNow);
        
        const currentDateMonth = currentDate.getMonth();
        const currentDateYear = currentDate.getFullYear();
        
        dateItem.isCurrentMonth = (currentDateMonth === month && currentDateYear === year);
        dateItem.isPreviousMonth = (currentDateYear < year) || 
                                  (currentDateYear === year && currentDateMonth < month);
        dateItem.isNextMonth = (currentDateYear > year) || 
                              (currentDateYear === year && currentDateMonth > month);
        
        dateItem.isDisabled = !dateItem.isCurrentMonth;
        
        weekDays.push(dateItem);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      weeks.push(weekDays);
    }
    
    while (weeks.length < 5) {
      const lastWeek = weeks[weeks.length - 1];
      const nextWeekStart = new Date(lastWeek[6].date);
      nextWeekStart.setDate(nextWeekStart.getDate() + 1);
      
      const weekDays: DateItem[] = [];
      const currentDate = new Date(nextWeekStart);
      
      for (let day = 0; day < 7; day++) {
        const dateItem = new DateItem();
        dateItem.date = new Date(currentDate);
        dateItem.isToday = this.isSameDate(currentDate, this.dateNow);
        
        const currentDateMonth = currentDate.getMonth();
        const currentDateYear = currentDate.getFullYear();
        
        dateItem.isCurrentMonth = (currentDateMonth === month && currentDateYear === year);
        dateItem.isPreviousMonth = (currentDateYear < year) || 
                                  (currentDateYear === year && currentDateMonth < month);
        dateItem.isNextMonth = (currentDateYear > year) || 
                              (currentDateYear === year && currentDateMonth > month);
        dateItem.isDisabled = !dateItem.isCurrentMonth;
        
        weekDays.push(dateItem);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      weeks.push(weekDays);
    }
    
    this.monthDays = weeks;
  }

  private isSameDate(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  navigateMonth(direction: number): void {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + direction);
    this.generateMonthDays();
  }

  getMonthYear(): string {
    return this.currentMonth.toLocaleDateString('es-ES', { 
      month: 'long', 
      year: 'numeric' 
    });
  }

  openBookingModal(date: Date): void {
    this.offcanvasBookingService.openBookingModal(date);
  }

  onBookingCreated(booking: Booking): void {
    this.bookings.push(booking);
    this.snackBar.open('Booking created successfully', 'Close', {
      duration: 3000,
      panelClass: 'snackbar-success'
    });
  }

  onBookingCancelled(): void {
    console.log('Booking cancelled');
  }

  private loadBookingsForCurrentMoenth(): void {
    this.isLoadingBookings = true;
    const month = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);

    const bookingsSubscription = this.bookingService.getByMonth(month).subscribe({
      next: (allBookings: Booking[]) => {
        this.bookings = allBookings;
        this.bookings.map(booking => {
          booking.startTime = TimeUtils.stringToTimeOnly(booking.startTime.toString());
          booking.endTime = TimeUtils.stringToTimeOnly(booking.endTime.toString());  
          booking.bookingDate = DateUtils.stringToDateOnly(booking.bookingDate.toString());          
        });

        this.userService.getUsers().subscribe({
          next: (users: User[]) => {
            let usersMap = new Map<string, User>();
            users.forEach(user => {
              usersMap.set(user.id, user);
            });

            this.bookings.forEach(booking => {
              booking.user = usersMap.get(booking.supplierId) || new User();
            });

            this.filterBookings();
            this.isLoadingBookings = false;

          }
        });

        
      },
      error: (error) => {
        console.error('Error loading bookings for the month:', error);
        this.isLoadingBookings = false;
        this.snackBar.open('Error loading bookings for the month', 'Close', {
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

  getBookingsForDate(date: Date): Booking[] {
    return this.bookingsFiltered.filter(booking => {
      const bookingDate = new Date(booking.bookingDate.year, booking.bookingDate.month - 1, booking.bookingDate.day);
      return this.isSameDate(bookingDate, date);
    });
  }

  hasBookings(date: Date): boolean {
    return this.getBookingsForDate(date).length > 0;
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
      return `${hourNumber - 12} pm`;
    }
  }

  getBookingTooltip(booking: Booking): string {
    const customerName = `${booking.customer.firstName} ${booking.customer.lastName}`;
    // const timeRange = `${this.formatHour(booking.startTime)} - ${this.formatHour(booking.endTime)}`;
    const services = booking.services?.map(s => s.serviceName).join(', ') || 'Sin servicios';
    const duration = `${booking.durationMinutes} min`;
    const price = `$${booking.totalPrice}`;
    
    // return `Cliente: ${customerName} | ${timeRange} | Servicios: ${services} | Duración: ${duration} | Precio: ${price}`;
    return ` Servicios: ${services} | Duración: ${duration} | Precio: ${price}`;
  }

  // Métodos trackBy para optimizar el rendimiento de Angular
  trackByWeek(index: number, week: DateItem[]): any {
    return week[0]?.date.getTime() || index;
  }

  trackByDay(index: number, dayItem: DateItem): any {
    return dayItem.date.getTime();
  }

  trackByBooking(index: number, booking: Booking): any {
    return booking.id;
  }

  isToday(dayName: string): boolean {
    const today = new Date().toLocaleString('en-US', { weekday: 'long' });
    if(dayName.toLowerCase() == today.toLowerCase()){
      return true;
    }

    return false;
  } 
}

