import { Component, OnInit } from '@angular/core';
import { StylistInfo, StylistStatusConfig } from '@app/core/models/bussiness';

@Component({
  selector: 'app-stylists-status',
  templateUrl: './stylists-status.component.html',
  styleUrls: ['./stylists-status.component.scss']
})
export class StylistsStatusComponent implements OnInit {
  stylists: StylistInfo[] = [];

  ngOnInit(): void {
    this.loadStylists();
  }

  /**
   * Carga la información de los estilistas (datos de ejemplo)
   */
  loadStylists(): void {
    this.stylists = [
      {
        id: '1',
        name: 'Ana López',
        status: 'busy',
        currentClient: 'Carmen Silva',
        nextAppointment: '14:00',
        todayBookings: 6,
        todayRevenue: 280,
        completionRate: 95,
        specialties: ['Coloración', 'Corte']
      },
      {
        id: '2',
        name: 'Elena Martín',
        status: 'available',
        nextAppointment: '14:00',
        todayBookings: 4,
        todayRevenue: 180,
        completionRate: 100,
        specialties: ['Manicure', 'Pedicure']
      },
      {
        id: '3',
        name: 'Sofia Herrera',
        status: 'available',
        nextAppointment: '15:30',
        todayBookings: 5,
        todayRevenue: 220,
        completionRate: 90,
        specialties: ['Corte', 'Peinado']
      },
      {
        id: '4',
        name: 'María Jiménez',
        status: 'break',
        nextAppointment: '16:00',
        todayBookings: 3,
        todayRevenue: 150,
        completionRate: 87,
        specialties: ['Tratamientos', 'Masajes']
      },
      {
        id: '5',
        name: 'Carmen Ruiz',
        status: 'offline',
        todayBookings: 8,
        todayRevenue: 350,
        completionRate: 98,
        specialties: ['Coloración', 'Mechas']
      }
    ];
  }

  /**
   * Obtiene la configuración del estado del estilista
   */
  getStatusConfig(status: string): StylistStatusConfig {
    const configs: Record<string, StylistStatusConfig> = {
      'available': {
        label: 'Disponible',
        variant: 'success',
        color: 'bg-success-subtle text-success-emphasis'
      },
      'busy': {
        label: 'Ocupado',
        variant: 'primary',
        color: 'bg-primary-subtle text-primary-emphasis'
      },
      'break': {
        label: 'Descanso',
        variant: 'warning',
        color: 'bg-warning-subtle text-warning-emphasis'
      },
      'offline': {
        label: 'No disponible',
        variant: 'secondary',
        color: 'bg-secondary-subtle text-secondary-emphasis'
      }
    };
    return configs[status] || configs['available'];
  }

  /**
   * Obtiene las iniciales del estilista
   */
  getStylistInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  /**
   * Obtiene el icono del estado
   */
  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'available': 'bi-check-circle-fill',
      'busy': 'bi-clock-fill',
      'break': 'bi-pause-circle-fill',
      'offline': 'bi-x-circle-fill'
    };
    return icons[status] || 'bi-check-circle-fill';
  }
}
