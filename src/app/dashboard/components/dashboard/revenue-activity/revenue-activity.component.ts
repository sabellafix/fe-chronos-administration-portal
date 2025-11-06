import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RevenueActivityDto } from '@app/core/models/bussiness/dashboard-dtos';

@Component({
  selector: 'app-revenue-activity',
  templateUrl: './revenue-activity.component.html',
  styleUrl: './revenue-activity.component.scss'
})
export class RevenueActivityComponent implements OnChanges {

  @Input() loading: boolean = false;
  @Input() revenueActivity: RevenueActivityDto | null = null;

  areaChartOptions: any = {
    chart: {
      height: 270,
      type: 'area',
      toolbar: {
        show: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    series: [
      {
        name: 'Current',
        data: []
      },
      {
        name: 'Previous',
        data: []
      }
    ],
    colors: ['#6A8EEB', '#F09080'],
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right'
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.45,
        opacityTo: 0.05
      }
    },
    yaxis: {
      tickAmount: 4
    },
    xaxis: {
      categories: []
    }
  };

  constructor() {
  }

  ngOnInit() {
    this.updateChartData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['revenueActivity'] && this.revenueActivity) {
      this.updateChartData();
    }
  }

  private updateChartData(): void {
    if (this.revenueActivity && this.revenueActivity.weeklyData && this.revenueActivity.weeklyData.length > 0) {
      const categories = this.revenueActivity.weeklyData.map(item => item.dayOfWeek || '');
      const currentData = this.revenueActivity.weeklyData.map(item => item.currentWeekRevenue);
      const previousData = this.revenueActivity.weeklyData.map(item => item.previousWeekRevenue);

      this.areaChartOptions = {
        ...this.areaChartOptions,
        series: [
          {
            name: 'Current Week',
            data: currentData
          },
          {
            name: 'Previous Week',
            data: previousData
          }
        ],
        xaxis: {
          ...this.areaChartOptions.xaxis,
          categories: categories
        }
      };
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
}
