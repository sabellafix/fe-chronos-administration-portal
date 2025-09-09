import { Component, Input } from '@angular/core';
import { Booking } from '@app/core/models/bussiness/booking';
import { BookingService } from '@app/core/services/http/booking.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '@app/core/models/bussiness/user';
import { BookingStatus } from '@app/core/models/bussiness/enums';

@Component({
  selector: 'app-list-bookings',
  templateUrl: './list-bookings.component.html',
  styleUrl: './list-bookings.component.scss'
})
export class ListBookingsComponent {

  @Input() id?: string | null = null;
  @Input() bookings?: Booking[] | null = null;
  @Input() user?: User | null = null;

  loading: boolean = false;
  BookingStatus = BookingStatus;

  constructor(private bookingService: BookingService,
    private snackBar: MatSnackBar
  ){}

  ngOnInit(): void {
    if(this.id){
      this.loadByIdUSer();
    }
  }

  loadByIdUSer(): void {
    this.loading = true;
    this.bookingService.getByUserDateRange(this.id!, undefined, undefined).subscribe({
      next: (data: Booking[]) => {
        this.bookings = data;
        this.loading = false;
      },
      error: (error: any) => {
        this.loading = false;
        this.snackBar.open('Error retrieving bookings', 'Close', {duration: 4000});
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



}
