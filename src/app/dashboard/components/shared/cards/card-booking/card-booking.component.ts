import { Component, Input } from '@angular/core';
import { Booking } from '@app/core/models/bussiness';

@Component({
  selector: 'app-card-booking',
  templateUrl: './card-booking.component.html',
  styleUrl: './card-booking.component.scss'
})
export class CardBookingComponent {
  @Input() booking!: Booking;
  @Input() size: 'sm' | 'md' = 'md';  
  
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

    const minHeight = 85;
    const maxHeight = 200;
    const baseDuration = 30;
    const pixelsPerInterval = 20;
    const intervalMinutes = 15;

    let calculatedHeight = minHeight;

    if (this.booking.durationMinutes > baseDuration) {
      const extraMinutes = this.booking.durationMinutes - baseDuration;
      const intervals = Math.ceil(extraMinutes / intervalMinutes);
      calculatedHeight = minHeight + (intervals * pixelsPerInterval);
    }

    // Aplicar límite máximo
    calculatedHeight = Math.min(calculatedHeight, maxHeight);

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
    if (this.height) styles['height'] = this.height;
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
    console.log('Desplegar booking:', this.booking);
  }

  /**
   * Maneja la acción de editar
   */
  onEdit(event: Event): void {
    event.stopPropagation();
    this.hideDropdownMenu();
    // TODO: Implementar lógica de editar
    console.log('Editar booking:', this.booking);
  }

  /**
   * Maneja la acción de ver detalle
   */
  onDetail(event: Event): void {
    event.stopPropagation();
    this.hideDropdownMenu();
    // TODO: Implementar lógica de detalle
    console.log('Ver detalle booking:', this.booking);
  }

  /**
   * Maneja la acción de eliminar
   */
  onDelete(event: Event): void {
    event.stopPropagation();
    this.hideDropdownMenu();
    // TODO: Implementar lógica de eliminar
    console.log('Eliminar booking:', this.booking);
  }
}
