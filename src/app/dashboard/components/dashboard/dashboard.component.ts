import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  selectedSalon: string = 'salon-1';
  dateFilter: Date = new Date();

  /**
   * Maneja el cambio de salón seleccionado
   */
  onSalonChange(salon: string): void {
    this.selectedSalon = salon;
    console.log('Salón seleccionado:', salon);
    // TODO: Actualizar datos según el salón seleccionado
  }

  /**
   * Maneja el cambio de fecha
   */
  onDateChange(date: Date): void {
    this.dateFilter = date;
    console.log('Fecha seleccionada:', date);
    // TODO: Actualizar datos según la fecha seleccionada
  }
}
