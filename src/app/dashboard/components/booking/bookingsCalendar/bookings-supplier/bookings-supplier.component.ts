import { Component, OnInit, OnDestroy } from '@angular/core';
import { DateItem } from '@app/core/models/bussiness/calendar/dateItem';
import { Booking } from '@app/core/models/bussiness/booking';
import { BookingStatus } from '@app/core/models/bussiness/enums';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OffcanvasBookingService } from '@app/core/services/shared/offcanvas-booking.service';
import { Subscription } from 'rxjs';

interface Supplier {
  id: string;
  companyName: string;
  businessDescription?: string;
  rating?: number;
  isVerified?: boolean;
}

@Component({
  selector: 'app-bookings-supplier',
  templateUrl: './bookings-supplier.component.html',
  styleUrl: './bookings-supplier.component.scss'
})
export class BookingsSupplierComponent implements OnInit, OnDestroy {

  currentDate: Date = new Date();
  suppliers: Supplier[] = [];
  bookings: Booking[] = [];
  private scrollListener?: () => void;
  private subscriptions: Subscription[] = [];

  constructor(private snackBar: MatSnackBar, private offcanvasBookingService: OffcanvasBookingService){
    this.getStaticBookings();
    this.getUniqueSuppliers();
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

  getUniqueSuppliers(): void {
    const supplierMap = new Map<string, Supplier>();
    
    this.bookings.forEach(booking => {
      if (!supplierMap.has(booking.supplierId)) {
        supplierMap.set(booking.supplierId, {
          id: booking.supplierId,
          companyName: booking.supplier.companyName || '',
          businessDescription: booking.supplier.businessDescription || '',
          rating: booking.supplier.rating,
          isVerified: booking.supplier.isVerified
        });
      }
    });
    
    this.suppliers = Array.from(supplierMap.values());
  }

  changeDate(days: number): void {
    const newDate = new Date(this.currentDate);
    newDate.setDate(newDate.getDate() + days);
    this.currentDate = newDate;
  }

  goToToday(): void {
    this.currentDate = new Date();
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

  openBookingModal(supplierId: string, hour?: number): void {
    this.offcanvasBookingService.openBookingModal(this.currentDate, hour);
  }

  onBookingCreated(booking: Booking): void {
    this.bookings.push(booking);
    this.getUniqueSuppliers(); // Actualizar lista de proveedores
    this.snackBar.open('Booking created successfully', 'Cerrar', {
      duration: 3000,
      panelClass: 'snackbar-success'
    });
  }

  onBookingCancelled(): void {
    console.log('Creación de cita cancelada');
  }

  getStaticBookings(){
    const booking1 = new Booking();
    booking1.id = '1';
    booking1.customerId = '1';
    booking1.supplierId = 'supplier-1';
    booking1.serviceId = 'service-1';
    booking1.bookingReference = 'Haircut and Styling Package';
    booking1.bookingDate.year = 2025;
    booking1.bookingDate.month = 7;
    booking1.bookingDate.day = 4;
    booking1.startTime.hour = 12;
    booking1.startTime.minute = 0;
    booking1.endTime.hour = 14;
    booking1.endTime.minute = 30;
    booking1.durationMinutes = 150;
    booking1.totalPrice = 180;
    booking1.currency = 'USD';
    booking1.status = BookingStatus.Pending;

    booking1.supplier.companyName = 'Rick Sanchez';
    booking1.supplier.businessDescription = 'Rick Sanchez es un peluquero experto en peluquería y estética facial.';
    booking1.supplier.businessAddress = '123 Main St, Anytown, USA';
    booking1.supplier.website = 'https://ricksanchez.com';
    booking1.supplier.businessEmail = 'rick@ricksanchez.com';
    booking1.supplier.businessPhone = '123-456-7890';
    booking1.supplier.isVerified = true;
    booking1.supplier.rating = 4.5;

    booking1.customer.photo = '../assets/images/users/user3.png';
    booking1.customer.firstName = 'Rick';
    booking1.customer.lastName = 'Sanchez';
    
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

    const booking2 = new Booking();
    booking2.id = '2';
    booking2.customerId = '2';
    booking2.supplierId = 'supplier-2';
    booking2.serviceId = 'service-4';
    booking2.bookingReference = 'Keratin Treatment';
    booking2.bookingDate.year = 2025;
    booking2.bookingDate.month = 7;
    booking2.bookingDate.day = 4;
    booking2.startTime.hour = 14;
    booking2.startTime.minute = 0;
    booking2.endTime.hour = 16;
    booking2.endTime.minute = 0;
    booking2.durationMinutes = 120;
    booking2.totalPrice = 260;
    booking2.currency = 'USD';
    booking2.status = BookingStatus.Confirmed;
    booking2.supplier.companyName = 'Morty Smith';
    booking2.supplier.businessDescription = 'Morty Smith es un peluquero experto en peluquería y estética facial.';
    booking2.supplier.businessAddress = '123 Main St, Anytown, USA';
    booking2.supplier.website = 'https://mortysmith.com';
    booking2.supplier.businessEmail = 'morty@mortysmith.com';
    booking2.supplier.businessPhone = '123-456-7890';
    booking2.supplier.isVerified = true;
    booking2.supplier.rating = 4.8; 

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
        providerId: 'supplier-2',
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

    const booking3 = new Booking();
    booking3.id = '3';
    booking3.customerId = '3';
    booking3.supplierId = 'supplier-3';
    booking3.serviceId = 'service-5';
    booking3.bookingReference = 'Bridal Hair & Makeup Package';
    booking3.bookingDate.year = 2025;
    booking3.bookingDate.month = 7;
    booking3.bookingDate.day = 4;
    booking3.startTime.hour = 16;
    booking3.startTime.minute = 0;
    booking3.endTime.hour = 19;
    booking3.endTime.minute = 0;
    booking3.durationMinutes = 180;
    booking3.totalPrice = 350;
    booking3.currency = 'USD';
    booking3.status = BookingStatus.InProgress;
    booking3.supplier.companyName = 'Jessica Rodriguez';
    booking3.supplier.businessDescription = 'Jessica Rodriguez es una estilista experta en maquillaje y peinados para eventos especiales.';
    booking3.supplier.businessAddress = '456 Beauty Ave, Anytown, USA';
    booking3.supplier.website = 'https://jessicarodriguez.com';
    booking3.supplier.businessEmail = 'jessica@jessicarodriguez.com';
    booking3.supplier.businessPhone = '123-456-7891';
    booking3.supplier.isVerified = true;
    booking3.supplier.rating = 4.9;
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
        providerId: 'supplier-3',
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
        providerId: 'supplier-3',
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
        providerId: 'supplier-3',
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

    // Booking adicional para mostrar más datos
    const booking4 = new Booking();
    booking4.id = '4';
    booking4.customerId = '4';
    booking4.supplierId = 'supplier-1';
    booking4.serviceId = 'service-8';
    booking4.bookingReference = 'Beard Trim';
    booking4.bookingDate.year = 2025;
    booking4.bookingDate.month = 1;
    booking4.bookingDate.day = 7;
    booking4.startTime.hour = 10;
    booking4.startTime.minute = 0;
    booking4.endTime.hour = 11;
    booking4.endTime.minute = 0;
    booking4.durationMinutes = 60;
    booking4.totalPrice = 50;
    booking4.currency = 'USD';
    booking4.status = BookingStatus.Confirmed;
    booking4.supplier.companyName = 'Rick Sanchez';
    booking4.supplier.businessDescription = 'Rick Sanchez es un peluquero experto en peluquería y estética facial.';
    booking4.supplier.businessAddress = '123 Main St, Anytown, USA';
    booking4.supplier.website = 'https://ricksanchez.com';
    booking4.supplier.businessEmail = 'rick@ricksanchez.com';
    booking4.supplier.businessPhone = '123-456-7890';
    booking4.supplier.isVerified = true;
    booking4.supplier.rating = 4.5;
    booking4.customer.photo = '../assets/images/users/user7.png';
    booking4.customer.firstName = 'Jerry';
    booking4.customer.lastName = 'Smith';
    
    booking4.bookingServices = [
      {
        bookingId: '4',
        serviceId: 'service-8',
        order: 1,
        durationInMinutes: 60
      }
    ];
    
    booking4.services = [
      {
        id: 'service-8',
        providerId: 'supplier-1',
        categoryId: 1,
        serviceName: 'Beard Trim',
        serviceDescription: 'Professional beard trimming and styling',
        durationMinutes: 60,
        price: 50,
        color: '#5d77a2',
        currency: 'USD',
        isActive: true,
        createdAt: '',
        updatedAt: '',
        category: null as any,
        provider: null as any
      }
    ];

    this.bookings = [booking1, booking2, booking3, booking4];
  }

  getBookingsForSupplierAndHour(supplierId: string, hour: number): Booking[] {
    return this.bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate.year, booking.bookingDate.month - 1, booking.bookingDate.day);
      const bookingHour = booking.startTime.hour;
      
      return bookingDate.toDateString() === this.currentDate.toDateString() && 
             booking.supplierId === supplierId && 
             bookingHour === hour;
    });
  }

  getBookingsForSupplier(supplierId: string): Booking[] {
    return this.bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate.year, booking.bookingDate.month - 1, booking.bookingDate.day);
      return bookingDate.toDateString() === this.currentDate.toDateString() && 
             booking.supplierId === supplierId;
    });
  }

  hasBookings(supplierId: string, hour: number): boolean {
    return this.getBookingsForSupplierAndHour(supplierId, hour).length > 0;
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
