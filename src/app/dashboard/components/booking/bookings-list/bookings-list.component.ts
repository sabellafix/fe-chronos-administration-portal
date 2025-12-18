import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Booking } from '@app/core/models/bussiness/booking';
import { BookingStatus } from '@app/core/models/bussiness/enums';
import { DateOnly, TimeOnly } from '@app/core/models/bussiness/availability';
import { BookingService } from '@app/core/services/http/booking.service';
import { Option } from '@app/core/models/interfaces/option.interface';
import { EntiesConst } from '@app/core/models/constants/entity.const';
import { DialogConfirmComponent } from '@app/dashboard/components/shared/dialogs/dialog-confirm/dialog-confirm.component';
import { AppliedFilters, TableFilterConfig, TableFilterResult } from '@app/core/models/interfaces/table-filter.interface';
import { ODataQueryParams, BookingStatusOData } from '@app/core/models/interfaces/odata.interface';
import { ODataFilterBuilder } from '@app/core/utils/odata-filter.builder';


@Component({
  selector: 'app-bookings-list',
  templateUrl: './bookings-list.component.html',
  styleUrl: './bookings-list.component.scss'
})
export class BookingsListComponent implements OnInit {
  titleComponent: string = "Bookings";
  entity: string = EntiesConst._BOOKING;
  loading: boolean = false;
  booking: Booking = new Booking();
  bookings: Booking[] = [];
  showSearch: boolean = false;
   
  attributes: Option[] = [ 
    {name: "Reference", code: "bookingReference"}, 
    {name: "Customer", code: "customer"}
  ];

  // Estados OData (camelCase como espera el backend)
  states: Option[] = [ 
    { name: "Pending", code: BookingStatusOData.Pending },
    { name: "Confirmed", code: BookingStatusOData.Confirmed },
    { name: "In Progress", code: BookingStatusOData.InProgress },
    { name: "Completed", code: BookingStatusOData.Completed },
    { name: "Cancelled", code: BookingStatusOData.Cancelled },
    { name: "No Show", code: BookingStatusOData.NoShow }
  ];
  
  // Paginación
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  showPaginate: boolean = true;
  maxItems = [10, 20, 50];
  Math = Math;

  // Filtros actuales
  currentFilters: TableFilterResult | null = null;

  tableFilterConfig: TableFilterConfig = {
    searchableFields: [
      {label: "Reference", field: "bookingReference", type: "string"},
      {label: "Customer", field: "customer.firstName", type: "string"}
    ],
    stateOptions: this.states,
    stateField: 'status',
    dateFromField: 'bookingDate',
    dateToField: 'bookingDate',
    showStateFilter: true,
    showDateFilter: true,
    searchPlaceholder: 'Search by reference or customer...'
  };

  constructor(
    private bookingService: BookingService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit(): void {
    this.loadWithOData();
  }

  applyFilters(appliedFilters: AppliedFilters): void {
    this.currentFilters = appliedFilters.filters;
    this.pageIndex = 0; // Reset a primera página al filtrar
    this.loadWithOData();
  }


  loadWithOData(): void {
    this.loading = true;

    const odataParams = this.buildODataParams();

    this.bookingService.getBookingsOData(odataParams).subscribe({
      next: (response: Booking[]) => {
        this.bookings = response;
        if (this.pageIndex === 0 && response.length < this.pageSize) {
          this.totalItems = response.length;
        } else if (response.length === this.pageSize) {
          this.totalItems = Math.max(this.totalItems, (this.pageIndex + 1) * this.pageSize + 1);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading bookings with OData:', error);
        this.snackBar.open('Error getting the bookings', 'Close', {duration: 4000});
        this.bookings = [];
        this.totalItems = 0;
        this.loading = false;
      }
    });
  }


  private buildODataParams(): ODataQueryParams {
    const filterBuilder = ODataFilterBuilder.create();

    if (this.currentFilters) {
      if (this.currentFilters.searchText && this.currentFilters.searchText.trim()) {
        const searchText = this.currentFilters.searchText.trim();
        
        if (this.currentFilters.searchField) {
          filterBuilder.containsIgnoreCase(this.currentFilters.searchField, searchText);
        } else {
          filterBuilder.containsIgnoreCase('bookingReference', searchText);
        }
      }

      if (this.currentFilters.stateValue) {
        filterBuilder.eq('status', this.currentFilters.stateValue);
      }

      filterBuilder.dateBetween(
        'bookingDate',
        this.currentFilters.dateFrom,
        this.currentFilters.dateTo
      );
    }

    return {
      filter: filterBuilder.buildOrUndefined(),
      orderby: 'bookingDate desc,startTime asc',
      top: this.pageSize,
      skip: this.pageIndex * this.pageSize,
      count: true
    };
  }

  changePage(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadWithOData();
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
    this.router.navigate([`/bookings/${id}/detail`]);
  }

  delete(id: string): void {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      width: '400px',
      data: {
        title: 'Are you sure you want to delete the booking?',
        description: ['This action will delete the selected booking.'],
        labelButtons: ['Yes, delete', 'Cancel']
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.bookingService.deleteBooking(id).subscribe({
          next: (response: any) => {
            this.snackBar.open('Booking deleted successfully', 'Close', {duration: 4000});
            this.loadWithOData();
          }, 
          error: (error: any) => {
            let message = '';
            if(error.error.message && error.status != 422){
              message = error.error.message;
            }
            this.snackBar.open('Error executing the deletion ' + message, 'Close', {duration: 4000});
          }
        });
      }
    });
  }

  /**
   * Limpia los filtros y recarga
   */
  clearFilters(): void {
    this.currentFilters = null;
    this.pageIndex = 0;
    this.loadWithOData();
  }

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
      case BookingStatus.Pending: return 'bg-warning-subtle text-warning';
      case BookingStatus.Confirmed: return 'bg-info-subtle text-info';
      case BookingStatus.InProgress: return 'bg-primary-subtle text-primary';
      case BookingStatus.Completed: return 'bg-success-subtle text-success';
      case BookingStatus.Cancelled: return 'bg-danger-subtle text-danger';
      case BookingStatus.NoShow: return 'bg-secondary-subtle text-secondary';
      default: return 'bg-light text-dark';
    }
  }

  formatDateOnly(date: DateOnly): string {
    if (!date || !date.year) return 'N/A';
    return `${date.day.toString().padStart(2, '0')}/${date.month.toString().padStart(2, '0')}/${date.year}`;
  }

  formatTimeOnly(time: TimeOnly): string {
    if (!time) return 'N/A';
    return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  }

  getCustomerName(booking: Booking): string {
    if (!booking.customer) return 'N/A';
    const firstName = booking.customer.firstName || '';
    const lastName = booking.customer.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'N/A';
  }

  formatPrice(booking: Booking): string {
    if (booking.totalPrice === null || booking.totalPrice === undefined) return 'N/A';
    const currency = booking.currency || '€';
    return `${booking.totalPrice.toFixed(2)} ${currency}`;
  }
}

