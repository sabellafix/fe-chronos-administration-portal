import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { OrderStatsDto } from '@app/core/models/bussiness/dashboard-dtos';

@Component({
  selector: 'app-booking-stats',
  templateUrl: './booking-stats.component.html',
  styleUrl: './booking-stats.component.scss'
})
export class BookingStatsComponent implements OnChanges {

  @Input() loading: boolean = false;
  @Input() orderStats: OrderStatsDto | null = null;
  
  chartOptions: any = {
    series: [0, 0, 0],
    chart: {
      type: 'donut',
      height: 220,
      width: 220
    },
    colors: ['#6A8EEB', '#F09080', '#E0E0E0'],
    labels: ['Completed', 'Pending', 'Cancel'],
    plotOptions: {
      pie: {
        donut: {
          size: '70%'
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      curve: 'smooth',
      width: 2,
      colors: ['white']
    },
    legend: {
      show: false,
      position: 'bottom',
      horizontalAlign: 'center',
      verticalAlign: 'middle',
      floating: false,
      fontSize: '14px',
      offsetX: 0
    },
    tooltip: {
      enabled: false
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 0.4,
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 50, 53, 91]
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 180,
          height: 180
        }
      }
    }]
  };

  constructor() {
  }

  ngOnInit() {
    this.updateChartData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['orderStats'] && this.orderStats) {
      this.updateChartData();
    }
  }

  private updateChartData(): void {
    if (this.orderStats) {
      this.chartOptions = {
        ...this.chartOptions,
        series: [
          this.orderStats.completed,
          this.orderStats.pending,
          this.orderStats.cancelled
        ]
      };
    }
  }
}
