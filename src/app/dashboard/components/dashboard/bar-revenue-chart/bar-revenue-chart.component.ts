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
  ApexFill,
  ApexStroke,
  ChartComponent
} from 'ng-apexcharts';


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
export class BarRevenueChartComponent {

  @ViewChild('barChart') barChart!: ChartComponent;
   public barChartOptions: Partial<BarChartOptions>;
   constructor() {
    this.barChartOptions = {
      series: [
        {
          name: 'Net Profit',
          data: [18, 21, 17, 24, 21, 27, 25, 32, 26]
        },
        {
          name: 'Revenue',
          data: [21, 24, 20, 27, 25, 29, 26, 34, 30]
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
        categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']
      },
      yaxis: {
        labels: {
          formatter: function(value: number) {
            return value + 'k';
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
          gradientToColors: ['#a7cee8', '#474d5f'],
          opacityFrom: 1,
          opacityTo: 1
        }
      }
    };
  }

}
