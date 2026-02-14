import { Component, OnInit, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { UserService } from '@app/core/services/http/user.service';
import { BookingService } from '@app/core/services/http/booking.service';
import { DashboardFiltersService, DashboardFilters } from '@app/core/services/shared/dashboard-filters.service';
import { User } from '@app/core/models/bussiness/user';
import { Booking } from '@app/core/models/bussiness/booking';
import { Salon } from '@app/core/models/bussiness/salon';
import { BookingStatus } from '@app/core/models/bussiness/enums';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RolesConst } from '@app/core/models/constants/roles.const';

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
export class StylistResumeComponent implements OnInit, OnChanges, OnDestroy {
  
  @Input() salon: Salon | null = null;
  
  stylists: User[] = [];
  selectedStylist: User | null = null;
  stylistSummary: StylistSummary | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  bookingsCount: number = 0;
  clientsCount: number = 0;
  currentMonthEarnings: number = 0;
  earningsPercentageChange: number = 0;
  recentActivities: RecentActivity[] = [];
  
  // Fechas de consulta
  queryStartDate: Date = new Date();
  queryEndDate: Date = new Date();
  
  private destroy$ = new Subject<void>();
  private stylistsLoaded: boolean = false;

  constructor(
    private userService: UserService,
    private bookingService: BookingService,
    private dashboardFiltersService: DashboardFiltersService
  ) { }

  ngOnInit(): void {
    this.loadStylists();
    this.subscribeToFiltersChanges();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['salon'] && !changes['salon'].firstChange) {
      // El salón ha cambiado, recargar estilistas
      this.loadStylists();
    }
  }
  
  private subscribeToFiltersChanges(): void {
    this.dashboardFiltersService.filters$
      .pipe(takeUntil(this.destroy$))
      .subscribe((filters: DashboardFilters) => {
        // Solo procesar si los estilistas ya están cargados
        if (this.stylistsLoaded && filters.selectedStylist) {
          // Verificar si el estilista seleccionado es diferente al actual
          if (!this.selectedStylist || this.selectedStylist.id !== filters.selectedStylist.id) {
            this.selectStylistFromFilter(filters.selectedStylist, filters.startDate, filters.endDate);
          }
        }
      });
  }
  
  private selectStylistFromFilter(stylist: User, startDate: Date, endDate: Date): void {
    this.selectedStylist = stylist;
    this.isLoading = true;
    this.errorMessage = '';

    // Usar las fechas del filtro
    this.queryStartDate = startDate;
    this.queryEndDate = endDate;

    // Calcular el mes anterior basado en startDate
    const startOfPreviousMonth = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 0);

    forkJoin({
      currentMonthBookings: this.bookingService.getByUserDateRange(stylist.id, startDate, endDate),
      previousMonthBookings: this.bookingService.getByUserDateRange(stylist.id, startOfPreviousMonth, endOfPreviousMonth)
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

  loadStylists(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.stylistsLoaded = false;
    
    this.userService.getUsersByRole(RolesConst._STYLIST).subscribe({
      next: (users) => {
        this.stylists = users.filter(u => u.isActive);
        this.stylistsLoaded = true;
        
        if (this.stylists.length > 0) {
          // Verificar si hay un estilista seleccionado en los filtros
          const currentFilters = this.dashboardFiltersService.getCurrentFilters();
          if (currentFilters.selectedStylist) {
            this.selectStylistFromFilter(
              currentFilters.selectedStylist, 
              currentFilters.startDate, 
              currentFilters.endDate
            );
          } else {
            this.selectStylist(this.stylists[0].id);
          }
        } else {
          this.isLoading = false;
          this.errorMessage = 'No hay estilistas disponibles';
        }
      },
      error: (error) => {
        console.error('Error loading stylists:', error);
        this.errorMessage = 'Error al cargar los estilistas';
        this.isLoading = false;
      }
    });
  }

  selectStylist(userId: string): void {
    const stylist = this.stylists.find(s => s.id === userId);
    if (!stylist) return;

    this.selectedStylist = stylist;
    this.isLoading = true;
    this.errorMessage = '';

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Guardar fechas de consulta
    this.queryStartDate = startOfMonth;
    this.queryEndDate = endOfMonth;

    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

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

  private processStylistData(currentMonthBookings: Booking[], previousMonthBookings: Booking[]): void {
    const completedCurrentBookings = currentMonthBookings;
    const completedPreviousBookings = previousMonthBookings;

    this.bookingsCount = completedCurrentBookings.length;

    const uniqueCustomerIds = new Set(completedCurrentBookings.map(b => b.customerId));
    this.clientsCount = uniqueCustomerIds.size;

    this.currentMonthEarnings = completedCurrentBookings.reduce(
      (total, booking) => total + (booking.totalPrice || 0), 0
    );

    const previousMonthEarnings = completedPreviousBookings.reduce(
      (total, booking) => total + (booking.totalPrice || 0), 0
    );

    if (previousMonthEarnings > 0) {
      this.earningsPercentageChange = 
        ((this.currentMonthEarnings - previousMonthEarnings) / previousMonthEarnings) * 100;
    } else {
      this.earningsPercentageChange = this.currentMonthEarnings > 0 ? 100 : 0;
    }

    this.recentActivities = this.getRecentActivities(currentMonthBookings);
  }

  private getRecentActivities(bookings: Booking[]): RecentActivity[] {
    const now = new Date();
    const startOfWeek = this.getStartOfWeek(now);
    const endOfWeek = this.getEndOfWeek(now);

    const weekBookings = bookings.filter(booking => {
      const bookingDate = this.parseBookingDate(booking.bookingDate);
      return bookingDate >= startOfWeek && bookingDate <= endOfWeek;
    });

    weekBookings.sort((a, b) => {
      const dateA = this.parseBookingDate(a.bookingDate);
      const dateB = this.parseBookingDate(b.bookingDate);
      return dateB.getTime() - dateA.getTime();
    });

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

  private getServiceName(booking: Booking): string {
    if (booking.services && booking.services.length > 0) {
      return booking.services[0].serviceName || 'Servicio';
    }
    return 'Servicio';
  }

  private parseBookingDate(dateOnly: any): Date {
    if (dateOnly.year && dateOnly.month && dateOnly.day) {
      return new Date(dateOnly.year, dateOnly.month - 1, dateOnly.day);
    }
    return new Date();
  }

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustar cuando es domingo
    return new Date(d.setDate(diff));
  }

  private getEndOfWeek(date: Date): Date {
    const startOfWeek = this.getStartOfWeek(date);
    return new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);
  }


  private getMonthShortName(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[date.getMonth()];
  }

  getStylistFullName(): string {
    if (!this.selectedStylist) return 'Stylist';
    return `${this.selectedStylist.firstName} ${this.selectedStylist.lastName}`.trim() 
           || this.selectedStylist.name || 'Stylist';
  }

  getStylistPhoto(): string {
    return this.selectedStylist?.photo || 'assets/images/user-image.jpg';
  }

  getQueryDateRange(): string {
    const formatDate = (date: Date): string => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = this.getMonthShortName(date);
      return `${day} ${month}`;
    };
    return `${formatDate(this.queryStartDate)} - ${formatDate(this.queryEndDate)}`;
  }

  getFormattedPercentageChange(): string {
    const sign = this.earningsPercentageChange >= 0 ? '+' : '';
    return `${sign} ${this.earningsPercentageChange.toFixed(2)}%`;
  }

  isPositiveChange(): boolean {
    return this.earningsPercentageChange >= 0;
  }
}
