import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { DateItem } from '@app/core/models/bussiness/calendar/dateItem';
import { Booking } from '@app/core/models/bussiness/booking';
import { BookingStatus } from '@app/core/models/bussiness/enums';
import { OffcanvasCreateBookingComponent } from '../../../shared/offcanvas/offcanvas-create-booking/offcanvas-create-booking.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Service } from '@app/core/models/bussiness/service';

@Component({
  selector: 'app-calendar-monthly',
  templateUrl: './calendar-monthly.component.html',
  styleUrl: './calendar-monthly.component.scss'
})
export class CalendarMonthlyComponent implements OnInit, OnDestroy {

  @ViewChild(OffcanvasCreateBookingComponent) offcanvasCreateBooking!: OffcanvasCreateBookingComponent;

  dateNow : Date = new Date();
  dates: DateItem[] = [];
  activeDate: DateItem = new DateItem();
  bookings: Booking[] = [];
  private scrollListener?: () => void;

  constructor(private snackBar: MatSnackBar){
    this.dates = this.getDates();
    this.getStaticBookings();
  }

  ngOnInit(): void {
    this.initStickyHeader();
  }

  ngOnDestroy(): void {
    if (this.scrollListener) {
      window.removeEventListener("scroll", this.scrollListener);
    }
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
    this.offcanvasCreateBooking.selectedDate = date;
    this.offcanvasCreateBooking.selectedHour = hour;
    
    this.offcanvasCreateBooking.show();
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
    const booking1 = new Booking();
    booking1.id = '1';
    booking1.customerId = '1';
    booking1.supplierId = 'supplier-1';
    booking1.serviceId = 'service-1';
    booking1.bookingReference = 'Haircut and Styling';
    booking1.bookingDate.year = 2025;
    booking1.bookingDate.month = 6;
    booking1.bookingDate.day = 21;
    booking1.startTime.hour = 12;
    booking1.startTime.minute = 0;
    booking1.endTime.hour = 14;
    booking1.endTime.minute = 0;
    booking1.durationMinutes = 60;
    booking1.totalPrice = 120;
    booking1.status = BookingStatus.Pending;
    booking1.services = [new Service()];
    booking1.services[0].serviceName = 'Haircut and Styling';
    booking1.services[0].color = '#5d77a2';
    booking1.customer.photo = '../assets/images/users/user3.png';
    booking1.customer.firstName = 'Rick';
    booking1.customer.lastName = 'Sanchez';

    const booking2 = new Booking();
    booking2.id = '2';
    booking2.customerId = '2';
    booking2.supplierId = 'supplier-1';
    booking2.serviceId = 'service-1';
    booking2.bookingReference = 'Keratin Treatment';
    booking2.bookingDate.year = 2025;
    booking2.bookingDate.month = 6;
    booking2.bookingDate.day = 21;
    booking2.startTime.hour = 8;
    booking2.startTime.minute = 0;
    booking2.endTime.hour = 10;
    booking2.endTime.minute = 0;
    booking2.durationMinutes = 60;
    booking2.totalPrice = 260;
    booking2.status = BookingStatus.Confirmed;
    booking2.services = [new Service()];
    booking2.services[0].serviceName = 'Keratin Treatment';
    booking2.services[0].color = '#6bbe60';
    booking2.customer.photo = '../assets/images/users/user5.png';
    booking2.customer.firstName = 'Morty';
    booking2.customer.lastName = 'Smith';

    const booking3 = new Booking();
    booking3.id = '3';
    booking3.customerId = '3';
    booking3.supplierId = 'supplier-1';
    booking3.serviceId = 'service-1';
    booking3.bookingReference = 'Bridal and Event Hair Styling';
    booking3.bookingDate.year = 2025;
    booking3.bookingDate.month = 6;
    booking3.bookingDate.day = 20;
    booking3.startTime.hour = 8;
    booking3.startTime.minute = 0;
    booking3.endTime.hour = 10;
    booking3.endTime.minute = 0;
    booking3.durationMinutes = 60;
    booking3.totalPrice = 100;
    booking3.status = BookingStatus.InProgress;
    booking3.services = [new Service()];
    booking3.services[0].serviceName = 'Bridal and Event Hair Styling';
    booking3.services[0].color = '#c44f4f';
    booking3.customer.photo = '../assets/images/users/user21.png';
    booking3.customer.firstName = 'Summer';
    booking3.customer.lastName = 'Smith';

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
}
