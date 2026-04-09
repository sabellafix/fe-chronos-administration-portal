import { Component, Input } from '@angular/core';
import { Booking } from '@app/core/models/bussiness';
import { BookingStatus } from '@app/core/models/bussiness/enums';

@Component({
  selector: 'app-card-booking',
  templateUrl: './card-booking.component.html',
  styleUrl: './card-booking.component.scss'
})
export class CardBookingComponent {
  @Input() booking!: Booking;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';  
  
  @Input() absolutePosition?: boolean = false;
  @Input() topPosition?: string;
  @Input() leftOffset?: string;
  @Input() width?: string;
  @Input() height?: string;
  @Input() zIndex?: number;
  
  imageUser: string = "../assets/images/user-image.jpg";
  showDropdownMenu: boolean = false;

  ngOnInit(): void {
  }

  getBookingTooltip(booking: Booking): string {
    const services = booking.services?.map(s => s.serviceName).join(', ') || 'Sin servicios';
    const duration = `${booking.durationMinutes} min`;
    const price = `$${booking.totalPrice}`;
    
    return `Servicios: ${services} | Duración: ${duration} | Precio: ${price}`;
  }

  getProportionalHeight(): string {
    if (this.size !== 'md' || !this.booking) {
      return 'auto';
    }

    const pixelsPerMinute = 80 / 60;
    const calculatedHeight = Math.round(this.booking.durationMinutes * pixelsPerMinute);

    return `${calculatedHeight}px`;
  }

  getProportionalHeightLg(): string {
    if (this.size !== 'lg' || !this.booking) {
      return 'auto';
    }

    const pixelsPerMinute = 120 / 60;
    const calculatedHeight = Math.round(this.booking.durationMinutes * pixelsPerMinute);

    return `${calculatedHeight}px`;
  }

  getPositionStyles(): { [key: string]: string } {
    if (!this.absolutePosition) {
      return {};
    }

    const styles: { [key: string]: string } = {
      position: 'absolute',
    };

    if (this.topPosition) styles['top'] = this.topPosition;
    if (this.leftOffset) styles['left'] = this.leftOffset;
    if (this.width) styles['width'] = this.width;
    if (this.zIndex) styles['z-index'] = this.zIndex.toString();

    return styles;
  }

  toggleDropdownMenu(event: Event): void {
    event.stopPropagation();
    this.showDropdownMenu = !this.showDropdownMenu;
  }

  hideDropdownMenu(): void {
    this.showDropdownMenu = false;
  }

  onExpand(event: Event): void {
    event.stopPropagation();
    this.hideDropdownMenu();
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    this.hideDropdownMenu();
  }

  onDetail(event: Event): void {
    event.stopPropagation();
    this.hideDropdownMenu();
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    this.hideDropdownMenu();
  }

  getStatusText(): string {
    const statusMap: { [key: number]: string } = {
      [BookingStatus.Pending]: 'Pendiente',
      [BookingStatus.Confirmed]: 'Confirmado',
      [BookingStatus.InProgress]: 'En Progreso',
      [BookingStatus.Completed]: 'Completado',
      [BookingStatus.Cancelled]: 'Cancelado',
      [BookingStatus.NoShow]: 'No Show'
    };
    return statusMap[this.booking.status] || 'Desconocido';
  }

  getStatusClass(): string {
    const classMap: { [key: number]: string } = {
      [BookingStatus.Pending]: 'status-pending',
      [BookingStatus.Confirmed]: 'status-confirmed',
      [BookingStatus.InProgress]: 'status-inprogress',
      [BookingStatus.Completed]: 'status-completed',
      [BookingStatus.Cancelled]: 'status-cancelled',
      [BookingStatus.NoShow]: 'status-noshow'
    };
    return classMap[this.booking.status] || '';
  }
}
