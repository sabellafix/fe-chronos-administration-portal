import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil, filter, distinctUntilChanged } from 'rxjs';
import { DashboardService } from '@app/core/services/http/dashboard.service';
import { StorageService } from '@app/core/services/shared/storage.service';
import { WaitService } from '@app/core/services/shared/wait.service';
import { DashboardFiltersService } from '@app/core/services/shared/dashboard-filters.service';
import { StorageKeyConst } from '@app/core/models/constants/storageKey.const';
import { Salon } from '@app/core/models/bussiness/salon';
import { User } from '@app/core/models/bussiness/user';
import {
  DashboardMetricsDto,
  KpiCardsDto,
  RevenueChartDto,
  RevenueActivityDto,
  OrderStatsDto,
  TopServiceDto,
  SalonOccupancyDto
} from '@app/core/models/bussiness/dashboard-dtos';

interface CachedData<T> {
  data: T;
  timestamp: number;
  salonId: string;
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  selectedSalon: Salon | null = null;
  startDateFilter: Date = new Date();
  endDateFilter: Date = new Date();
  currentView: 'calendar' | 'chart' = 'chart';
  loading: boolean = false;
  dashboardMetrics: DashboardMetricsDto | null = null;
  kpiCards: KpiCardsDto | null = null;
  revenueChart: RevenueChartDto | null = null;
  revenueActivity: RevenueActivityDto | null = null;
  orderStats: OrderStatsDto | null = null;
  topServices: TopServiceDto[] = [];
  salonOccupancy: SalonOccupancyDto | null = null;
  selectedStylist: User | null = null;
  isStylistPanelVisible: boolean = false;
  loadingCharts: {
    kpiCards: boolean;
    revenueChart: boolean;
    revenueActivity: boolean;
    orderStats: boolean;
    topServices: boolean;
    salonOccupancy: boolean;
  } = {
    kpiCards: false,
    revenueChart: false,
    revenueActivity: false,
    orderStats: false,
    topServices: false,
    salonOccupancy: false
  };
  
  enabledCaching: boolean = false;

  private destroy$: Subject<void> = new Subject<void>();
  
  private readonly CACHE_EXPIRATION_MS = 5 * 60 * 1000;
  private readonly CACHE_DELAY_MS = 1000;

  constructor(
    private dashboardService: DashboardService,
    private storageService: StorageService,
    private waitService: WaitService,
    private dashboardFiltersService: DashboardFiltersService
  ) {}

  ngOnInit(): void {
    // alert("ngOnInit dashboard component");
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    this.startDateFilter = startOfMonth;
    this.endDateFilter = endOfMonth;

    // Suscripción única a todos los cambios de filtros del topbar
    this.dashboardFiltersService.filters$
      .pipe(
        takeUntil(this.destroy$),
        filter(filters => filters.selectedSalon !== null),
        distinctUntilChanged((prev, curr) => 
          prev.selectedSalon?.id === curr.selectedSalon?.id &&
          prev.startDate.getTime() === curr.startDate.getTime() &&
          prev.endDate.getTime() === curr.endDate.getTime() &&
          prev.selectedStylist?.id === curr.selectedStylist?.id
        )
      )
      .subscribe(filters => {
        this.startDateFilter = filters.startDate;
        this.endDateFilter = filters.endDate;
        this.selectedSalon = filters.selectedSalon;
        this.selectedStylist = filters.selectedStylist;
        this.isStylistPanelVisible = filters.selectedStylist !== null;
        this.loadServices();
      });
  }

  async loadServices(): Promise<void> {
    // alert("loadServices");
    if (!this.selectedSalon || !this.selectedSalon.id) {
      console.warn('No salon selected');
      return;
    }

    this.loading = true;
    const salonId = this.selectedSalon.id;
    this.revenueChart = null;
    this.kpiCards = null;
    this.revenueActivity = null;
    this.orderStats = null;
    this.topServices = [];
    this.salonOccupancy = null;

    // Verificar si hay datos en caché válidos (solo si el caching está habilitado)
    if (this.enabledCaching && this.isCacheValid(salonId)) {
      await this.loadFromCache(salonId);
    } else {
      this.loadFromBackend(salonId);
    }
  }

  private isCacheValid(salonId: string): boolean {
    const metricsCache = this.getCachedData<DashboardMetricsDto>(StorageKeyConst._DASHBOARD_METRICS, salonId);
    const kpiCache = this.getCachedData<KpiCardsDto>(StorageKeyConst._DASHBOARD_KPI_CARDS, salonId);
    const revenueChartCache = this.getCachedData<RevenueChartDto>(StorageKeyConst._DASHBOARD_REVENUE_CHART, salonId);
    const revenueActivityCache = this.getCachedData<RevenueActivityDto>(StorageKeyConst._DASHBOARD_REVENUE_ACTIVITY, salonId);
    const occupancyCache = this.getCachedData<SalonOccupancyDto>(StorageKeyConst._DASHBOARD_SALON_OCCUPANCY, salonId);

    return !!(metricsCache && kpiCache && revenueChartCache && revenueActivityCache && occupancyCache);
  }

  private getCacheKey(): string {
    const startStr = this.startDateFilter.toISOString().split('T')[0];
    const endStr = this.endDateFilter.toISOString().split('T')[0];
    return `${startStr}_${endStr}`;
  }

  private getCachedData<T>(key: string, salonId: string): T | null {
    const dateKey = this.getCacheKey();
    const cacheKey = `${key}_${salonId}_${dateKey}`;
    const cached = this.storageService.get<CachedData<T>>(cacheKey);
    
    if (!cached) return null;
    
    const now = Date.now();
    const isExpired = (now - cached.timestamp) > this.CACHE_EXPIRATION_MS;
    const startStr = this.startDateFilter.toISOString().split('T')[0];
    const endStr = this.endDateFilter.toISOString().split('T')[0];
    const datesMatch = cached.startDate === startStr && cached.endDate === endStr;
    
    if (isExpired || cached.salonId !== salonId || !datesMatch) {
      this.storageService.remove(cacheKey);
      return null;
    }
    
    return cached.data;
  }

  private setCachedData<T>(key: string, salonId: string, data: T): void {
    if (!this.enabledCaching) {
      return;
    }
    
    const dateKey = this.getCacheKey();
    const cacheKey = `${key}_${salonId}_${dateKey}`;
    const cached: CachedData<T> = {
      data,
      timestamp: Date.now(),
      salonId,
      startDate: this.startDateFilter.toISOString().split('T')[0],
      endDate: this.endDateFilter.toISOString().split('T')[0]
    };
    this.storageService.set(cacheKey, cached);
  }

  private async loadFromCache(salonId: string): Promise<void> {
    // Esperar 1 segundo para mantener la ilusión de consulta
    await this.waitService.waitAndReturnValue(null, this.CACHE_DELAY_MS);

    this.dashboardMetrics = this.getCachedData<DashboardMetricsDto>(StorageKeyConst._DASHBOARD_METRICS, salonId);
    this.kpiCards = this.getCachedData<KpiCardsDto>(StorageKeyConst._DASHBOARD_KPI_CARDS, salonId);
    this.revenueChart = this.getCachedData<RevenueChartDto>(StorageKeyConst._DASHBOARD_REVENUE_CHART, salonId);
    this.revenueActivity = this.getCachedData<RevenueActivityDto>(StorageKeyConst._DASHBOARD_REVENUE_ACTIVITY, salonId);
    this.salonOccupancy = this.getCachedData<SalonOccupancyDto>(StorageKeyConst._DASHBOARD_SALON_OCCUPANCY, salonId);
    this.orderStats = this.dashboardMetrics?.orderStats ?? null;
    this.topServices = this.dashboardMetrics?.topServices ?? [];
    
    this.loading = false;
  }

  private loadFromBackend(salonId: string): void {
    const stylistId = this.selectedStylist?.id;
    
    // Activar todos los estados de carga individuales
    this.setAllLoadingCharts(true);

    // Cargar KPI Cards
    this.dashboardService.getKpiCards(salonId, this.startDateFilter, this.endDateFilter, stylistId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.setCachedData(StorageKeyConst._DASHBOARD_KPI_CARDS, salonId, result);
          this.kpiCards = result;
          this.loadingCharts.kpiCards = false;
          this.updateGlobalLoading();
        },
        error: () => {
          this.loadingCharts.kpiCards = false;
          this.updateGlobalLoading();
        }
      });

    // Cargar Revenue Chart
    this.dashboardService.getRevenueChart(salonId, this.startDateFilter, this.endDateFilter, stylistId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.setCachedData(StorageKeyConst._DASHBOARD_REVENUE_CHART, salonId, result);
          this.revenueChart = result;
          this.loadingCharts.revenueChart = false;
          this.updateGlobalLoading();
        },
        error: () => {
          this.loadingCharts.revenueChart = false;
          this.updateGlobalLoading();
        }
      });

    // Cargar Revenue Activity
    this.dashboardService.getRevenueActivity(salonId, this.startDateFilter, this.endDateFilter, stylistId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.setCachedData(StorageKeyConst._DASHBOARD_REVENUE_ACTIVITY, salonId, result);
          this.revenueActivity = result;
          this.loadingCharts.revenueActivity = false;
          this.updateGlobalLoading();
        },
        error: () => {
          this.loadingCharts.revenueActivity = false;
          this.updateGlobalLoading();
        }
      });

    // Cargar Metrics (orderStats y topServices)
    this.dashboardService.getMetrics(salonId, this.startDateFilter, this.endDateFilter, stylistId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.setCachedData(StorageKeyConst._DASHBOARD_METRICS, salonId, result);
          this.orderStats = result?.orderStats ?? null;
          this.topServices = result?.topServices ?? [];
          this.loadingCharts.orderStats = false;
          this.loadingCharts.topServices = false;
          this.updateGlobalLoading();
        },
        error: () => {
          this.loadingCharts.orderStats = false;
          this.loadingCharts.topServices = false;
          this.updateGlobalLoading();
        }
      });

    // Cargar Salon Occupancy
    this.dashboardService.getSalonOccupancy(salonId, this.startDateFilter, this.endDateFilter, stylistId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.setCachedData(StorageKeyConst._DASHBOARD_SALON_OCCUPANCY, salonId, result);
          this.salonOccupancy = result;
          this.loadingCharts.salonOccupancy = false;
          this.updateGlobalLoading();
        },
        error: () => {
          this.loadingCharts.salonOccupancy = false;
          this.updateGlobalLoading();
        }
      });
  }

  private setAllLoadingCharts(value: boolean): void {
    this.loadingCharts.kpiCards = value;
    this.loadingCharts.revenueChart = value;
    this.loadingCharts.revenueActivity = value;
    this.loadingCharts.orderStats = value;
    this.loadingCharts.topServices = value;
    this.loadingCharts.salonOccupancy = value;
  }

  private updateGlobalLoading(): void {
    this.loading = Object.values(this.loadingCharts).some(loading => loading);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
