import { Component, Input } from '@angular/core';
import { KpiData, KpiIconType, KpiTrend } from '@app/core/models/bussiness';

@Component({
  selector: 'app-kpi-card',
  templateUrl: './kpi-card.component.html',
  styleUrls: ['./kpi-card.component.scss']
})
export class KpiCardComponent {
  @Input() title: string = '';
  @Input() value: string = '';
  @Input() change: string = '';
  @Input() trend: KpiTrend = 'up';
  @Input() icon: KpiIconType = 'gauge';

  getIconClass(): string {
    const iconMap: Record<KpiIconType, string> = {
      'gauge': 'bi-speedometer2',
      'revenue': 'bi-currency-dollar',
      'sessions': 'bi-clock-history',
      'stylists': 'bi-people-fill'
    };
    return iconMap[this.icon] || 'bi-speedometer2';
  }

  getIconColor(): string {
    const colorMap: Record<KpiIconType, string> = {
      'gauge': 'bg-primary',
      'revenue': 'bg-success',
      'sessions': 'bg-info',
      'stylists': 'bg-warning'
    };
    return colorMap[this.icon] || 'text-primary';
  }

  getBgIconColor(): string {
    const colorMap: Record<KpiIconType, string> = {
      'gauge': 'bg-primary',
      'revenue': 'bg-success',
      'sessions': 'bg-info',
      'stylists': 'bg-warning'
    };
    return colorMap[this.icon] || 'bg-primary';
  }


  getTrendClass(): string {
    return this.trend === 'up' ? 'text-success' : 'text-danger';
  }


  getTrendIcon(): string {
    return this.trend === 'up' ? 'bi-arrow-up' : 'bi-arrow-down';
  }
}
