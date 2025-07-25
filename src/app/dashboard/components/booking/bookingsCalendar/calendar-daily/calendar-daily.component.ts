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

@Component({
  selector: 'app-calendar-daily',
  templateUrl: './calendar-daily.component.html',
  styleUrl: './calendar-daily.component.scss'
})
export class CalendarDailyComponent implements OnInit, OnDestroy, OnChanges {

  @Input('date') date: Date = new Date();
  @Input('loading') loading: boolean = false;
  @Input('services') services: Service[] = [];
  @Input('stylists') stylists: User[] = [];
  dateNow : Date = new Date();
  dates: DateItem[] = [];
  activeDate: DateItem = new DateItem();
  bookings: Booking[] = [];
  bookingsFiltered: Booking[] = [];
  isLoadingBookings: boolean = false;
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
      this.updateDates();
      this.loadBookingsForCurrentWeek();
    }
    if((changes['services'] && !changes['services'].firstChange) || 
       (changes['stylists'] && !changes['stylists'].firstChange)){
      this.filterBookings();
    }
  }

  ngOnInit(): void {
    this.updateDates();
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
    
    const dateItem = new DateItem();
    dateItem.date = new Date(this.date); // Usar directamente this.date
    dateItem.isToday = this.date.toDateString() === this.dateNow.toDateString(); // Comparar si la fecha seleccionada es hoy
    
    dates.push(dateItem);
    
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

  editBooking(bookingId: string, event: Event): void {
    // Prevenir que el evento se propague al elemento padre (td)
    event.stopPropagation();
    
    // Abrir el modal de actualización con el ID del booking
    this.offcanvasBookingService.openUpdateBookingModal(bookingId);
  }

  onBookingUpdated(booking: Booking): void {
    // Actualizar el booking en la lista local
    const index = this.bookings.findIndex(b => b.id === booking.id);
    if (index !== -1) {
      this.bookings[index] = booking;
      // Convertir fechas para mantener consistencia
      this.bookings[index].startTime = TimeUtils.stringToTimeOnly(booking.startTime.toString());
      this.bookings[index].endTime = TimeUtils.stringToTimeOnly(booking.endTime.toString());  
      this.bookings[index].bookingDate = DateUtils.stringToDateOnly(booking.bookingDate.toString());
    }
    
    // Mostrar mensaje de éxito
    this.snackBar.open('Cita actualizada exitosamente', 'Cerrar', {
      duration: 3000,
      panelClass: 'snackbar-success'
    });
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

  /**
   * Calcula la posición vertical (top) de un booking dentro de su celda horaria
   * basada en los minutos del tiempo de inicio
   */
  getBookingTopPosition(booking: Booking): string {
    const minutes = booking.startTime.minute;
    // Cada celda representa 60 minutos, calculamos el porcentaje
    const percentage = (minutes / 60) * 100;
    return `${percentage}%`;
  }

  /**
   * Calcula la altura de un booking basada en su duración
   * para que represente visualmente el tiempo real
   */
  getBookingHeight(booking: Booking): string {
    const totalMinutes = booking.durationMinutes;
    // Altura mínima para legibilidad
    const minHeightPx = 40;
    // Altura base por hora (aproximadamente 60px por hora)
    const pixelsPerMinute = 1;
    
    let calculatedHeight = totalMinutes * pixelsPerMinute;
    
    // Aplicar altura mínima
    calculatedHeight = Math.max(calculatedHeight, minHeightPx);
    
    return `${calculatedHeight}px`;
  }

  /**
   * Calcula el índice de superposición para bookings que se solapan
   * en la misma celda horaria
   */
  getBookingZIndex(booking: Booking, allBookingsInCell: Booking[]): number {
    const baseZIndex = 1000;
    const bookingIndex = allBookingsInCell.findIndex(b => b.id === booking.id);
    return baseZIndex + bookingIndex;
  }

  /**
   * Calcula el offset horizontal cuando hay múltiples bookings superpuestos
   */
  getBookingLeftOffset(booking: Booking, allBookingsInCell: Booking[]): string {
    if (allBookingsInCell.length <= 1) return '0%';
    
    const bookingIndex = allBookingsInCell.findIndex(b => b.id === booking.id);
    const offsetPercentage = (bookingIndex * 5); // 5% de offset por cada booking adicional
    
    return `${offsetPercentage}%`;
  }

  /**
   * Calcula el ancho de la tarjeta cuando hay superposición
   */
  getBookingWidth(allBookingsInCell: Booking[]): string {
    if (allBookingsInCell.length <= 1) return '100%';
    
    // Reducir el ancho cuando hay múltiples bookings
    const widthReduction = Math.min(allBookingsInCell.length * 3, 20); // Máximo 20% de reducción
    return `${100 - widthReduction}%`;
  }

  /**
   * Función auxiliar para mejorar el rendimiento.
   * Retorna los bookings de una celda específica para evitar múltiples cálculos
   */
  getCellBookings(date: Date, hour: number): Booking[] {
    return this.getBookingsForDateTime(date, hour);
  }

  /**
   * Verifica si un booking se extiende más allá de la hora actual
   * (para bookings que duran más de 60 minutos)
   */
  bookingExtendsToNextHour(booking: Booking): boolean {
    const startMinutes = booking.startTime.hour * 60 + booking.startTime.minute;
    const endMinutes = startMinutes + booking.durationMinutes;
    const nextHourMinutes = (booking.startTime.hour + 1) * 60;
    
    return endMinutes > nextHourMinutes;
  }

  /**
   * Calcula cuántas horas adicionales ocupa un booking
   * (para bookings que se extienden más allá de su hora de inicio)
   */
  getBookingAdditionalHours(booking: Booking): number {
    if (booking.durationMinutes <= 60) return 0;
    
    const remainingMinutes = booking.durationMinutes - (60 - booking.startTime.minute);
    return Math.ceil(remainingMinutes / 60);
  }

  /**
   * Función trackBy para mejorar el rendimiento de Angular con *ngFor
   */
  trackByBooking(index: number, booking: Booking): string {
    return booking.id;
  }
}
