import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { SalonStateService } from '@app/core/services/shared/salon-state.service';
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
  displayPayments: boolean = false;
  selectedStylist: User | null = null;
  isStylistPanelVisible: boolean = false;

  private destroy$: Subject<void> = new Subject<void>();
  
  private readonly CACHE_EXPIRATION_MS = 5 * 60 * 1000;
  private readonly CACHE_DELAY_MS = 1000;

  constructor(
    private salonStateService: SalonStateService,
    private dashboardService: DashboardService,
    private storageService: StorageService,
    private waitService: WaitService,
    private dashboardFiltersService: DashboardFiltersService
  ) {}

  ngOnInit(): void {
    // Inicializar fechas desde el servicio de filtros
    const initialFilters = this.dashboardFiltersService.getCurrentFilters();
    this.startDateFilter = initialFilters.startDate;
    this.endDateFilter = initialFilters.endDate;

    // Suscribirse al salón seleccionado
    this.salonStateService.selectedSalon$
      .pipe(takeUntil(this.destroy$))
      .subscribe(salon => {
        if (salon != null) {
          this.selectedSalon = salon;
          this.loadServices();
        }
      });

    // Suscribirse a los cambios de filtros del topbar
    this.dashboardFiltersService.filters$
      .pipe(takeUntil(this.destroy$))
      .subscribe(filters => {
        this.startDateFilter = filters.startDate;
        this.endDateFilter = filters.endDate;
        
        // Actualizar visibilidad del panel de estilista
        this.selectedStylist = filters.selectedStylist;
        this.isStylistPanelVisible = filters.selectedStylist !== null;
        
        // Solo recargar si hay un salón seleccionado
        if (this.selectedSalon) {
          this.loadServices();
        }
      });
  }

  async loadServices(): Promise<void> {
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

    // Verificar si hay datos en caché válidos
    if (this.isCacheValid(salonId)) {
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
    forkJoin({
      metrics: this.dashboardService.getMetrics(salonId, this.startDateFilter, this.endDateFilter),
      kpiCards: this.dashboardService.getKpiCards(salonId, this.startDateFilter, this.endDateFilter),
      revenueChart: this.dashboardService.getRevenueChart(salonId, this.startDateFilter, this.endDateFilter),
      revenueActivity: this.dashboardService.getRevenueActivity(salonId, this.startDateFilter, this.endDateFilter),      
      salonOccupancy: this.dashboardService.getSalonOccupancy(salonId, this.startDateFilter, this.endDateFilter)
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          // Guardar en caché con las fechas actuales
          this.setCachedData(StorageKeyConst._DASHBOARD_METRICS, salonId, results.metrics);
          this.setCachedData(StorageKeyConst._DASHBOARD_KPI_CARDS, salonId, results.kpiCards);
          this.setCachedData(StorageKeyConst._DASHBOARD_REVENUE_CHART, salonId, results.revenueChart);
          this.setCachedData(StorageKeyConst._DASHBOARD_REVENUE_ACTIVITY, salonId, results.revenueActivity);
          this.setCachedData(StorageKeyConst._DASHBOARD_SALON_OCCUPANCY, salonId, results.salonOccupancy);

          // Asignar valores
          this.dashboardMetrics = results.metrics;
          this.kpiCards = results.kpiCards;
          this.revenueChart = results.revenueChart;
          this.revenueActivity = results.revenueActivity;
          this.orderStats = results.metrics?.orderStats ?? null;
          this.topServices = results.metrics?.topServices ?? [];
          this.salonOccupancy = results.salonOccupancy;
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  switchView(view: 'calendar' | 'chart'): void {
    this.currentView = view;
  }

  onDateRangeChange(startDate: Date, endDate: Date): void {
    this.startDateFilter = startDate;
    this.endDateFilter = endDate;
    this.loadServices();
  }
}
