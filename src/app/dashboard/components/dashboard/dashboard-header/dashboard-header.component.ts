import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { KpiData } from '@app/core/models/bussiness';
import { KpiCardsDto } from '@app/core/models/bussiness/dashboard-dtos';

@Component({
  selector: 'app-dashboard-header',
  templateUrl: './dashboard-header.component.html',
  styleUrls: ['./dashboard-header.component.scss']
})
export class DashboardHeaderComponent implements OnChanges {
  @Input() selectedSalon: string = 'salon-1';
  @Input() dateFilter: Date = new Date();
  @Input() notifications: number = 3;
  @Input() kpiCards: KpiCardsDto | null = null;
  @Input() loading: boolean = false;
  
  @Output() salonChange = new EventEmitter<string>();
  @Output() dateChange = new EventEmitter<Date>();

  kpiData: KpiData[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['kpiCards'] && this.kpiCards) {
      this.updateKpiData();
    }
  }

  private updateKpiData(): void {
    if (this.kpiCards) {
      this.kpiData = [
        {
          title: 'Actual Operation',
          value: `${this.kpiCards.actualOperation.toFixed(1)}%`,
          change: this.formatChange(this.kpiCards.actualOperationChange),
          trend: this.kpiCards.actualOperationChange >= 0 ? 'up' : 'down',
          icon: 'gauge'
        },
        {
          title: 'Daily Revenue',
          value: this.formatCurrency(this.kpiCards.dailyRevenue),
          change: this.formatChange(this.kpiCards.dailyRevenueChange),
          trend: this.kpiCards.dailyRevenueChange >= 0 ? 'up' : 'down',
          icon: 'revenue'
        },
        {
          title: 'Ongoing Bookings',
          value: this.kpiCards.ongoingBookings.toString(),
          change: this.formatChangeNumber(this.kpiCards.ongoingBookingsChange),
          trend: this.kpiCards.ongoingBookingsChange >= 0 ? 'up' : 'down',
          icon: 'sessions'
        }
      ];
    }
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  private formatChange(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  }

  private formatChangeNumber(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value}`;
  }

  trackByIndex(index: number): number {
    return index;
  }
}
