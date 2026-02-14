import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Salon } from '@app/core/models/bussiness/salon';
import { User } from '@app/core/models/bussiness/user';

export interface DashboardFilters {
  startDate: Date;
  endDate: Date;
  selectedStylist: User | null;
  selectedSalon: Salon | null;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardFiltersService {
  
  private filtersSubject = new BehaviorSubject<DashboardFilters>({
    startDate: new Date(),
    endDate: new Date(),
    selectedStylist: null,
    selectedSalon: null
  });

  public filters$: Observable<DashboardFilters> = this.filtersSubject.asObservable();

  constructor() {
    // Inicializar con fechas por defecto (inicio y fin del mes actual)
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    this.updateFilters({
      startDate: startOfMonth,
      endDate: endOfMonth,
      selectedStylist: null,
      selectedSalon: null
    });
  }

  getCurrentFilters(): DashboardFilters {
    return this.filtersSubject.getValue();
  }

  updateFilters(filters: Partial<DashboardFilters>): void {
    const currentFilters = this.filtersSubject.getValue();
    this.filtersSubject.next({
      ...currentFilters,
      ...filters
    });
  }

  updateStartDate(date: Date): void {
    this.updateFilters({ startDate: date });
  }

  updateEndDate(date: Date): void {
    this.updateFilters({ endDate: date });
  }

  updateSelectedStylist(stylist: User | null): void {
    this.updateFilters({ selectedStylist: stylist });
  }

  updateSelectedSalon(salon: Salon | null): void {
    this.updateFilters({ selectedSalon: salon });
  }

  resetFilters(): void {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    this.filtersSubject.next({
      startDate: startOfMonth,
      endDate: endOfMonth,
      selectedStylist: null,
      selectedSalon: null
    });
  }
}
