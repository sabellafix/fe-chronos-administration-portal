import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { Booking } from '@app/core/models/bussiness/booking';
import { BookingService } from '@app/core/services/http/booking.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '@app/core/models/bussiness/user';
import { BookingStatus } from '@app/core/models/bussiness/enums';
import { DateUtils } from '@app/core/utils/date.utils';
import { DateOnly } from '@app/core/models/bussiness/availability';


@Component({
  selector: 'app-list-time-ln-bookings',
  templateUrl: './list-time-ln-bookings.component.html',
  styleUrl: './list-time-ln-bookings.component.scss'
})
export class ListTimeLnBookingsComponent implements OnChanges {

  @Input() id?: string | null = null;
  @Input() bookings?: Booking[] | null = null;
  @Input() user?: User | null = null;

  @Output() bookingsUpdated = new EventEmitter<Booking[]>();

  loading: boolean = false;
  BookingStatus = BookingStatus;
  expandedBookingId: string | null = null;

  constructor(private bookingService: BookingService,
    private snackBar: MatSnackBar
  ){}

  ngOnInit(): void {
    if(this.id){
      this.loadByIdUSer();
    } else if (this.bookings) {
      // Si se pasan bookings directamente como Input, emitir el evento
      this.bookingsUpdated.emit(this.bookings);
    }
  }

  ngOnChanges(): void {
    // Emitir evento cuando los bookings cambian desde el Input
    if (this.bookings) {
      this.bookingsUpdated.emit(this.bookings);
    }
  }

  loadByIdUSer(): void {
    this.loading = true;
    this.expandedBookingId = null;
    
    this.bookingService.getByUserDateRange(this.id!, undefined, undefined).subscribe({
      next: (data: Booking[]) => {
        this.bookings = data;
        this.loading = false;
        // Emitir evento con los bookings actualizados
        this.bookingsUpdated.emit(data);
      },
      error: (error: any) => {
        this.loading = false;
        this.snackBar.open('Error retrieving bookings', 'Close', {duration: 4000});
        // Emitir array vacío en caso de error
        this.bookingsUpdated.emit([]);
      }
    });
  }

  getBookingStatusColor(status: BookingStatus): string {
    switch(status) {
      case BookingStatus.Pending: return '#ffc107';
      case BookingStatus.Confirmed: return '#28a745';
      case BookingStatus.InProgress: return '#007bff';
      case BookingStatus.Completed: return '#6f42c1';
      case BookingStatus.Cancelled: return '#dc3545';
      default: return '#6c757d';
    }
  }

  getBookingStatusText(status: BookingStatus): string {
    switch(status) {
      case BookingStatus.Pending: return 'Pendiente';
      case BookingStatus.Confirmed: return 'Confirmada';
      case BookingStatus.InProgress: return 'En Progreso';
      case BookingStatus.Completed: return 'Completada';
      case BookingStatus.Cancelled: return 'Cancelada';
      default: return 'Desconocido';
    }
  }

  getBookingStatusClass(status: BookingStatus): string {
    switch(status) {
      case BookingStatus.Pending: return 'badge-warning';
      case BookingStatus.Confirmed: return 'badge-success';
      case BookingStatus.InProgress: return 'badge-primary';
      case BookingStatus.Completed: return 'badge-info';
      case BookingStatus.Cancelled: return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  formatDate(dateOnly: any): string {
    if (!dateOnly) return '';
    if (typeof dateOnly === 'string') {
      const date = new Date(dateOnly);
      return date.toLocaleDateString('es-ES');
    }
    if (dateOnly.year && dateOnly.month && dateOnly.day) {
      const date = new Date(dateOnly.year, dateOnly.month - 1, dateOnly.day);
      return date.toLocaleDateString('es-ES');
    }
    return dateOnly.toString();
  }

  formatTime(timeOnly: any): string {
    if (!timeOnly) return '';
    if (typeof timeOnly === 'string') {
      return timeOnly;
    }
    if (timeOnly.hour !== undefined && timeOnly.minute !== undefined) {
      const hour = timeOnly.hour.toString().padStart(2, '0');
      const minute = timeOnly.minute.toString().padStart(2, '0');
      return `${hour}:${minute}`;
    }
    return timeOnly.toString();
  }

  toggleExpand(bookingId: string): void {
    if (this.expandedBookingId === bookingId) {
      this.expandedBookingId = null;
    } else {
      this.expandedBookingId = bookingId;
    }
  }

  isExpanded(bookingId: string): boolean {
    return this.expandedBookingId === bookingId;
  }

  getChevronClass(bookingId: string): string {
    return this.isExpanded(bookingId) ? 'bx-chevron-up' : 'bx-chevron-down';
  }

  collapseAll(): void {
    this.expandedBookingId = null;
  }

  getBookingDateClass(booking: Booking): string {
    if (!booking.bookingDate) {
      return 'bg-white';
    }

    try {
      let bookingDateOnly: DateOnly;

      if (typeof booking.bookingDate === 'string') {
        const dateString = booking.bookingDate as string;
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
          bookingDateOnly = DateUtils.stringToDateOnly(dateString);
        } else {
          const tempDate = new Date(dateString);
          bookingDateOnly = DateUtils.dateToDateOnly(tempDate);
        }
      }
      else if (booking.bookingDate && typeof booking.bookingDate === 'object' && 
               (booking.bookingDate as any).year && (booking.bookingDate as any).month && (booking.bookingDate as any).day) {
        bookingDateOnly = booking.bookingDate as DateOnly;
      }
      else if (booking.bookingDate instanceof Date) {
        bookingDateOnly = DateUtils.dateToDateOnly(booking.bookingDate);
      }
      else {
        return 'bg-white';
      }

      const today = DateUtils.today();

      const comparison = DateUtils.compareDates(bookingDateOnly, today);

      if (comparison < 0) {
        return 'bg-light';
      } else {
        return 'bg-white';
      }

    } catch (error) {
      console.warn('Error al procesar fecha del booking:', error);
      return 'bg-white';
    }
  }

}
