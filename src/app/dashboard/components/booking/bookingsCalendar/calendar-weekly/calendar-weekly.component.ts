import { Component, OnInit, OnDestroy } from '@angular/core';
import { DateItem } from '@app/core/models/bussiness/calendar/dateItem';
import { Booking } from '@app/core/models/bussiness/booking';
import { BookingStatus } from '@app/core/models/bussiness/enums';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OffcanvasBookingService } from '@app/core/services/shared/offcanvas-booking.service';
import { Subscription } from 'rxjs';
import { Service } from '@app/core/models/bussiness/service';

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
  private scrollListener?: () => void;
  private subscriptions: Subscription[] = [];

  constructor(private snackBar: MatSnackBar, private offcanvasBookingService: OffcanvasBookingService){
    this.dates = this.getDates();
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
    this.snackBar.open('Booking created successfully', 'Cerrar', {
      duration: 3000,
     
      panelClass: 'snackbar-success'
    });
  
  }

  onBookingCancelled(): void {
    console.log('Creación de cita cancelada');
  }

  getStaticBookings(){
    // Booking 1: Múltiples servicios de peluquería
    const booking1 = new Booking();
    booking1.id = '1';
    booking1.customerId = '1';
    booking1.supplierId = 'supplier-1';
    booking1.serviceId = 'service-1'; // Servicio principal
    booking1.bookingReference = 'Haircut and Styling Package';
    booking1.bookingDate.year = 2025;
    booking1.bookingDate.month = 7;
    booking1.bookingDate.day = 1;
    booking1.startTime.hour = 12;
    booking1.startTime.minute = 0;
    booking1.endTime.hour = 14;
    booking1.endTime.minute = 30;
    booking1.durationMinutes = 150; // Total de múltiples servicios
    booking1.totalPrice = 180; // Precio total combinado
    booking1.currency = 'USD';
    booking1.status = BookingStatus.Pending;
    booking1.customer.photo = '../assets/images/users/user3.png';
    booking1.customer.firstName = 'Rick';
    booking1.customer.lastName = 'Sanchez';
    
    // Servicios asociados al booking
    booking1.bookingServices = [
      {
        bookingId: '1',
        serviceId: 'service-1',
        order: 1,
        durationInMinutes: 60
      },
      {
        bookingId: '1',
        serviceId: 'service-2',
        order: 2,
        durationInMinutes: 45
      },
      {
        bookingId: '1',
        serviceId: 'service-3',
        order: 3,
        durationInMinutes: 45
      }
    ];
    
    // Información completa de los servicios
    booking1.services = [
      {
        id: 'service-1',
        providerId: 'supplier-1',
        categoryId: 1,
        serviceName: 'Haircut',
        serviceDescription: 'Professional haircut service',
        durationMinutes: 60,
        price: 80,
        color: '#5d77a2',
        currency: 'USD',
        isActive: true,
        createdAt: '',
        updatedAt: '',
        category: null as any,
        provider: null as any
      },
      {
        id: 'service-2',
        providerId: 'supplier-1',
        categoryId: 1,
        serviceName: 'Hair Styling',
        serviceDescription: 'Professional hair styling',
        durationMinutes: 45,
        price: 60,
        color: '#5d77a2',
        currency: 'USD',
        isActive: true,
        createdAt: '',
        updatedAt: '',
        category: null as any,
        provider: null as any
      },
      {
        id: 'service-3',
        providerId: 'supplier-1',
        categoryId: 1,
        serviceName: 'Hair Wash',
        serviceDescription: 'Premium hair wash and conditioning',
        durationMinutes: 45,
        price: 40,
        color: '#5d77a2',
        currency: 'USD',
        isActive: true,
        createdAt: '',
        updatedAt: '',
        category: null as any,
        provider: null as any
      }
    ];

    // Booking 2: Servicio único (Keratin Treatment)
    const booking2 = new Booking();
    booking2.id = '2';
    booking2.customerId = '2';
    booking2.supplierId = 'supplier-1';
    booking2.serviceId = 'service-4';
    booking2.bookingReference = 'Keratin Treatment';
    booking2.bookingDate.year = 2025;
    booking2.bookingDate.month = 7;
    booking2.bookingDate.day = 2;
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
      {
        bookingId: '2',
        serviceId: 'service-4',
        order: 1,
        durationInMinutes: 120
      }
    ];
    
    booking2.services = [
      {
        id: 'service-4',
        providerId: 'supplier-1',
        categoryId: 2,
        serviceName: 'Keratin Treatment',
        serviceDescription: 'Professional keratin hair treatment',
        durationMinutes: 120,
        price: 260,
        color: '#6bbe60',
        currency: 'USD',
        isActive: true,
        createdAt: '',
        updatedAt: '',
        category: null as any,
        provider: null as any
      }
    ];

    // Booking 3: Múltiples servicios de evento
    const booking3 = new Booking();
    booking3.id = '3';
    booking3.customerId = '3';
    booking3.supplierId = 'supplier-1';
    booking3.serviceId = 'service-5';
    booking3.bookingReference = 'Bridal Hair & Makeup Package';
    booking3.bookingDate.year = 2025;
    booking3.bookingDate.month = 7;
    booking3.bookingDate.day = 3;
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
      {
        bookingId: '3',
        serviceId: 'service-5',
        order: 1,
        durationInMinutes: 90
      },
      {
        bookingId: '3',
        serviceId: 'service-6',
        order: 2,
        durationInMinutes: 60
      },
      {
        bookingId: '3',
        serviceId: 'service-7',
        order: 3,
        durationInMinutes: 30
      }
    ];
    
    booking3.services = [
      {
        id: 'service-5',
        providerId: 'supplier-1',
        categoryId: 3,
        serviceName: 'Bridal Hair Styling',
        serviceDescription: 'Elegant bridal hair styling',
        durationMinutes: 90,
        price: 150,
        color: '#c44f4f',
        currency: 'USD',
        isActive: true,
        createdAt: '',
        updatedAt: '',
        category: null as any,
        provider: null as any
      },
      {
        id: 'service-6',
        providerId: 'supplier-1',
        categoryId: 3,
        serviceName: 'Bridal Makeup',
        serviceDescription: 'Professional bridal makeup',
        durationMinutes: 60,
        price: 120,
        color: '#c44f4f',
        currency: 'USD',
        isActive: true,
        createdAt: '',
        updatedAt: '',
        category: null as any,
        provider: null as any
      },
      {
        id: 'service-7',
        providerId: 'supplier-1',
        categoryId: 3,
        serviceName: 'Final Touch-up',
        serviceDescription: 'Final hair and makeup touch-up',
        durationMinutes: 30,
        price: 80,
        color: '#c44f4f',
        currency: 'USD',
        isActive: true,
        createdAt: '',
        updatedAt: '',
        category: null as any,
        provider: null as any
      }
    ];

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

  getBookingTooltip(booking: Booking): string {
    const customerName = `${booking.customer.firstName} ${booking.customer.lastName}`;
    const timeRange = `${this.formatHour(booking.startTime.hour)} - ${this.formatHour(booking.endTime.hour)}`;
    const services = booking.services?.map(s => s.serviceName).join(', ') || 'Sin servicios';
    const duration = `${booking.durationMinutes} min`;
    const price = `$${booking.totalPrice}`;
    
    return `Cliente: ${customerName} | ${timeRange} | Servicios: ${services} | Duración: ${duration} | Precio: ${price}`;
  }
}
