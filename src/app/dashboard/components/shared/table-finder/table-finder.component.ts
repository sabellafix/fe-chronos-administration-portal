import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Option } from '@app/core/models/interfaces/option.interface';
import { 
  AppliedFilters, 
  FilterFieldConfig, 
  TableFilterConfig, 
  TableFilterResult 
} from '@app/core/models/interfaces/table-filter.interface';

@Component({
  selector: 'app-table-finder',
  templateUrl: './table-finder.component.html',
  styleUrl: './table-finder.component.scss'
})
export class TableFinderComponent implements OnInit {
  
  @Input() config: TableFilterConfig = {
    searchableFields: [],
    stateOptions: [],
    showStateFilter: true,
    showDateFilter: true,
    searchPlaceholder: 'Search...',
    defaultDateFrom: new Date(),
    defaultDateTo: new Date(),
    stateField: 'status',
    dateFromField: 'bookingDate',
    dateToField: 'bookingDate'
  };

  @Input() data: any[] = [];

  @Output() filtersChanged = new EventEmitter<AppliedFilters>();

  @Output() filteredData = new EventEmitter<any[]>();

  @Output() filtersCleared = new EventEmitter<void>();

  filterForm: FormGroup;

  searchText = new FormControl('');
  searchField = new FormControl<string | null>(null);
  stateValue = new FormControl<string | null>(null);
  dateFrom = new FormControl<Date | null>( null);
  dateTo = new FormControl<Date | null>(null);

  constructor() {
    console.log("dateTo", this.config.defaultDateTo);

    this.dateFrom = new FormControl<Date | null>(this.config.defaultDateFrom || null);
    this.dateTo = new FormControl<Date | null>(this.config.defaultDateTo || null);

    console.log("dateFrom", this.dateFrom);
    console.log("dateTo", this.dateTo);

    this.filterForm = new FormGroup({
      searchText: this.searchText,
      searchField: this.searchField,
      stateValue: this.stateValue,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
    });
  }

  ngOnInit(): void {

    if (this.config.searchableFields.length > 0) {
      this.searchField.setValue(this.config.searchableFields[0].field);
    }

    if (this.config.defaultDateFrom) {
      this.dateFrom.setValue(this.config.defaultDateFrom);
    }
    if (this.config.defaultDateTo) {
      this.dateTo.setValue(this.config.defaultDateTo);
    }
  }

  applyFilters(): void {
    const filterResult: TableFilterResult = {
      searchText: this.searchText.value || '',
      searchField: this.searchField.value,
      stateValue: this.stateValue.value,
      dateFrom: this.dateFrom.value,
      dateTo: this.dateTo.value
    };

    const hasActiveFilters = this.hasActiveFilters();

    // Emitir filtros aplicados
    this.filtersChanged.emit({
      filters: filterResult,
      hasActiveFilters
    });

    // Si hay datos proporcionados, realizar filtrado en cliente
    if (this.data.length > 0) {
      const filtered = this.filterDataLocally(this.data, filterResult);
      this.filteredData.emit(filtered);
    }
  }

  /**
   * Limpia todos los filtros
   */
  clearFilters(): void {
    this.searchText.setValue('');
    this.searchField.setValue(
      this.config.searchableFields.length > 0 
        ? this.config.searchableFields[0].field 
        : null
    );
    this.stateValue.setValue(null);
    this.dateFrom.setValue(this.config.defaultDateFrom || null);
    this.dateTo.setValue(this.config.defaultDateTo || null);

    this.filtersCleared.emit();
    this.applyFilters();
  }

  /**
   * Verifica si hay filtros activos
   */
  hasActiveFilters(): boolean {
    const hasNonDefaultDateFrom = this.dateFrom.value && 
      (!this.config.defaultDateFrom || 
       !this.areDatesEqual(this.dateFrom.value, this.config.defaultDateFrom));
    
    const hasNonDefaultDateTo = this.dateTo.value && 
      (!this.config.defaultDateTo || 
       !this.areDatesEqual(this.dateTo.value, this.config.defaultDateTo));

    return !!(
      this.searchText.value?.trim() ||
      this.stateValue.value ||
      hasNonDefaultDateFrom ||
      hasNonDefaultDateTo
    );
  }

  private areDatesEqual(date1: Date | string | null, date2: Date | string | null): boolean {
    if (!date1 || !date2) return false;
    
    const d1 = date1 instanceof Date ? date1 : new Date(date1);
    const d2 = date2 instanceof Date ? date2 : new Date(date2);
    
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return false;
    
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  /**
   * Filtra los datos localmente según los criterios
   */
  private filterDataLocally<T>(data: T[], filters: TableFilterResult): T[] {
    return data.filter(item => {
      // Filtro por texto de búsqueda
      if (filters.searchText && filters.searchText.trim()) {
        const searchLower = filters.searchText.toLowerCase().trim();
        
        if (filters.searchField) {
          // Buscar en campo específico
          const fieldValue = this.getNestedValue(item, filters.searchField);
          if (!this.matchesSearch(fieldValue, searchLower)) {
            return false;
          }
        } else {
          // Buscar en todos los campos configurados
          const matchesAnyField = this.config.searchableFields.some(field => {
            const fieldValue = this.getNestedValue(item, field.field);
            return this.matchesSearch(fieldValue, searchLower);
          });
          if (!matchesAnyField) {
            return false;
          }
        }
      }

      // Filtro por estado
      if (filters.stateValue !== null && this.config.stateField) {
        const itemState = this.getNestedValue(item, this.config.stateField);
        const filterState = filters.stateValue === 'true' ? true : 
                           filters.stateValue === 'false' ? false : 
                           filters.stateValue;
        
        if (itemState !== filterState) {
          return false;
        }
      }

      // Filtro por fecha desde
      if (filters.dateFrom && this.config.dateFromField) {
        const itemDate = this.getDateValue(item, this.config.dateFromField);
        if (itemDate && itemDate < filters.dateFrom) {
          return false;
        }
      }

      // Filtro por fecha hasta
      if (filters.dateTo && this.config.dateToField) {
        const itemDate = this.getDateValue(item, this.config.dateToField || this.config.dateFromField!);
        if (itemDate && itemDate > filters.dateTo) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Obtiene un valor anidado de un objeto usando notación de punto
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => 
      current && current[key] !== undefined ? current[key] : null, obj);
  }

  /**
   * Obtiene un valor de fecha de un objeto
   */
  private getDateValue(obj: any, path: string): Date | null {
    const value = this.getNestedValue(obj, path);
    if (!value) return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  /**
   * Verifica si un valor coincide con el texto de búsqueda
   */
  private matchesSearch(value: any, searchLower: string): boolean {
    if (value === null || value === undefined) return false;
    return String(value).toLowerCase().includes(searchLower);
  }

  /**
   * Obtiene la etiqueta de un campo por su field
   */
  getFieldLabel(field: string): string {
    const config = this.config.searchableFields.find(f => f.field === field);
    return config?.label || field;
  }
}
