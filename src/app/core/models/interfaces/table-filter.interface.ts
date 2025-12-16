import { Option } from './option.interface';

export interface FilterFieldConfig {
  label: string;
  field: string;
  type: 'string' | 'number' | 'boolean' | 'date';
}

export interface TableFilterConfig {
  searchableFields: FilterFieldConfig[];
  stateOptions?: Option[];
  stateField?: string;
  dateFromField?: string;
  dateToField?: string;
  showStateFilter?: boolean;
  showDateFilter?: boolean;
  searchPlaceholder?: string;
}


export interface TableFilterResult {
  searchText: string;
  searchField: string | null;
  stateValue: string | null;
  dateFrom: Date | null;
  dateTo: Date | null;
}

export interface AppliedFilters {
  filters: TableFilterResult;
  hasActiveFilters: boolean;
}
