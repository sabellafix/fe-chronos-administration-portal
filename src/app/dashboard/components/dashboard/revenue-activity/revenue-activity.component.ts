import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-revenue-activity',
  templateUrl: './revenue-activity.component.html',
  styleUrl: './revenue-activity.component.scss'
})
export class RevenueActivityComponent {

  @Input() loading: boolean = false;

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
        data: [21, 54, 45, 84, 48, 56]
      },
      {
        name: 'Previous',
        data: [40, 32, 60, 32, 55, 45]
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
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    }
  };

  constructor() {
  }

  ngOnInit() {
   
  }
}
