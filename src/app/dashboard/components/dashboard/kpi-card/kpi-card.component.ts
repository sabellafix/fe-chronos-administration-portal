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

  /**
   * Obtiene la clase de icono de Bootstrap Icons según el tipo
   */
  getIconClass(): string {
    const iconMap: Record<KpiIconType, string> = {
      'gauge': 'bi-speedometer2',
      'revenue': 'bi-currency-dollar',
      'sessions': 'bi-clock-history',
      'stylists': 'bi-people-fill'
    };
    return iconMap[this.icon] || 'bi-speedometer2';
  }

  /**
   * Obtiene el color del icono según el tipo
   */
  getIconColor(): string {
    const colorMap: Record<KpiIconType, string> = {
      'gauge': 'text-primary',
      'revenue': 'text-success',
      'sessions': 'text-info',
      'stylists': 'text-warning'
    };
    return colorMap[this.icon] || 'text-primary';
  }

  /**
   * Obtiene la clase de tendencia
   */
  getTrendClass(): string {
    return this.trend === 'up' ? 'text-success' : 'text-danger';
  }

  /**
   * Obtiene el icono de tendencia
   */
  getTrendIcon(): string {
    return this.trend === 'up' ? 'bi-arrow-up' : 'bi-arrow-down';
  }
}
