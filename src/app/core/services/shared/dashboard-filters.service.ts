import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, distinctUntilChanged, map } from 'rxjs';
import { Salon } from '@app/core/models/bussiness/salon';
import { User } from '@app/core/models/bussiness/user';
import { 
  TopbarFiltersConst, 
  RouteFilterConfig, 
  ROUTE_FILTER_CONFIGURATIONS 
} from '@app/core/models/constants/topbar-filters.const';

export interface DashboardFilters {
  startDate: Date;
  endDate: Date;
  selectedStylist: User | null;
  selectedSalon: Salon | null;
}

export interface FilterVisibility {
  showDateRange: boolean;
  showStylist: boolean;
  showSalon: boolean;
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

  private filterVisibilitySubject = new BehaviorSubject<FilterVisibility>({
    showDateRange: false,
    showStylist: false,
    showSalon: false
  });

  public filters$: Observable<DashboardFilters> = this.filtersSubject.asObservable();
  
  public filterVisibility$: Observable<FilterVisibility> = this.filterVisibilitySubject.asObservable();

  public selectedSalon$: Observable<Salon | null> = this.filtersSubject.pipe(
    map(filters => filters.selectedSalon),
    distinctUntilChanged((prev, curr) => prev?.id === curr?.id)
  );

  constructor() {
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

  getCurrentSalon(): Salon | null {
    return this.filtersSubject.getValue().selectedSalon;
  }

  setSelectedSalon(salon: Salon): void {
    this.updateFilters({ selectedSalon: salon });
  }

  updateFilters(filters: Partial<DashboardFilters>): void {
    const currentFilters = this.filtersSubject.getValue();
    this.filtersSubject.next({
      ...currentFilters,
      ...filters
    });
  }

  updateDateRange(startDate: Date, endDate: Date): void {
    this.updateFilters({ startDate, endDate });
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

  updateFilterVisibilityByRoute(currentRoute: string): void {
    const config = this.getRouteFilterConfig(currentRoute);
    
    const visibility: FilterVisibility = {
      showDateRange: config?.enabledFilters.includes(TopbarFiltersConst._DATE_RANGE) ?? false,
      showStylist: config?.enabledFilters.includes(TopbarFiltersConst._STYLIST) ?? false,
      showSalon: config?.enabledFilters.includes(TopbarFiltersConst._SALON) ?? false
    };
    
    this.filterVisibilitySubject.next(visibility);
  }

  private getRouteFilterConfig(route: string): RouteFilterConfig | undefined {
    const routePath = route.split('?')[0];
    
    let config = ROUTE_FILTER_CONFIGURATIONS.find(c => c.route === routePath);
    
    if (!config) {
      config = ROUTE_FILTER_CONFIGURATIONS.find(c => routePath.endsWith(c.route));
    }
    
    return config;
  }

  getCurrentFilterVisibility(): FilterVisibility {
    return this.filterVisibilitySubject.getValue();
  }

  hasVisibleFilters(): boolean {
    const visibility = this.getCurrentFilterVisibility();
    return visibility.showDateRange || visibility.showStylist || visibility.showSalon;
  }
}
