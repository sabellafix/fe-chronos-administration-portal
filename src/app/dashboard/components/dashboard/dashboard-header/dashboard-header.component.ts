import { Component, EventEmitter, Input, Output } from '@angular/core';
import { KpiData } from '@app/core/models/bussiness';

@Component({
  selector: 'app-dashboard-header',
  templateUrl: './dashboard-header.component.html',
  styleUrls: ['./dashboard-header.component.scss']
})
export class DashboardHeaderComponent {
  @Input() selectedSalon: string = 'salon-1';
  @Input() dateFilter: Date = new Date();
  @Input() notifications: number = 3;
  
  @Output() salonChange = new EventEmitter<string>();
  @Output() dateChange = new EventEmitter<Date>();

  kpiData: KpiData[] = [
    {
      title: 'Actual Operation',
      value: '78%',
      change: '+5.2%',
      trend: 'up',
      icon: 'gauge'
    },
    {
      title: 'Daily Revenue',
      value: '$2,450',
      change: '+12.5%',
      trend: 'up',
      icon: 'revenue'
    },
    {
      title: 'Ongoing Bookings',
      value: '12',
      change: '-2',
      trend: 'down',
      icon: 'sessions'
    }
  ];

  trackByIndex(index: number): number {
    return index;
  }
}
