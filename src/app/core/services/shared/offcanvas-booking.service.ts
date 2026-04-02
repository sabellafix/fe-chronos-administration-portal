import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Booking } from '../../models/bussiness/booking';

@Injectable({
  providedIn: 'root'
})
export class OffcanvasBookingService {
  private _selectedDate = new BehaviorSubject<Date | null>(null);
  private _selectedHour = new BehaviorSubject<number | null>(null);
  private _selectedStylistId = new BehaviorSubject<string | null>(null);
  private _showOffcanvas = new Subject<void>();
  private _bookingCreated = new Subject<Booking>();
  private _cancelled = new Subject<void>();

  // Nuevas propiedades para el offcanvas de actualización
  private _showUpdateOffcanvas = new Subject<string>();
  private _bookingUpdated = new Subject<Booking>();

  // Propiedades para el offcanvas de detalle
  private _showDetailOffcanvas = new Subject<string>();

  // Estado para controlar si los modales están abiertos
  private _isCreateModalOpen = false;
  private _isUpdateModalOpen = false;
  private _isDetailModalOpen = false;

  // Estado para controlar si el servicio está habilitado según la ruta
  private _isEnabled = new BehaviorSubject<boolean>(false);

  selectedDate$ = this._selectedDate.asObservable();
  selectedHour$ = this._selectedHour.asObservable();
  selectedStylistId$ = this._selectedStylistId.asObservable();
  showOffcanvas$ = this._showOffcanvas.asObservable();
  bookingCreated$ = this._bookingCreated.asObservable();
  cancelled$ = this._cancelled.asObservable();

  // Nuevos observables para el offcanvas de actualización
  showUpdateOffcanvas$ = this._showUpdateOffcanvas.asObservable();
  bookingUpdated$ = this._bookingUpdated.asObservable();

  // Observable para el offcanvas de detalle
  showDetailOffcanvas$ = this._showDetailOffcanvas.asObservable();

  // Observable para verificar si el servicio está habilitado
  isEnabled$ = this._isEnabled.asObservable();

  constructor(private router: Router) {
    this.initRouteListener();
  }

  private initRouteListener(): void {
    this.checkCurrentRoute(this.router.url);
    
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.checkCurrentRoute(event.urlAfterRedirects);
      });
  }

  private checkCurrentRoute(url: string): void {
    const isBookingsRoute = url.includes('/bookings');
    const isCalendarRoute = url.includes('/calendar');
    const isValidRoute = isBookingsRoute || isCalendarRoute;
    
    this._isEnabled.next(isValidRoute);
    
    if (!isValidRoute) {
      this.resetState();
    }
  }

  private isServiceEnabled(): boolean {
    return this._isEnabled.value;
  }

  openBookingModal(date: Date, hour?: number, stylistId?: string): void {
    if (!this.isServiceEnabled()) {
      console.warn('OffcanvasBookingService: El servicio solo está disponible en las rutas /bookings o /calendar');
      return;
    }

    if (this._isCreateModalOpen) {
      return;
    }

    this._selectedDate.next(date);
    this._selectedHour.next(hour || null);
    this._selectedStylistId.next(stylistId || null);
    this._isCreateModalOpen = true;
    this._showOffcanvas.next();
  }

  onBookingCreated(booking: Booking | null): void {
    if(booking !== null){
      this._bookingCreated.next(booking);
    }
    // Marcar el modal como cerrado cuando se crea o cancela una reserva
    this._isCreateModalOpen = false;
  }

  onCancelled(): void {
    // Solo emitir si el modal estaba realmente abierto
    if (this._isCreateModalOpen) {
      this._cancelled.next();
      this._isCreateModalOpen = false;
    }
  }

  openUpdateBookingModal(bookingId: string): void {
    if (!this.isServiceEnabled()) {
      console.warn('OffcanvasBookingService: El servicio solo está disponible en las rutas /bookings o /calendar');
      return;
    }

    if (this._isUpdateModalOpen) {
      return;
    }

    this._isUpdateModalOpen = true;
    this._showUpdateOffcanvas.next(bookingId);
  }

  onBookingUpdated(booking: Booking): void {
    this._bookingUpdated.next(booking);
    // Marcar el modal de actualización como cerrado
    this._isUpdateModalOpen = false;
  }

  // Método para cerrar el modal de actualización manualmente (en caso de cancelación)
  onUpdateCancelled(): void {
    // Solo cambiar el estado si estaba realmente abierto
    if (this._isUpdateModalOpen) {
      this._isUpdateModalOpen = false;
    }
  }

  openDetailBookingModal(bookingId: string): void {
    if (!this.isServiceEnabled()) {
      console.warn('OffcanvasBookingService: El servicio solo está disponible en las rutas /bookings o /calendar');
      return;
    }

    if (this._isDetailModalOpen) {
      return;
    }

    this._isDetailModalOpen = true;
    this._showDetailOffcanvas.next(bookingId);
  }

  onDetailClosed(): void {
    // Solo cambiar el estado si estaba realmente abierto
    if (this._isDetailModalOpen) {
      this._isDetailModalOpen = false;
    }
  }

  get selectedDate(): Date | null {
    return this._selectedDate.value;
  }

  get selectedHour(): number | null {
    return this._selectedHour.value;
  }

  get selectedStylistId(): string | null {
    return this._selectedStylistId.value;
  }

  get isCreateModalOpen(): boolean {
    return this._isCreateModalOpen;
  }

  get isUpdateModalOpen(): boolean {
    return this._isUpdateModalOpen;
  }

  get isDetailModalOpen(): boolean {
    return this._isDetailModalOpen;
  }

  get isEnabled(): boolean {
    return this._isEnabled.value;
  }

  // Métodos de utilidad para resetear el estado (solo en casos extremos)
  forceCloseCreateModal(): void {
    this._isCreateModalOpen = false;
  }

  forceCloseUpdateModal(): void {
    this._isUpdateModalOpen = false;
  }

  forceCloseDetailModal(): void {
    this._isDetailModalOpen = false;
  }

  // Método para resetear completamente el estado del servicio
  resetState(): void {
    this._isCreateModalOpen = false;
    this._isUpdateModalOpen = false;
    this._isDetailModalOpen = false;
    this._selectedDate.next(null);
    this._selectedHour.next(null);
    this._selectedStylistId.next(null);
  }
} 