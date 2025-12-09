import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { UserService } from '@app/core/services/http/user.service';
import { BookingService } from '@app/core/services/http/booking.service';
import { User } from '@app/core/models/bussiness/user';
import { Booking } from '@app/core/models/bussiness/booking';
import { Salon } from '@app/core/models/bussiness/salon';
import { BookingStatus } from '@app/core/models/bussiness/enums';
import { forkJoin } from 'rxjs';

// Interfaces para el resumen del estilista
export interface StylistSummary {
  user: User;
  bookingsCount: number;
  clientsCount: number;
  currentWeekEarnings: number;
  previousWeekEarnings: number;
  earningsPercentageChange: number;
  recentActivities: RecentActivity[];
}

export interface RecentActivity {
  date: Date;
  day: number;
  month: string;
  serviceName: string;
  bookingId: string;
}

export interface WeeklyEarnings {
  currentWeek: number;
  previousWeek: number;
  percentage: number;
}

@Component({
  selector: 'app-stylist-resume',
  templateUrl: './stylist-resume.component.html',
  styleUrl: './stylist-resume.component.scss'
})
export class StylistResumeComponent implements OnInit, OnChanges {
  
  // Input: Salón seleccionado desde el componente padre
  @Input() salon: Salon | null = null;
  
  // Variables para el componente
  stylists: User[] = [];
  selectedStylist: User | null = null;
  stylistSummary: StylistSummary | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  // Datos para la vista
  bookingsCount: number = 0;
  clientsCount: number = 0;
  currentMonthEarnings: number = 0;
  earningsPercentageChange: number = 0;
  recentActivities: RecentActivity[] = [];

  constructor(
    private userService: UserService,
    private bookingService: BookingService
  ) { }

  ngOnInit(): void {
    this.loadStylists();
  }

  /**
   * Detecta cambios en el Input del salón
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['salon'] && !changes['salon'].firstChange) {
      // El salón ha cambiado, recargar estilistas
      this.loadStylists();
    }
  }

  /**
   * Carga la lista de estilistas (usuarios con rol de serviceProvider)
   * Filtra por el salón recibido como Input
   */
  loadStylists(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Determinar qué servicio llamar según si hay salón recibido
    const salonId = this.salon?.id;
    const serviceCall = salonId 
      ? this.userService.getUsersByRoleAndSalon('serviceProvider', salonId)
      : this.userService.getUsersByRole('serviceProvider');
    
    serviceCall.subscribe({
      next: (users) => {
        this.stylists = users.filter(u => u.isActive);
        
        // Si hay un salón, filtrar también en el frontend como fallback
        if (salonId) {
          this.stylists = this.stylists.filter(u => !u.salonId || u.salonId === salonId);
        }
        
        if (this.stylists.length > 0) {
          // Seleccionar el primer estilista por defecto
          this.selectStylist(this.stylists[0].id);
        } else {
          this.isLoading = false;
          this.errorMessage = salonId 
            ? `No hay estilistas disponibles para el salón: ${this.salon?.name}`
            : 'No hay estilistas disponibles';
        }
      },
      error: (error) => {
        console.error('Error loading stylists:', error);
        this.errorMessage = 'Error al cargar los estilistas';
        this.isLoading = false;
      }
    });
  }

  /**
   * Selecciona un estilista y carga su información
   */
  selectStylist(userId: string): void {
    const stylist = this.stylists.find(s => s.id === userId);
    if (!stylist) return;

    this.selectedStylist = stylist;
    this.isLoading = true;
    this.errorMessage = '';

    // Obtener el rango de fechas para el mes actual
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Obtener el rango de fechas para el mes anterior
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Hacer las peticiones en paralelo
    forkJoin({
      currentMonthBookings: this.bookingService.getByUserDateRange(userId, startOfMonth, endOfMonth),
      previousMonthBookings: this.bookingService.getByUserDateRange(userId, startOfPreviousMonth, endOfPreviousMonth)
    }).subscribe({
      next: (result) => {
        this.processStylistData(result.currentMonthBookings, result.previousMonthBookings);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading stylist data:', error);
        this.errorMessage = 'Error al cargar la información del estilista';
        this.isLoading = false;
      }
    });
  }

  /**
   * Procesa los datos del estilista y calcula las métricas
   */
  private processStylistData(currentMonthBookings: Booking[], previousMonthBookings: Booking[]): void {
    // Filtrar solo bookings completados (BookingStatus.Completed = 3)
    const completedCurrentBookings = currentMonthBookings.filter(
      b => b.status === BookingStatus.Completed
    );
    const completedPreviousBookings = previousMonthBookings.filter(
      b => b.status === BookingStatus.Completed
    );

    // Calcular número de bookings
    this.bookingsCount = completedCurrentBookings.length;

    // Calcular número de clientes únicos
    const uniqueCustomerIds = new Set(completedCurrentBookings.map(b => b.customerId));
    this.clientsCount = uniqueCustomerIds.size;

    // Calcular ganancias del mes actual
    this.currentMonthEarnings = completedCurrentBookings.reduce(
      (total, booking) => total + (booking.totalPrice || 0), 0
    );

    // Calcular ganancias del mes anterior
    const previousMonthEarnings = completedPreviousBookings.reduce(
      (total, booking) => total + (booking.totalPrice || 0), 0
    );

    // Calcular porcentaje de cambio
    if (previousMonthEarnings > 0) {
      this.earningsPercentageChange = 
        ((this.currentMonthEarnings - previousMonthEarnings) / previousMonthEarnings) * 100;
    } else {
      this.earningsPercentageChange = this.currentMonthEarnings > 0 ? 100 : 0;
    }

    // Obtener actividades recientes (últimas 5 de la semana actual)
    this.recentActivities = this.getRecentActivities(currentMonthBookings);
  }

  /**
   * Obtiene las actividades recientes de la semana actual
   */
  private getRecentActivities(bookings: Booking[]): RecentActivity[] {
    const now = new Date();
    const startOfWeek = this.getStartOfWeek(now);
    const endOfWeek = this.getEndOfWeek(now);

    // Filtrar bookings de la semana actual
    const weekBookings = bookings.filter(booking => {
      const bookingDate = this.parseBookingDate(booking.bookingDate);
      return bookingDate >= startOfWeek && bookingDate <= endOfWeek;
    });

    // Ordenar por fecha descendente
    weekBookings.sort((a, b) => {
      const dateA = this.parseBookingDate(a.bookingDate);
      const dateB = this.parseBookingDate(b.bookingDate);
      return dateB.getTime() - dateA.getTime();
    });

    // Tomar las últimas 5 y convertir a RecentActivity
    return weekBookings.slice(0, 5).map(booking => {
      const date = this.parseBookingDate(booking.bookingDate);
      const serviceName = this.getServiceName(booking);
      
      return {
        date: date,
        day: date.getDate(),
        month: this.getMonthShortName(date),
        serviceName: serviceName,
        bookingId: booking.id
      };
    });
  }

  /**
   * Obtiene el nombre del servicio desde el booking
   */
  private getServiceName(booking: Booking): string {
    if (booking.services && booking.services.length > 0) {
      return booking.services[0].serviceName || 'Servicio';
    }
    return 'Servicio';
  }

  /**
   * Convierte el objeto DateOnly a Date de JavaScript
   */
  private parseBookingDate(dateOnly: any): Date {
    if (dateOnly.year && dateOnly.month && dateOnly.day) {
      return new Date(dateOnly.year, dateOnly.month - 1, dateOnly.day);
    }
    return new Date();
  }

  /**
   * Obtiene el inicio de la semana (lunes)
   */
  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustar cuando es domingo
    return new Date(d.setDate(diff));
  }

  /**
   * Obtiene el fin de la semana (domingo)
   */
  private getEndOfWeek(date: Date): Date {
    const startOfWeek = this.getStartOfWeek(date);
    return new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);
  }

  /**
   * Obtiene el nombre corto del mes
   */
  private getMonthShortName(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[date.getMonth()];
  }

  /**
   * Maneja el cambio en el selector de estilistas
   */
  onStylistChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const userId = target.value;
    if (userId) {
      this.selectStylist(userId);
    }
  }

  /**
   * Obtiene el nombre completo del estilista seleccionado
   */
  getStylistFullName(): string {
    if (!this.selectedStylist) return 'Stylist';
    return `${this.selectedStylist.firstName} ${this.selectedStylist.lastName}`.trim() 
           || this.selectedStylist.name || 'Stylist';
  }

  /**
   * Obtiene la foto del estilista o una por defecto
   */
  getStylistPhoto(): string {
    return this.selectedStylist?.photo || 'assets/images/users/user-photo-12.jpg';
  }

  /**
   * Formatea el cambio de porcentaje con signo
   */
  getFormattedPercentageChange(): string {
    const sign = this.earningsPercentageChange >= 0 ? '+' : '';
    return `${sign} ${this.earningsPercentageChange.toFixed(2)}%`;
  }

  /**
   * Determina si el cambio es positivo
   */
  isPositiveChange(): boolean {
    return this.earningsPercentageChange >= 0;
  }
}
