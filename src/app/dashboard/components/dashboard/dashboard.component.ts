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

    forkJoin({
      metrics: this.dashboardService.getMetrics(salonId, this.dateFilter),
      kpiCards: this.dashboardService.getKpiCards(salonId, this.dateFilter),
      revenueChart: this.dashboardService.getRevenueChart(salonId, this.dateFilter),
      revenueActivity: this.dashboardService.getRevenueActivity(salonId, this.dateFilter),      
      salonOccupancy: this.dashboardService.getSalonOccupancy(salonId, this.dateFilter)
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
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

  onDateChange(date: Date): void {
    this.dateFilter = date;
    this.loadServices();
  }
}
