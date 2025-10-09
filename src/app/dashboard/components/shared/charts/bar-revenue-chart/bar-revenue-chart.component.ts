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
          name: 'Revenue',
          data: [28000, 35000, 30000, 42000, 38000, 45000]
        },
        {
          name: 'Expenses',
          data: [12000, 15000, 13000, 18000, 16000, 19000]
        }
      ],
      chart: {
        type: 'bar',
        height: 350,
        toolbar: {
          show: true
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '25%',
          borderRadius: 10,
        }
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
      },
      yaxis: {
        title: {
          text: 'Amount ($)'
        }
      },
      colors: ['#1e2e47', '#f1f3f7'],
      legend: {
        position: 'top',
        horizontalAlign: 'left'
      },
      grid: {
        borderColor: '#f1f1f1'
      }
    };
  }

}
