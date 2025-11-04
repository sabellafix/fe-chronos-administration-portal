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
import { SalonOccupancyDto } from '@app/core/models/bussiness/dashboard-dtos';


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
  selector: 'app-bar-ocupation-chart',
  templateUrl: './bar-ocupation-chart.component.html',
  styleUrl: './bar-ocupation-chart.component.scss'
})
export class BarOcupationChartComponent implements OnChanges {

  @Input() salonOccupancy: SalonOccupancyDto | null = null;
  @ViewChild('barChart') barChart!: ChartComponent;
  public barChartOptions: Partial<BarChartOptions>;

  constructor() {
    this.barChartOptions = this.getDefaultChartOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['salonOccupancy'] && this.salonOccupancy) {
      this.updateChartData();
    }
  }

  private getDefaultChartOptions(): Partial<BarChartOptions> {
    return {
      series: [
        {
          name: 'Ocupación Año Actual',
          data: []
        },
        {
          name: 'Ocupación Año Anterior',
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
            return value.toFixed(0) + '%';
          }
        },
        tickAmount: 4,
        min: 0,
        max: 100
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
          gradientToColors: ['#a7cee8', '#474d5f'],
          opacityFrom: 1,
          opacityTo: 1
        }
      }
    };
  }

  private updateChartData(): void {
    if (!this.salonOccupancy || !this.salonOccupancy.monthlyData) {
      return;
    }

    const categories = this.salonOccupancy.monthlyData.map(item => item.month || '');
    const currentYearData = this.salonOccupancy.monthlyData.map(item => item.currentYearOccupancy);
    const previousYearData = this.salonOccupancy.monthlyData.map(item => item.previousYearOccupancy);

    this.barChartOptions = {
      ...this.barChartOptions,
      series: [
        {
          name: 'Ocupación Año Actual',
          data: currentYearData
        },
        {
          name: 'Ocupación Año Anterior',
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
