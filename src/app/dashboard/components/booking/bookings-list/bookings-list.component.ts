import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { 
  Booking, 
  QueryBookingsParams, 
  BookingStatusFilter, 
  BookingSearchField,
  BookingSortField 
} from '@app/core/models/bussiness/booking';
import { BookingStatus } from '@app/core/models/bussiness/enums';
import { DateOnly, TimeOnly } from '@app/core/models/bussiness/availability';
import { Service } from '@app/core/models/bussiness/service';
import { User } from '@app/core/models/bussiness/user';
import { BookingService } from '@app/core/services/http/booking.service';
import { UserService } from '@app/core/services/http/user.service';
import { ServiceService } from '@app/core/services/http/platform-service.service';
import { Option } from '@app/core/models/interfaces/option.interface';
import { EntiesConst } from '@app/core/models/constants/entity.const';
import { RolesConst } from '@app/core/models/constants/roles.const';
import { DialogConfirmComponent } from '@app/dashboard/components/shared/dialogs/dialog-confirm/dialog-confirm.component';
import { FilterFieldConfig, TableFilterResult } from '@app/core/models/interfaces/table-filter.interface';
import { OffcanvasBookingService } from '@app/core/services/shared/offcanvas-booking.service';
import { DashboardFiltersService } from '@app/core/services/shared/dashboard-filters.service';

interface QuickFilter {
  id: string;
  label: string;
  icon: string;
  active: boolean;
}

interface SortConfig {
  column: string;
  direction: 'asc' | 'desc' | null;
}

@Component({
  selector: 'app-bookings-list',
  templateUrl: './bookings-list.component.html',
  styleUrl: './bookings-list.component.scss'
})
export class BookingsListComponent implements OnInit, OnDestroy {
  titleComponent: string = "Bookings";
  entity: string = EntiesConst._BOOKING;
  loading: boolean = false;
  booking: Booking = new Booking();
  bookings: Booking[] = [];
  selectedBookings: Set<string> = new Set();
  allSelected: boolean = false;
  showSearch: boolean = false;
  salonId: string = "";
  
  private subscriptions: Subscription[] = [];
   
  attributes: Option[] = [ 
    {name: "Reference", code: "bookingReference"}, 
    {name: "Customer", code: "customer.firstName"},
    {name: "Phone", code: "customer.phoneNumber"}
  ];

  states: Option[] = [ 
    { name: "Pending", code: "pending" },
    { name: "Confirmed", code: "confirmed" },
    { name: "In Progress", code: "inProgress" },
    { name: "Completed", code: "completed" },
    { name: "Cancelled", code: "cancelled" },
    { name: "No Show", code: "noShow" }
  ];

  quickFilters: QuickFilter[] = [
    { id: 'today', label: 'Today', icon: 'bx-calendar', active: false },
    { id: 'tomorrow', label: 'Tomorrow', icon: 'bx-calendar', active: false },
    { id: 'thisWeek', label: 'This Week', icon: 'bx-calendar', active: false },
    { id: 'thisMonth', label: 'This Month', icon: 'bx-calendar', active: false },
  ];

  stylists: User[] = [];
  services: Service[] = [];
  selectedStylistId: string | null = null;
  selectedServiceId: string | null = null;
  
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  showPaginate: boolean = true;
  maxItems = [10, 25, 50, 100];
  Math = Math;

  sortConfig: SortConfig = {
    column: 'bookingDate',
    direction: 'desc'
  };

  currentFilters: TableFilterResult | null = null;
  activeQuickFilter: string | null = null;
  defaultDateFrom!: Date;
  defaultDateTo!: Date;

  // Filter form controls
  filterForm!: FormGroup;
  searchText = new FormControl('');
  searchField = new FormControl<string | null>(null);
  stateValue = new FormControl<string | null>(null);
  dateFrom = new FormControl<string | null>(null);
  dateTo = new FormControl<string | null>(null);
  stylistId = new FormControl<string | null>(null);
  serviceId = new FormControl<string | null>(null);
  showTotals = new FormControl<boolean>(false);

  // Filter configuration
  searchableFields: FilterFieldConfig[] = [
    { label: "Reference", field: "bookingReference", type: "string" },
    { label: "Customer", field: "customer.firstName", type: "string" }
  ];
  searchPlaceholder: string = 'Search by reference, customer name...';

  constructor(
    private bookingService: BookingService,
    private userService: UserService,
    private serviceService: ServiceService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private offcanvasBookingService: OffcanvasBookingService,
    private dashboardFiltersService: DashboardFiltersService
  ) {
    this.defaultDateFrom = this.getDefaultDateFrom();
    this.defaultDateTo = this.getDefaultDateTo();
    
    this.initializeFilterForm();
  }

  private initializeFilterForm(): void {
    this.dateFrom = new FormControl<string | null>(this.formatDateToString(this.defaultDateFrom));
    this.dateTo = new FormControl<string | null>(this.formatDateToString(this.defaultDateTo));
    
    this.filterForm = new FormGroup({
      searchText: this.searchText,
      searchField: this.searchField,
      stateValue: this.stateValue,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
      stylistId: this.stylistId,
      serviceId: this.serviceId,
      showTotals: this.showTotals
    });

    if (this.searchableFields.length > 0) {
      this.searchField.setValue(this.searchableFields[0].field);
    }
  }

  private formatDateToString(date: Date | null): string | null {
    if (!date) return null;
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private parseStringToDate(dateString: string | null): Date | null {
    if (!dateString) return null;
    const parts = dateString.split('-');
    if (parts.length !== 3) return null;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }

  ngOnInit(): void {
    this.subscribeToSalonChanges();
    this.loadServices();
    this.subscribeToBookingEvents();
  }

  private subscribeToSalonChanges(): void {
    const currentSalon = this.dashboardFiltersService.getCurrentSalon();
    if (currentSalon) {
      this.salonId = currentSalon.id;
    }
    this.loadFiltersFromStorage();
    this.initializeDefaultFilters();
    
    this.loadBookings();

    const salonSub = this.dashboardFiltersService.selectedSalon$.subscribe(salon => {
      const newSalonId = salon?.id || '';
      
      if (this.salonId !== newSalonId) {
        this.salonId = newSalonId;
        this.loadStylists();
        this.resetAllFilters();
        this.loadBookings();
      }
    });

    this.subscriptions.push(salonSub);
  }

  private initializeDefaultFilters(): void {
    if (!this.currentFilters) {
      this.currentFilters = this.getDefaultFilters();
    } else {
      if (!this.currentFilters.dateFrom) {
        this.currentFilters.dateFrom = this.getDefaultDateFrom();
      }
      if (!this.currentFilters.dateTo) {
        this.currentFilters.dateTo = this.getDefaultDateTo();
      }
    }
  }

  private resetAllFilters(): void {
    this.currentFilters = this.getDefaultFilters();
    this.selectedStylistId = null;
    this.selectedServiceId = null;
    this.activeQuickFilter = null;
    this.quickFilters.forEach(f => f.active = false);
    this.pageIndex = 0;
    this.sortConfig = {
      column: 'bookingDate',
      direction: 'desc'
    };
    this.selectedBookings.clear();
    this.allSelected = false;
    this.clearFiltersFromStorage();
    
    // Reset form controls
    this.resetFilterForm();
  }

  private resetFilterForm(): void {
    this.searchText.setValue('');
    this.searchField.setValue(
      this.searchableFields.length > 0 ? this.searchableFields[0].field : null
    );
    this.stateValue.setValue(null);
    this.dateFrom.setValue(this.formatDateToString(this.defaultDateFrom));
    this.dateTo.setValue(this.formatDateToString(this.defaultDateTo));
    this.stylistId.setValue(null);
    this.serviceId.setValue(null);
  }

  private getDefaultFilters(): TableFilterResult {
    return {
      dateFrom: this.getDefaultDateFrom(),
      dateTo: this.getDefaultDateTo()
    } as TableFilterResult;
  }

  private getDefaultDateFrom(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  private getDefaultDateTo(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay();
    const daysUntilEndOfWeek = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + daysUntilEndOfWeek);
    return endOfWeek;
  }

  private loadStylists(): void {
    this.userService.getUsersByRole(RolesConst._STYLIST, this.salonId).subscribe({
      next: (users: User[]) => {
        this.stylists = users;
      },
      error: () => {
        console.error('Error loading stylists');
      }
    });
  }

  private loadServices(): void {
    this.serviceService.getServices().subscribe({
      next: (services: Service[]) => {
        this.services = services;
      },
      error: () => {
        console.error('Error loading services');
      }
    });
  }

  getStylistFullName(user: User): string {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private subscribeToBookingEvents(): void {
    const createdSub = this.offcanvasBookingService.bookingCreated$.subscribe(() => {
      this.loadBookings();
    });

    const updatedSub = this.offcanvasBookingService.bookingUpdated$.subscribe(() => {
      this.loadBookings();
    });

    this.subscriptions.push(createdSub, updatedSub);
  }

  applyFilters(): void {
    this.currentFilters = {
      searchText: this.searchText.value || '',
      searchField: this.searchField.value,
      stateValue: this.stateValue.value,
      dateFrom: this.parseStringToDate(this.dateFrom.value),
      dateTo: this.parseStringToDate(this.dateTo.value)
    };
            
    this.selectedStylistId = this.stylistId.value;
    this.selectedServiceId = this.serviceId.value;
    
    this.pageIndex = 0;
    this.clearQuickFilters();
    this.saveFiltersToStorage();
    this.loadBookings();
  }

  hasActiveFilters(): boolean {
    const hasNonDefaultDateFrom = this.dateFrom.value && 
      (!this.defaultDateFrom || !this.areDatesEqual(this.dateFrom.value, this.defaultDateFrom));
    
    const hasNonDefaultDateTo = this.dateTo.value && 
      (!this.defaultDateTo || !this.areDatesEqual(this.dateTo.value, this.defaultDateTo));

    return !!(
      this.searchText.value?.trim() ||
      this.stateValue.value ||
      hasNonDefaultDateFrom ||
      hasNonDefaultDateTo ||
      this.stylistId.value ||
      this.serviceId.value
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

  getFieldLabel(field: string): string {
    const config = this.searchableFields.find(f => f.field === field);
    return config?.label || field;
  }

  applyQuickFilter(filterId: string): void {
    if (this.activeQuickFilter === filterId) {
      this.activeQuickFilter = null;
      this.quickFilters.forEach(f => f.active = false);
      // Reset dates to default
      this.dateFrom.setValue(this.formatDateToString(this.defaultDateFrom));
      this.dateTo.setValue(this.formatDateToString(this.defaultDateTo));
      this.applyFilters();
      return;
    }
    
    this.activeQuickFilter = filterId;
    
    this.quickFilters.forEach(f => { 
      if(f.id === filterId) { 
        if(f.active) {
          f.active = false;
        } else {
          f.active = true; 
        }
      } else {
        f.active = false;
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filterId) {
      case 'today':
        this.dateFrom.setValue(this.formatDateToString(today));
        this.dateTo.setValue(this.formatDateToString(today));
        break;
      case 'tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        this.dateFrom.setValue(this.formatDateToString(tomorrow));
        this.dateTo.setValue(this.formatDateToString(tomorrow));
        break;
      case 'thisWeek':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1 );
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        this.dateFrom.setValue(this.formatDateToString(startOfWeek));
        this.dateTo.setValue(this.formatDateToString(endOfWeek));
        break;
      case 'thisMonth':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        this.dateFrom.setValue(this.formatDateToString(startOfMonth));
        this.dateTo.setValue(this.formatDateToString(endOfMonth));
        break;
    }

    this.sortConfig.column = 'bookingDate';
    this.sortConfig.direction = 'asc';

    this.applyFilters();
  }

  private clearQuickFilters(): void {
    this.activeQuickFilter = null;
    // this.quickFilters.forEach(f => f.active = false);
  }

  loadBookings(): void {
    this.loading = true;
    const params = this.buildQueryParams();
    
    this.bookingService.queryBookings(params).subscribe({
      next: (response) => {
        this.bookings = this.mapBookingsResponse(response.data || []);
        if (response.pagination) {
          this.totalItems = response.pagination.totalItems;
        } else {
          this.totalItems = this.bookings.length;
        }
        this.loading = false;
        this.updateSelectAllState();
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.snackBar.open('Error loading bookings', 'Close', {duration: 4000});
        this.bookings = [];
        this.totalItems = 0;
        this.loading = false;
      }
    });
  }

  private mapBookingsResponse(bookings: Booking[]): Booking[] {
    return bookings.map(booking => ({
      ...booking,
      bookingDate: this.parseDateString(booking.bookingDate),
      startTime: this.parseTimeString(booking.startTime),
      endTime: this.parseTimeString(booking.endTime)
    }));
  }

  private parseDateString(date: DateOnly | string | null | undefined): DateOnly {
    if (!date) {
      return new DateOnly();
    }

    if (typeof date === 'object' && 'year' in date && 'month' in date && 'day' in date) {
      return date;
    }

    if (typeof date === 'string') {
      const parts = date.split('-');
      if (parts.length === 3) {
        const dateOnly = new DateOnly();
        dateOnly.year = parseInt(parts[0], 10) || new Date().getFullYear();
        dateOnly.month = parseInt(parts[1], 10) || 1;
        dateOnly.day = parseInt(parts[2], 10) || 1;
        const dateObj = new Date(dateOnly.year, dateOnly.month - 1, dateOnly.day);
        dateOnly.dayOfWeek = dateObj.getDay();
        return dateOnly;
      }
    }

    return new DateOnly();
  }

  private parseTimeString(time: TimeOnly | string | null | undefined): TimeOnly {
    if (!time) {
      return new TimeOnly();
    }

    if (typeof time === 'object' && 'hour' in time && 'minute' in time) {
      return time;
    }

    if (typeof time === 'string') {
      const parts = time.split(':');
      if (parts.length >= 2) {
        const timeOnly = new TimeOnly();
        (timeOnly as any).hour = parseInt(parts[0], 10) || 0;
        (timeOnly as any).minute = parseInt(parts[1], 10) || 0;
        return timeOnly;
      }
    }

    return new TimeOnly();
  }

  private buildQueryParams(): QueryBookingsParams {
    const params: QueryBookingsParams = {
      page: this.pageIndex,
      pageSize: this.pageSize,
      includeCount: true
    };

    if (this.currentFilters) {
      if (this.currentFilters.searchText && this.currentFilters.searchText.trim()) {
        params.search = this.currentFilters.searchText.trim();
        
        if (this.currentFilters.searchField) {
          params.searchField = this.mapSearchField(this.currentFilters.searchField);
        }
      }

      if (this.currentFilters.stateValue) {
        params.status = this.currentFilters.stateValue as BookingStatusFilter;
      }

      if (this.currentFilters.dateFrom) {
        params.dateFrom = this.formatDateForApi(this.currentFilters.dateFrom);
      }

      if (this.currentFilters.dateTo) {
        params.dateTo = this.formatDateForApi(this.currentFilters.dateTo);
      }
    }

    if (this.selectedStylistId) {
      params.supplierId = this.selectedStylistId;
    }

    if (this.selectedServiceId) {
      params.serviceId = this.selectedServiceId;
    }

    if (this.salonId) {
      params.salonId = this.salonId;
    }

    if (this.sortConfig.direction) {
      params.sortBy = this.sortConfig.column as BookingSortField;
      params.sortOrder = this.sortConfig.direction;
    } else {
      params.sortBy = 'bookingDate';
      params.sortOrder = 'desc';
    }

    return params;
  }

  private mapSearchField(field: string): BookingSearchField | undefined {
    const validFields: BookingSearchField[] = [
      'bookingReference',
      'customer.firstName',
      'customer.lastName',
      'customer.phoneNumber'
    ];
    return validFields.includes(field as BookingSearchField) 
      ? field as BookingSearchField 
      : undefined;
  }

  private formatDateForApi(date: Date | string): string {
    if (!date) return '';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) return '';
    
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  sortBy(column: string): void {
    if (this.sortConfig.column === column) {
      if (this.sortConfig.direction === 'asc') {
        this.sortConfig.direction = 'desc';
      } else if (this.sortConfig.direction === 'desc') {
        this.sortConfig.direction = null;
        this.sortConfig.column = 'bookingDate';
      } else {
        this.sortConfig.direction = 'asc';
      }
    } else {
      this.sortConfig.column = column;
      this.sortConfig.direction = 'asc';
    }
    
    this.pageIndex = 0;
    this.loadBookings();
  }

  getSortIcon(column: string): string {
    if (this.sortConfig.column !== column || !this.sortConfig.direction) {
      return 'bx-sort';
    }
    return this.sortConfig.direction === 'asc' ? 'bx-sort-up' : 'bx-sort-down';
  }

  changePage(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.selectedBookings.clear();
    this.allSelected = false;
    this.loadBookings();
  }

  load(): void {
    this.loading = true;
    this.bookingService.getBookings().subscribe({
      next: (response: Booking[]) => {
        this.bookings = response;
        this.totalItems = response.length;
        this.loading = false;
      },
      error: (response) => {
        this.snackBar.open('Error getting the bookings', 'Close', {duration: 4000});
        this.totalItems = 0;
        this.loading = false;
      }
    });
  }

  create(): void {
    this.router.navigate([`/bookings/create`]);
  }

  update(id: string): void {
    this.router.navigate([`/bookings/${id}/update`]);
  }

  detail(id: string): void {
    this.offcanvasBookingService.openDetailBookingModal(id);
  }

  delete(id: string): void {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      width: '400px',
      data: {
        title: 'Cancel Booking',
        description: ['Are you sure you want to cancel this booking?', 'This action cannot be undone.'],
        labelButtons: ['Yes, cancel', 'No, keep it']
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.bookingService.deleteBooking(id).subscribe({
          next: (response: any) => {
            this.snackBar.open('Booking cancelled successfully', 'Close', {duration: 4000});
            this.selectedBookings.delete(id);
            this.loadBookings();
          }, 
          error: (error: any) => {
            let message = '';
            if(error.error.message && error.status != 422){
              message = error.error.message;
            }
            this.snackBar.open('Error cancelling the booking ' + message, 'Close', {duration: 4000});
          }
        });
      }
    });
  }

  // Selection methods
  toggleSelectAll(): void {
    if (this.allSelected) {
      this.selectedBookings.clear();
      this.allSelected = false;
    } else {
      this.bookings.forEach(booking => this.selectedBookings.add(booking.id));
      this.allSelected = true;
    }
  }

  toggleSelectBooking(bookingId: string): void {
    if (this.selectedBookings.has(bookingId)) {
      this.selectedBookings.delete(bookingId);
    } else {
      this.selectedBookings.add(bookingId);
    }
    this.updateSelectAllState();
  }

  isSelected(bookingId: string): boolean {
    return this.selectedBookings.has(bookingId);
  }

  private updateSelectAllState(): void {
    this.allSelected = this.bookings.length > 0 && 
      this.bookings.every(booking => this.selectedBookings.has(booking.id));
  }

  getSelectedCount(): number {
    return this.selectedBookings.size;
  }

  // Bulk actions
  bulkCancel(): void {
    if (this.selectedBookings.size === 0) return;

    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      width: '400px',
      data: {
        title: 'Cancel Selected Bookings',
        description: [
          `Are you sure you want to cancel ${this.selectedBookings.size} booking(s)?`,
          'This action cannot be undone.'
        ],
        labelButtons: ['Yes, cancel all', 'No, keep them']
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Bulk cancellation is not implemented yet', 'Close', {duration: 4000});
      }
    });
  }

  exportSelected(format: string): void {
    const ids = Array.from(this.selectedBookings);
    this.snackBar.open(`Export to ${format.toUpperCase()} is not implemented yet`, 'Close', {duration: 4000});
  }

  clearFilters(): void {
    this.resetFilterForm();
    this.currentFilters = this.getDefaultFilters();
    this.selectedStylistId = null;
    this.selectedServiceId = null;
    this.clearQuickFilters();
    this.pageIndex = 0;
    this.clearFiltersFromStorage();
    this.applyFilters();
  }

  refresh(): void {
    this.loadBookings();
  }

  // Filter persistence
  private saveFiltersToStorage(): void {
    if (this.currentFilters) {
      localStorage.setItem('bookings_filters', JSON.stringify(this.currentFilters));
    }
  }

  private loadFiltersFromStorage(): void {
    const savedFilters = localStorage.getItem('bookings_filters');
    if (savedFilters) {
      try {
        const filters = JSON.parse(savedFilters);
        if (filters.dateFrom) filters.dateFrom = new Date(filters.dateFrom);
        if (filters.dateTo) filters.dateTo = new Date(filters.dateTo);
        this.currentFilters = filters;
      } catch (e) {
        console.error('Error loading saved filters', e);
      }
    }
  }

  private clearFiltersFromStorage(): void {
    localStorage.removeItem('bookings_filters');
  }

  // Status helpers
  getBookingStatus(booking: Booking): string {
    switch (booking.status) {
      case BookingStatus.Pending: return 'Pending';
      case BookingStatus.Confirmed: return 'Confirmed';
      case BookingStatus.InProgress: return 'In Progress';
      case BookingStatus.Completed: return 'Completed';
      case BookingStatus.Cancelled: return 'Cancelled';
      case BookingStatus.NoShow: return 'No Show';
      default: return 'Unknown';
    }
  }

  getBookingStatusClass(booking: Booking): string {
    switch (booking.status) {
      case BookingStatus.Pending: return 'status-pending';
      case BookingStatus.Confirmed: return 'status-confirmed';
      case BookingStatus.InProgress: return 'status-in-progress';
      case BookingStatus.Completed: return 'status-completed';
      case BookingStatus.Cancelled: return 'status-cancelled';
      case BookingStatus.NoShow: return 'status-no-show';
      default: return 'status-unknown';
    }
  }

  canEdit(booking: Booking): boolean {
    return booking.status !== BookingStatus.Completed && 
           booking.status !== BookingStatus.Cancelled;
  }

  canCancel(booking: Booking): boolean {
    return booking.status !== BookingStatus.Completed && 
           booking.status !== BookingStatus.Cancelled;
  }

  // Format helpers
  formatDateOnly(date: DateOnly): string {
    if (!date || !date.year) return 'N/A';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.month - 1]} ${date.day}, ${date.year}`;
  }

  formatTimeOnly(time: TimeOnly): string {
    if (!time || time.hour === undefined || time.hour === null || 
        time.minute === undefined || time.minute === null) {
      return 'N/A';
    }
    const hour = time.hour;
    const minute = time.minute.toString().padStart(2, '0');
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute} ${ampm}`;
  }

  formatTimeRange(startTime: TimeOnly, endTime: TimeOnly): string {
    return `${this.formatTimeOnly(startTime)} - ${this.formatTimeOnly(endTime)}`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getCustomerName(booking: Booking): string {
    if (!booking.customer) return 'N/A';
    const firstName = booking.customer.firstName || '';
    const lastName = booking.customer.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'N/A';
  }

  getCustomerPhone(booking: Booking): string {
    if (!booking.customer || !booking.customer.phoneNumber) return 'N/A';
    return booking.customer.phoneNumber;
  }

  getStylistName(booking: Booking): string {
    if (booking.supplierId) {
      const stylist = this.stylists.find(s => s.id === booking.supplierId);
      if (stylist) {
        const firstName = stylist.firstName || '';
        const lastName = stylist.lastName || '';
        return `${firstName} ${lastName}`.trim() || 'N/A';
      }
    }
    
    if (booking.user) {
      const firstName = booking.user.firstName || '';
      const lastName = booking.user.lastName || '';
      return `${firstName} ${lastName}`.trim() || 'N/A';
    }
    
    return 'N/A';
  }

  getStylistPhotoUrl(booking: Booking): string | null {
    if (booking.supplierId) {
      const stylist = this.stylists.find(s => s.id === booking.supplierId);
      if (stylist?.photo) {
        return stylist.photo;
      }
    }
    
    if (booking.user?.photo) {
      return booking.user.photo;
    }
    
    return null;
  }

  getServicesDisplay(booking: Booking): Service[] {
    return booking.services || [];
  }

  getServicesText(booking: Booking): string {
    if (!booking.services || booking.services.length === 0) return 'N/A';
    return booking.services.map(s => s.serviceName).join(', ');
  }

  formatDuration(minutes: number): string {
    if (!minutes) return 'N/A';
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  formatPrice(booking: Booking): string {
    if (booking.totalPrice === null || booking.totalPrice === undefined) return 'N/A';
    const currency = booking.currency || 'USD';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: currency 
    }).format(booking.totalPrice);
  }

  // Visual indicators
  isToday(booking: Booking): boolean {
    if (!booking.bookingDate) return false;
    const today = new Date();
    return booking.bookingDate.year === today.getFullYear() &&
           booking.bookingDate.month === (today.getMonth() + 1) &&
           booking.bookingDate.day === today.getDate();
  }

  isUpcoming(booking: Booking): boolean {
    if (!booking.bookingDate || !booking.startTime) return false;
    const now = new Date();
    const bookingDateTime = new Date(
      booking.bookingDate.year,
      booking.bookingDate.month - 1,
      booking.bookingDate.day,
      booking.startTime.hour,
      booking.startTime.minute
    );
    const diffMs = bookingDateTime.getTime() - now.getTime();
    const diffMinutes = diffMs / (1000 * 60);
    return diffMinutes > 0 && diffMinutes <= 60;
  }

  hasNotes(booking: Booking): boolean {
    return !!(booking.clientNotes || booking.providerNotes);
  }

  // Pagination info
  getPaginationInfo(): string {
    const start = this.pageIndex * this.pageSize + 1;
    const end = Math.min((this.pageIndex + 1) * this.pageSize, this.totalItems);
    return `Showing ${start}-${end} of ${this.totalItems} bookings`;
  }

  getTotalNumBookings(): number {
    return this.bookings.length;
  }

  getTotalNumStylists(): number {
    const uniqueStylists = new Set(
      this.bookings
        .filter(b => b.supplierId)
        .map(b => b.supplierId)
    );
    return uniqueStylists.size;
  }

  getTotalNumServices(): number {
    const uniqueServices = new Set<string>();
    this.bookings.forEach(booking => {
      if (booking.services && booking.services.length > 0) {
        booking.services.forEach(service => {
          if (service.id) {
            uniqueServices.add(service.id);
          }
        });
      } else if (booking.serviceId) {
        uniqueServices.add(booking.serviceId);
      }
    });
    return uniqueServices.size;
  }

  getTotalNumCustomers(): number {
    const uniqueCustomers = new Set(
      this.bookings
        .filter(b => b.customerId)
        .map(b => b.customerId)
    );
    return uniqueCustomers.size;
  }

  getTotalDuration(): string {
    const totalMinutes = this.bookings.reduce((sum, booking) => {
      return sum + (booking.durationMinutes || 0);
    }, 0);
    
    if (totalMinutes === 0) return '0m';
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  }

  getTotalPrice(): string {
    const total = this.bookings.reduce((sum, booking) => {
      return sum + (booking.totalPrice || 0);
    }, 0);
    
    const currency = this.bookings.length > 0 && this.bookings[0].currency 
      ? this.bookings[0].currency 
      : 'USD';
    
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: currency 
    }).format(total);
  }

  toggleShowTotals(): void {
    this.showTotals.setValue(!this.showTotals.value);
  }

}
