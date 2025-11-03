import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  selectedSalon: string = 'salon-1';
  dateFilter: Date = new Date();
  
  // Control de vista: 'calendar' o 'chart'
  currentView: 'calendar' | 'chart' = 'chart';

  constructor() {
  }

  // Método para cambiar la vista
  switchView(view: 'calendar' | 'chart'): void {
    this.currentView = view;
  }

  onSalonChange(salon: string): void {
    this.selectedSalon = salon;
  }

  onDateChange(date: Date): void {
    this.dateFilter = date;
  }
}
