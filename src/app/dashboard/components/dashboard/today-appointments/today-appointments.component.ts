import { Component, OnInit } from '@angular/core';
import { DailyAppointment, BookingStatusConfig } from '@app/core/models/bussiness';

@Component({
  selector: 'app-today-appointments',
  templateUrl: './today-appointments.component.html',
  styleUrls: ['./today-appointments.component.scss']
})
export class TodayAppointmentsComponent implements OnInit {
  appointments: DailyAppointment[] = [];
  currentTime: string = '';

  ngOnInit(): void {
    this.loadAppointments();
    this.updateCurrentTime();
    
    // Actualizar la hora cada minuto
    setInterval(() => this.updateCurrentTime(), 60000);
  }

  /**
   * Carga las citas del día (datos de ejemplo)
   */
  loadAppointments(): void {
    this.appointments = [
      {
        id: '1',
        time: '09:00',
        customerName: 'María García',
        customerPhone: '+34 666 123 456',
        service: 'HairCut and Hairdressing',
        stylist: 'Ana López',
        duration: '1h 30min',
        price: 45,
        status: 'confirmed'
      },
      {
        id: '2',
        time: '10:30',
        customerName: 'Carmen Silva',
        customerPhone: '+34 666 234 567',
        service: 'Complete Coloration',
        stylist: 'Ana López',
        duration: '2h 30min',
        price: 85,
        status: 'in-progress'
      },
      {
        id: '3',
        time: '14:00',
        customerName: 'Laura Ruiz',
        customerPhone: '+34 666 345 678',
        service: 'Manicure and Pedicure',
        stylist: 'Elena Martín',
        duration: '1h',
        price: 25,
        status: 'confirmed'
      },
      {
        id: '4',
        time: '15:30',
        customerName: 'Isabel Moreno',
        customerPhone: '+34 666 456 789',
        service: 'HairCut and Hairdressing',
        stylist: 'Sofia Herrera',
        duration: '1h 15min',
        price: 35,
        status: 'pending'
      },
      {
        id: '5',
        time: '17:00',
        customerName: 'Patricia Vega',
        customerPhone: '+34 666 567 890',
        service: 'Hair Treatment',
        stylist: 'Ana López',
        duration: '1h',
        price: 55,
        status: 'confirmed'
      }
    ];
  }

  /**
   * Actualiza la hora actual
   */
  updateCurrentTime(): void {
    this.currentTime = new Date().toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  /**
   * Obtiene la configuración del estado
   */
  getStatusConfig(status: string): BookingStatusConfig {
    const configs: Record<string, BookingStatusConfig> = {
      'pending': { 
        label: 'Pending', 
        variant: 'warning', 
        color: 'bg-warning-subtle text-warning-emphasis' 
      },
      'confirmed': { 
        label: 'Confirmed', 
        variant: 'primary', 
        color: 'bg-primary-subtle text-primary-emphasis' 
      },
      'in-progress': { 
        label: 'In Progress', 
        variant: 'success', 
        color: 'bg-success-subtle text-success-emphasis' 
      },
      'completed': { 
        label: 'Completed', 
        variant: 'secondary', 
        color: 'bg-secondary-subtle text-secondary-emphasis' 
      },
      'cancelled': { 
        label: 'Cancelled', 
        variant: 'danger', 
        color: 'bg-danger-subtle text-danger-emphasis' 
      }
    };
    return configs[status] || configs['pending'];
  }

  /**
   * Calcula el total del día
   */
  getTotalRevenue(): number {
    return this.appointments.reduce((sum, apt) => sum + apt.price, 0);
  }

  /**
   * Calcula las citas restantes
   */
  getRemainingAppointments(): number {
    return this.appointments.filter(apt => 
      apt.status === 'confirmed' || apt.status === 'pending'
    ).length;
  }

  /**
   * Maneja las acciones del menú
   */
  onAction(action: string, appointment: DailyAppointment): void {
    console.log(`Acción: ${action}`, appointment);
    // TODO: Implementar acciones reales
  }
}
