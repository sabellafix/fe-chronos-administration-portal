import { Component, OnInit, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { UserService } from '@app/core/services/http/user.service';
import { DashboardService } from '@app/core/services/http/dashboard.service';
import { DashboardFiltersService, DashboardFilters } from '@app/core/services/shared/dashboard-filters.service';
import { User } from '@app/core/models/bussiness/user';
import { Salon } from '@app/core/models/bussiness/salon';
import { SupplierMetricsDto, RecentBookingDto } from '@app/core/models/bussiness/dashboard-dtos';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RolesConst } from '@app/core/models/constants/roles.const';

export interface RecentActivity {
  date: Date;
  day: number;
  month: string;
  serviceName: string;
  bookingId: string;
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
    private dashboardService: DashboardService,
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
        if (this.stylistsLoaded && filters.selectedStylist) {
          const adjustedStartDate = new Date(filters.startDate);
          adjustedStartDate.setDate(adjustedStartDate.getDate() + 1);
          const adjustedEndDate = new Date(filters.endDate);
          adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

          const stylistChanged = !this.selectedStylist || this.selectedStylist.id !== filters.selectedStylist.id;
          const startDateChanged = this.queryStartDate.getTime() !== adjustedStartDate.getTime();
          const endDateChanged = this.queryEndDate.getTime() !== adjustedEndDate.getTime();
          
          // Ejecutar si cambió el estilista o las fechas
          if (stylistChanged || startDateChanged || endDateChanged) {
            this.selectStylistFromFilter(filters.selectedStylist, adjustedStartDate, adjustedEndDate);
          }
        }
      });
  }
  
  private selectStylistFromFilter(stylist: User, startDate: Date, endDate: Date): void {
    this.selectedStylist = stylist;
    this.isLoading = true;
    this.errorMessage = '';

    const startOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const endOfMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    this.queryStartDate = startOfMonth;
    this.queryEndDate = endOfMonth;

    const currentFilters = this.dashboardFiltersService.getCurrentFilters();
    const salonId = currentFilters.selectedSalon?.id;

    if (!salonId) {
      this.errorMessage = 'No hay salón seleccionado';
      this.isLoading = false;
      return;
    }

    this.dashboardService.getSupplierMetrics(salonId, stylist.id, startOfMonth, endOfMonth)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (metrics: SupplierMetricsDto) => {
          this.processSupplierMetrics(metrics);
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

    // Obtener el salonId de los filtros actuales
    const currentFilters = this.dashboardFiltersService.getCurrentFilters();
    const salonId = currentFilters.selectedSalon?.id;

    if (!salonId) {
      this.errorMessage = 'No hay salón seleccionado';
      this.isLoading = false;
      return;
    }

    this.dashboardService.getSupplierMetrics(salonId, userId, startOfMonth, endOfMonth)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (metrics: SupplierMetricsDto) => {
          this.processSupplierMetrics(metrics);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading stylist data:', error);
          this.errorMessage = 'Error al cargar la información del estilista';
          this.isLoading = false;
        }
      });
  }

  private processSupplierMetrics(metrics: SupplierMetricsDto): void {
    this.bookingsCount = metrics.totalBookings;
    this.clientsCount = metrics.totalCustomers;
    this.currentMonthEarnings = metrics.totalEarings;
    this.earningsPercentageChange = metrics.earingsChangePercentage;
    this.recentActivities = this.mapRecentBookingsToActivities(metrics.recentBookings || []);
  }

  private mapRecentBookingsToActivities(recentBookings: RecentBookingDto[]): RecentActivity[] {
    return recentBookings.slice(0, 5).map(booking => {
      const date = new Date(booking.bookingDate);
      return {
        date: date,
        day: date.getDate(),
        month: this.getMonthShortName(date),
        serviceName: booking.serviceName || 'Servicio',
        bookingId: booking.bookingId
      };
    });
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
