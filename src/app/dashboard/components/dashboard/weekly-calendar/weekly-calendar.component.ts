import { Component, Input, OnInit } from '@angular/core';
import { CalendarBooking } from '@app/core/models/bussiness';

@Component({
  selector: 'app-weekly-calendar',
  templateUrl: './weekly-calendar.component.html',
  styleUrls: ['./weekly-calendar.component.scss']
})
export class WeeklyCalendarComponent implements OnInit {
  @Input() dateFilter: Date = new Date();
  
  currentWeek: Date = new Date();
  weekDays: Date[] = [];
  dayNames: string[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  timeSlots: string[] = [];
  
  // Datos de ejemplo de citas
  sampleBookings: CalendarBooking[] = [
    {
      id: '1',
      time: '09:00',
      endTime: '10:30',
      customerName: 'María García',
      service: 'Corte y Peinado',
      stylist: 'Ana López',
      status: 'confirmed',
      color: 'booking-confirmed'
    },
    {
      id: '2',
      time: '10:00',
      endTime: '12:00',
      customerName: 'Carmen Silva',
      service: 'Coloración',
      stylist: 'Ana López',
      status: 'in-progress',
      color: 'booking-in-progress'
    },
    {
      id: '3',
      time: '14:00',
      endTime: '15:00',
      customerName: 'Laura Ruiz',
      service: 'Manicure',
      stylist: 'Elena Martín',
      status: 'confirmed',
      color: 'booking-confirmed'
    }
  ];

  ngOnInit(): void {
    this.generateTimeSlots();
    this.generateWeekDays();
  }

  /**
   * Genera los slots de tiempo desde las 6:00 hasta las 22:00
   */
  generateTimeSlots(): void {
    this.timeSlots = Array.from({ length: 16 }, (_, i) => {
      const hour = i + 6;
      return `${hour.toString().padStart(2, '0')}:00`;
    });
  }

  /**
   * Genera los días de la semana actual
   */
  generateWeekDays(): void {
    const startOfWeek = new Date(this.currentWeek);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    this.weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  }

  /**
   * Navega a la semana anterior o siguiente
   */
  navigateWeek(direction: 'prev' | 'next'): void {
    const newWeek = new Date(this.currentWeek);
    newWeek.setDate(this.currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    this.currentWeek = newWeek;
    this.generateWeekDays();
  }

  /**
   * Vuelve a la semana actual
   */
  goToToday(): void {
    this.currentWeek = new Date();
    this.generateWeekDays();
  }

  /**
   * Verifica si una fecha es hoy
   */
  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  /**
   * Obtiene la cita para un slot de tiempo específico
   */
  getBookingForTimeSlot(dayIndex: number, time: string): CalendarBooking | null {
    // Lógica simple para distribuir las citas a través de la semana
    if (dayIndex === 1 && time === '09:00') return this.sampleBookings[0];
    if (dayIndex === 1 && time === '10:00') return this.sampleBookings[1];
    if (dayIndex === 2 && time === '14:00') return this.sampleBookings[2];
    return null;
  }

  /**
   * Obtiene la configuración del badge de estado
   */
  getStatusBadgeClass(status: string): string {
    const statusClasses: Record<string, string> = {
      'confirmed': 'bg-primary',
      'in-progress': 'bg-success',
      'completed': 'bg-secondary',
      'cancelled': 'bg-danger'
    };
    return statusClasses[status] || 'bg-primary';
  }

  /**
   * Obtiene el label del estado
   */
  getStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
      'confirmed': 'Confirmada',
      'in-progress': 'En Curso',
      'completed': 'Completada',
      'cancelled': 'Cancelada',
      'pending': 'Pendiente'
    };
    return statusLabels[status] || 'Confirmada';
  }

  /**
   * Formatea el rango de fechas de la semana
   */
  getWeekRange(): string {
    if (this.weekDays.length === 0) return '';
    
    const firstDay = this.weekDays[0].toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long' 
    });
    
    const lastDay = this.weekDays[6].toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
    
    return `${firstDay} - ${lastDay}`;
  }
}
