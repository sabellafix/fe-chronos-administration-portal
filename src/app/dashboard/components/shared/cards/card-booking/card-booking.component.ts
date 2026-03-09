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
  
  // Inputs para posicionamiento absoluto (opcional - solo para calendario semanal)
  @Input() absolutePosition?: boolean = false;
  @Input() topPosition?: string;
  @Input() leftOffset?: string;
  @Input() width?: string;
  @Input() height?: string;
  @Input() zIndex?: number;
  
  imageUser: string = "../assets/images/user-image.jpg";
  
  // Estado del menú desplegable
  showDropdownMenu: boolean = false;


  ngOnInit(): void {
    if(!this.booking.user.firstName) {
      console.log(this.booking);
    }
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

    // 60 minutos = 80px de altura
    const pixelsPerMinute = 80 / 60; // 1.333... px por minuto
    const calculatedHeight = Math.round(this.booking.durationMinutes * pixelsPerMinute);

    return `${calculatedHeight}px`;
  }

  getProportionalHeightLg(): string {
    if (this.size !== 'lg' || !this.booking) {
      return 'auto';
    }

    // Para LG: 60 minutos = 120px de altura (más espacio que md)
    const pixelsPerMinute = 120 / 60; // 2px por minuto
    const calculatedHeight = Math.round(this.booking.durationMinutes * pixelsPerMinute);

    return `${calculatedHeight}px`;
  }

  /**
   * Obtiene los estilos de posicionamiento para la tarjeta
   */
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

  /**
   * Alterna la visibilidad del menú desplegable
   */
  toggleDropdownMenu(event: Event): void {
    event.stopPropagation(); // Evita que se propague el evento
    this.showDropdownMenu = !this.showDropdownMenu;
  }

  /**
   * Oculta el menú desplegable
   */
  hideDropdownMenu(): void {
    this.showDropdownMenu = false;
  }

  /**
   * Maneja la acción de desplegar
   */
  onExpand(event: Event): void {
    event.stopPropagation();
    this.hideDropdownMenu();
    // TODO: Implementar lógica de desplegar    
  }

  /**
   * Maneja la acción de editar
   */
  onEdit(event: Event): void {
    event.stopPropagation();
    this.hideDropdownMenu();
    // TODO: Implementar lógica de editar
  }

  /**
   * Maneja la acción de ver detalle
   */
  onDetail(event: Event): void {
    event.stopPropagation();
    this.hideDropdownMenu();
    // TODO: Implementar lógica de detalle
  }

  /**
   * Maneja la acción de eliminar
   */
  onDelete(event: Event): void {
    event.stopPropagation();
    this.hideDropdownMenu();
    // TODO: Implementar lógica de eliminar
  }

  /**
   * Obtiene el texto del estado del booking
   */
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

  /**
   * Obtiene la clase CSS para el estado del booking
   */
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
