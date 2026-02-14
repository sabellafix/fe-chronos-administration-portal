import { Component, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexYAxis,
  ApexLegend,
  ApexPlotOptions,
  ApexGrid,
  ApexFill,
  ApexStroke,
  ChartComponent
} from 'ng-apexcharts';
import { RevenueChartDto } from '@app/core/models/bussiness/dashboard-dtos';


export type BarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  colors: string[];
  legend: ApexLegend;
  grid: ApexGrid;
  fill: ApexFill;
  stroke: ApexStroke;
};


@Component({
  selector: 'app-bar-revenue-chart',
  templateUrl: './bar-revenue-chart.component.html',
  styleUrl: './bar-revenue-chart.component.scss'
})
export class BarRevenueChartComponent implements OnChanges {

  @Input() revenueChart: RevenueChartDto | null = null;
  @ViewChild('barChart') barChart!: ChartComponent;
  public barChartOptions: Partial<BarChartOptions>;

  constructor() {
    this.barChartOptions = this.getDefaultChartOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['revenueChart'] && this.revenueChart) {
      this.updateChartData();
    }
  }

  private getDefaultChartOptions(): Partial<BarChartOptions> {
    return {
      series: [
        {
          name: 'Current Year Revenue',
          data: []
        },
        {
          name: 'Previous Year Revenue',
          data: []
        }
      ],
      chart: {
        type: 'bar',
        height: 350,
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '35%',
          borderRadius: 6
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      colors: ['#fff', '#fff'],
      xaxis: {
        categories: []
      },
      yaxis: {
        labels: {
          formatter: function(value: number) {
            return '$' + (value / 1000).toFixed(0) + 'k';
          }
        },
        tickAmount: 4
      },
      legend: {
        show: false
      },
      grid: {
        borderColor: '#f1f1f1'
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 1,
          inverseColors: true,
          gradientToColors: ['#474d5f', '#a7cee8'],
          opacityFrom: 1,
          opacityTo: 1
        }
      }
    };
  }

  private updateChartData(): void {
    if (!this.revenueChart || !this.revenueChart.monthlyData) {
      return;
    }

    const categories = this.revenueChart.monthlyData.map(item => item.month || '');
    const currentYearData = this.revenueChart.monthlyData.map(item => item.currentYearRevenue);
    const previousYearData = this.revenueChart.monthlyData.map(item => item.previousYearRevenue);

    this.barChartOptions = {
      ...this.barChartOptions,
      series: [
        {
          name: 'Current Year Revenue',
          data: currentYearData
        },
        {
          name: 'Previous Year Revenue',
          data: previousYearData
        }
      ],
      xaxis: {
        ...this.barChartOptions.xaxis,
        categories: categories
      }
    };

    // Actualizar el gráfico si ya está renderizado
    if (this.barChart) {
      this.barChart.updateOptions(this.barChartOptions);
    }
  }

}
