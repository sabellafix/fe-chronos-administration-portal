import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { SalonStateService } from '@app/core/services/shared/salon-state.service';
import { DashboardService } from '@app/core/services/http/dashboard.service';
import { Salon } from '@app/core/models/bussiness/salon';
import {
  DashboardMetricsDto,
  KpiCardsDto,
  RevenueChartDto,
  RevenueActivityDto,
  OrderStatsDto,
  TopServiceDto,
  SalonOccupancyDto
} from '@app/core/models/bussiness/dashboard-dtos';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  selectedSalon: Salon | null = null;
  dateFilter: Date = new Date();
  currentView: 'calendar' | 'chart' = 'chart';
  loading: boolean = false;
  dashboardMetrics: DashboardMetricsDto | null = null;
  kpiCards: KpiCardsDto | null = null;
  revenueChart: RevenueChartDto | null = null;
  revenueActivity: RevenueActivityDto | null = null;
  orderStats: OrderStatsDto | null = null;
  topServices: TopServiceDto[] = [];
  salonOccupancy: SalonOccupancyDto | null = null;

  private destroy$: Subject<void> = new Subject<void>();

  constructor(
    private salonStateService: SalonStateService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.salonStateService.selectedSalon$
      .pipe(takeUntil(this.destroy$))
      .subscribe(salon => {
        if (salon != null) {
          this.selectedSalon = salon;
          this.loadServices();
        }
      });
  }

  loadServices(): void {
    if (!this.selectedSalon || !this.selectedSalon.id) {
      console.warn('No hay salón seleccionado');
      return;
    }

    this.loading = true;
    const salonId = this.selectedSalon.id;

    forkJoin({
      metrics: this.dashboardService.getMetrics(salonId, this.dateFilter),
      kpiCards: this.dashboardService.getKpiCards(salonId, this.dateFilter),
      revenueChart: this.dashboardService.getRevenueChart(salonId, this.dateFilter),
      revenueActivity: this.dashboardService.getRevenueActivity(salonId, this.dateFilter),
      orderStats: this.dashboardService.getOrderStats(salonId, this.dateFilter, this.dateFilter),
      topServices: this.dashboardService.getTopServices(salonId, 10, this.dateFilter, this.dateFilter),
      salonOccupancy: this.dashboardService.getSalonOccupancy(salonId, this.dateFilter)
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          this.dashboardMetrics = results.metrics;
          this.kpiCards = results.kpiCards;
          this.revenueChart = results.revenueChart;
          this.revenueActivity = results.revenueActivity;
          this.orderStats = results.orderStats;
          this.topServices = results.topServices;
          this.salonOccupancy = results.salonOccupancy;
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
        }
      });
  }

  loadMetrics(): void {
    if (!this.selectedSalon?.id) return;

    this.dashboardService.getMetrics(this.selectedSalon.id, this.dateFilter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.dashboardMetrics = data;
        },
        error: (error) => {
          console.error('Dashboard - Error al cargar métricas:', error);
        }
      });
  }

  loadKpiCards(): void {
    if (!this.selectedSalon?.id) return;

    this.dashboardService.getKpiCards(this.selectedSalon.id, this.dateFilter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.kpiCards = data;
        },
        error: (error) => {
          console.error('Dashboard - Error al cargar KPI Cards:', error);
        }
      });
  }

  loadRevenueChart(): void {
    if (!this.selectedSalon?.id) return;

    this.dashboardService.getRevenueChart(this.selectedSalon.id, this.dateFilter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.revenueChart = data;
        },
        error: (error) => {
          console.error('Dashboard - Error al cargar gráfico de ingresos:', error);
        }
      });
  }

  loadRevenueActivity(): void {
    if (!this.selectedSalon?.id) return;

    this.dashboardService.getRevenueActivity(this.selectedSalon.id, this.dateFilter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.revenueActivity = data;
        },
        error: (error) => {
          console.error('Dashboard - Error al cargar actividad de ingresos:', error);
        }
      });
  }

  loadOrderStats(): void {
    if (!this.selectedSalon?.id) return;

    this.dashboardService.getOrderStats(this.selectedSalon.id, this.dateFilter, this.dateFilter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.orderStats = data;
        },
        error: (error) => {
          console.error('Dashboard - Error al cargar estadísticas de órdenes:', error);
        }
      });
  }

  loadTopServices(): void {
    if (!this.selectedSalon?.id) return;

    this.dashboardService.getTopServices(this.selectedSalon.id, 10, this.dateFilter, this.dateFilter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.topServices = data;
        },
        error: (error) => {
          console.error('Dashboard - Error al cargar top servicios:', error);
        }
      });
  }

  loadSalonOccupancy(): void {
    if (!this.selectedSalon?.id) return;

    this.dashboardService.getSalonOccupancy(this.selectedSalon.id, this.dateFilter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.salonOccupancy = data;
        },
        error: (error) => {
          console.error('Dashboard - Error al cargar ocupación del salón:', error);
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

  onDateChange(date: Date): void {
    this.dateFilter = date;
    // Recargar los servicios con la nueva fecha
    this.loadServices();
  }
}
