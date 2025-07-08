import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DateItem } from '@app/core/models/bussiness/calendar/dateItem';
import { Booking } from '@app/core/models/bussiness/booking';
import { BookingStatus } from '@app/core/models/bussiness/enums';
import { OffcanvasCreateBookingComponent } from '../../../shared/offcanvas/offcanvas-create-booking/offcanvas-create-booking.component';
import { OffcanvasBookingService } from '@app/core/services/shared/offcanvas-booking.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-calendar-monthly',
  templateUrl: './calendar-monthly.component.html',
  styleUrl: './calendar-monthly.component.scss'
})
export class CalendarMonthlyComponent implements OnInit, OnDestroy {

  @ViewChild(OffcanvasCreateBookingComponent) offcanvasCreateBooking!: OffcanvasCreateBookingComponent;

  dateNow: Date = new Date();
  currentMonth: Date = new Date();
  monthDays: DateItem[][] = [];
  daysOfWeek: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  bookings: Booking[] = [];
  private scrollListener?: () => void;
  private subscriptions: Subscription[] = [];

  constructor(private snackBar: MatSnackBar, private offcanvasBookingService: OffcanvasBookingService) {
    this.currentMonth = new Date(this.dateNow.getFullYear(), this.dateNow.getMonth(), 1);
    this.generateMonthDays();
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
    
    while (weeks.length < 6) {
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
    const dateMonth = date.getMonth();
    const dateYear = date.getFullYear();
    const currentMonth = this.currentMonth.getMonth();
    const currentYear = this.currentMonth.getFullYear();
    
    if (dateMonth === currentMonth && dateYear === currentYear) {
      this.offcanvasBookingService.openBookingModal(date);
    }
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
    booking1.bookingReference = 'Haircut and Styling Package';
    booking1.bookingDate.year = this.currentMonth.getFullYear();
    booking1.bookingDate.month = this.currentMonth.getMonth() + 1;
    booking1.bookingDate.day = 8;
    booking1.startTime.hour = 12;
    booking1.startTime.minute = 0;
    booking1.endTime.hour = 14;
    booking1.endTime.minute = 30;
    booking1.durationMinutes = 150;
    booking1.totalPrice = 180;
    booking1.currency = 'USD';
    booking1.status = BookingStatus.Pending;
    booking1.customer.photo = '../assets/images/users/user3.png';
    booking1.customer.firstName = 'Rick';
    booking1.customer.lastName = 'Sanchez';
    
    booking1.bookingServices = [
      { bookingId: '1', serviceId: 'service-1', order: 1, durationInMinutes: 60 },
      { bookingId: '1', serviceId: 'service-2', order: 2, durationInMinutes: 45 },
      { bookingId: '1', serviceId: 'service-3', order: 3, durationInMinutes: 45 }
    ];
    
    booking1.services = [
      {
        id: 'service-1', providerId: 'supplier-1', categoryId: 1,
        serviceName: 'Haircut', serviceDescription: 'Professional haircut service',
        durationMinutes: 60, price: 80, color: '#5d77a2', currency: 'USD',
        isActive: true, createdAt: '', updatedAt: '', category: null as any, provider: null as any
      },
      {
        id: 'service-2', providerId: 'supplier-1', categoryId: 1,
        serviceName: 'Hair Styling', serviceDescription: 'Professional hair styling',
        durationMinutes: 45, price: 60, color: '#5d77a2', currency: 'USD',
        isActive: true, createdAt: '', updatedAt: '', category: null as any, provider: null as any
      },
      {
        id: 'service-3', providerId: 'supplier-1', categoryId: 1,
        serviceName: 'Hair Wash', serviceDescription: 'Premium hair wash and conditioning',
        durationMinutes: 45, price: 40, color: '#5d77a2', currency: 'USD',
        isActive: true, createdAt: '', updatedAt: '', category: null as any, provider: null as any
      }
    ];

    // Booking 2: Servicio único
    const booking2 = new Booking();
    booking2.id = '2';
    booking2.customerId = '2';
    booking2.supplierId = 'supplier-1';
    booking2.serviceId = 'service-4';
    booking2.bookingReference = 'Keratin Treatment';
    booking2.bookingDate.year = this.currentMonth.getFullYear();
    booking2.bookingDate.month = this.currentMonth.getMonth() + 1;
    booking2.bookingDate.day = 22;
    booking2.startTime.hour = 8;
    booking2.startTime.minute = 0;
    booking2.endTime.hour = 10;
    booking2.endTime.minute = 0;
    booking2.durationMinutes = 120;
    booking2.totalPrice = 260;
    booking2.currency = 'USD';
    booking2.status = BookingStatus.Confirmed;
    booking2.customer.photo = '../assets/images/users/user5.png';
    booking2.customer.firstName = 'Morty';
    booking2.customer.lastName = 'Smith';
    
    booking2.bookingServices = [
      { bookingId: '2', serviceId: 'service-4', order: 1, durationInMinutes: 120 }
    ];
    
    booking2.services = [
      {
        id: 'service-4', providerId: 'supplier-1', categoryId: 2,
        serviceName: 'Keratin Treatment', serviceDescription: 'Professional keratin hair treatment',
        durationMinutes: 120, price: 260, color: '#6bbe60', currency: 'USD',
        isActive: true, createdAt: '', updatedAt: '', category: null as any, provider: null as any
      }
    ];

    // Booking 3: Múltiples servicios de evento
    const booking3 = new Booking();
    booking3.id = '3';
    booking3.customerId = '3';
    booking3.supplierId = 'supplier-1';
    booking3.serviceId = 'service-5';
    booking3.bookingReference = 'Bridal Hair & Makeup Package';
    booking3.bookingDate.year = this.currentMonth.getFullYear();
    booking3.bookingDate.month = this.currentMonth.getMonth() + 1;
    booking3.bookingDate.day = 8;
    booking3.startTime.hour = 8;
    booking3.startTime.minute = 0;
    booking3.endTime.hour = 11;
    booking3.endTime.minute = 0;
    booking3.durationMinutes = 180;
    booking3.totalPrice = 350;
    booking3.currency = 'USD';
    booking3.status = BookingStatus.InProgress;
    booking3.customer.photo = '../assets/images/users/user21.png';
    booking3.customer.firstName = 'Summer';
    booking3.customer.lastName = 'Smith';
    
    booking3.bookingServices = [
      { bookingId: '3', serviceId: 'service-5', order: 1, durationInMinutes: 90 },
      { bookingId: '3', serviceId: 'service-6', order: 2, durationInMinutes: 60 },
      { bookingId: '3', serviceId: 'service-7', order: 3, durationInMinutes: 30 }
    ];
    
    booking3.services = [
      {
        id: 'service-5', providerId: 'supplier-1', categoryId: 3,
        serviceName: 'Bridal Hair Styling', serviceDescription: 'Elegant bridal hair styling',
        durationMinutes: 90, price: 150, color: '#c44f4f', currency: 'USD',
        isActive: true, createdAt: '', updatedAt: '', category: null as any, provider: null as any
      },
      {
        id: 'service-6', providerId: 'supplier-1', categoryId: 3,
        serviceName: 'Bridal Makeup', serviceDescription: 'Professional bridal makeup',
        durationMinutes: 60, price: 120, color: '#c44f4f', currency: 'USD',
        isActive: true, createdAt: '', updatedAt: '', category: null as any, provider: null as any
      },
      {
        id: 'service-7', providerId: 'supplier-1', categoryId: 3,
        serviceName: 'Final Touch-up', serviceDescription: 'Final hair and makeup touch-up',
        durationMinutes: 30, price: 80, color: '#c44f4f', currency: 'USD',
        isActive: true, createdAt: '', updatedAt: '', category: null as any, provider: null as any
      }
    ];

    this.bookings = [booking1, booking2, booking3];
  }

  getBookingsForDate(date: Date): Booking[] {
    return this.bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate.year, booking.bookingDate.month - 1, booking.bookingDate.day);
      return this.isSameDate(bookingDate, date);
    });
  }

  hasBookings(date: Date): boolean {
    return this.getBookingsForDate(date).length > 0;
  }

  formatHour(hour: number): string {
    if (hour === 0) {
      return '12 am';
    } else if (hour < 12) {
      return `${hour} am`;
    } else if (hour === 12) {
      return '12 pm';
    } else {
      return `${hour - 12} pm`;
    }
  }

  getBookingTooltip(booking: Booking): string {
    const customerName = `${booking.customer.firstName} ${booking.customer.lastName}`;
    const timeRange = `${this.formatHour(booking.startTime.hour)} - ${this.formatHour(booking.endTime.hour)}`;
    const services = booking.services?.map(s => s.serviceName).join(', ') || 'Sin servicios';
    const duration = `${booking.durationMinutes} min`;
    const price = `$${booking.totalPrice}`;
    
    return `Cliente: ${customerName} | ${timeRange} | Servicios: ${services} | Duración: ${duration} | Precio: ${price}`;
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

