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

// Interface para agrupar estilistas con sus bookings
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
    private userService: UserService
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
    // Pasar el stylistId como parámetro adicional si es necesario
    this.offcanvasBookingService.openBookingModal(this.date, hour);
  }

  onBookingCreated(booking: Booking | null): void {
    if(booking !== null){
      this.bookings.push(booking);
      // Convertir fechas para mantener consistencia
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
    
    // Reagrupar bookings por estilista
    this.groupBookingsByStylists();
    
    // Mostrar mensaje de éxito
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
        
        // Cargar usuarios/estilistas
        this.userService.getUsers().subscribe({
          next: (users: User[]) => {
            this.allStylists = users;
            let usersMap = new Map<string, User>();
            users.forEach(user => {
              usersMap.set(user.id, user);
            });

            this.bookings.forEach(booking => {
              booking.user = usersMap.get(booking.supplierId) || new User();
            });

            // Agrupar bookings por estilistas
            this.groupBookingsByStylists();
            this.filterBookings();
            this.isLoadingBookings = false;
          },
          error: (error) => {
            console.error('Error al cargar usuarios:', error);
            this.isLoadingBookings = false;
          }
        });
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
    // Agrupar bookings por supplierId
    const bookingsGrouped = new Map<string, Booking[]>();
    
    this.bookingsFiltered.forEach(booking => {
      if (!bookingsGrouped.has(booking.supplierId)) {
        bookingsGrouped.set(booking.supplierId, []);
      }
      bookingsGrouped.get(booking.supplierId)!.push(booking);
    });

    // Crear array de estilistas con sus bookings (máximo 7)
    this.stylistsBookings = [];
    let count = 0;
    
    // Primero agregar estilistas que tienen bookings
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

    // Luego agregar estilistas sin bookings hasta completar 7
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
        this.services.some(service => service.id === booking.services?.[0]?.id)
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

  getBookingTooltip(booking: Booking): string {
    const services = booking.services?.map(s => s.serviceName).join(', ') || 'Sin servicios';
    const duration = `${booking.durationMinutes} min`;
    const price = `$${booking.totalPrice}`;
    
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
    const widthReduction = Math.min(allBookingsInCell.length * 3, 15); // Máximo 15% de reducción
    return `${100 - widthReduction}%`;
  }

  /**
   * Función auxiliar para mejorar el rendimiento.
   * Retorna los bookings de una celda específica para evitar múltiples cálculos
   */
  getCellBookings(stylistId: string, hour: number): Booking[] {
    return this.getBookingsForStylistAndHour(stylistId, hour);
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

  /**
   * Función trackBy para estilistas
   */
  trackByStylist(index: number, stylistBooking: StylistBookings): string {
    return stylistBooking.stylist.id;
  }

  /**
   * Obtiene el nombre completo del estilista
   */
  getStylistFullName(stylist: User): string {
    return `${stylist.firstName} ${stylist.lastName}`.trim() || stylist.name || stylist.email;
  }

  /**
   * Obtiene la foto del estilista o una por defecto
   */
  getStylistPhoto(stylist: User): string {
    return stylist.photo || this.imageUser;
  }
}
