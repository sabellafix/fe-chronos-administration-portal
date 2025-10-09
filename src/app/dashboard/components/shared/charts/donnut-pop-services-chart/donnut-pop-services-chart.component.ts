import { Component, ViewChild } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexYAxis,
  ApexLegend,
  ApexPlotOptions,
  ApexGrid,
  ApexStroke,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ChartComponent
} from 'ng-apexcharts';

export type PieChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  legend: ApexLegend;
  responsive: ApexResponsive[];
  dataLabels: ApexDataLabels;
};

@Component({
  selector: 'app-donnut-pop-services-chart',
  templateUrl: './donnut-pop-services-chart.component.html',
  styleUrl: './donnut-pop-services-chart.component.scss'
})
export class DonnutPopServicesChartComponent {

  @ViewChild('pieChart') pieChart!: ChartComponent;
  public pieChartOptions: Partial<PieChartOptions>;

  constructor() {
     // Inicializar gráfico de torta
     this.pieChartOptions = {
      series: [44, 55, 13, 43],
      chart: {
        type: 'donut',
        height: 350
      },
      labels: ['Corte de Cabello', 'Tinte', 'Manicura', 'Tratamientos'],
      colors: ['#3b76e1', '#02a499', '#f1b44c', '#f46a6a'],
      legend: {
        position: 'bottom'
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      ],
      dataLabels: {
        enabled: true,
        formatter: function (val: number) {
          return val.toFixed(1) + '%';
        }
      }
    };
  }

}
