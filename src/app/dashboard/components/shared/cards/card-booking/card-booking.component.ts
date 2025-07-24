import { Component, Input } from '@angular/core';
import { Booking } from '@app/core/models/bussiness/booking';

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
}
