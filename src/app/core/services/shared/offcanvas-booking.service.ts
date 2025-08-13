import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
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

  // Estado para controlar si los modales están abiertos
  private _isCreateModalOpen = false;
  private _isUpdateModalOpen = false;

  selectedDate$ = this._selectedDate.asObservable();
  selectedHour$ = this._selectedHour.asObservable();
  selectedStylistId$ = this._selectedStylistId.asObservable();
  showOffcanvas$ = this._showOffcanvas.asObservable();
  bookingCreated$ = this._bookingCreated.asObservable();
  cancelled$ = this._cancelled.asObservable();

  // Nuevos observables para el offcanvas de actualización
  showUpdateOffcanvas$ = this._showUpdateOffcanvas.asObservable();
  bookingUpdated$ = this._bookingUpdated.asObservable();

  constructor() { }

  openBookingModal(date: Date, hour?: number, stylistId?: string): void {
    // Prevenir apertura múltiple del modal de creación
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

  // Nuevos métodos para el offcanvas de actualización
  openUpdateBookingModal(bookingId: string): void {
    // Prevenir apertura múltiple del modal de actualización
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

  get selectedDate(): Date | null {
    return this._selectedDate.value;
  }

  get selectedHour(): number | null {
    return this._selectedHour.value;
  }

  get selectedStylistId(): string | null {
    return this._selectedStylistId.value;
  }

  // Getters para verificar el estado de los modales
  get isCreateModalOpen(): boolean {
    return this._isCreateModalOpen;
  }

  get isUpdateModalOpen(): boolean {
    return this._isUpdateModalOpen;
  }

  // Métodos de utilidad para resetear el estado (solo en casos extremos)
  forceCloseCreateModal(): void {
    this._isCreateModalOpen = false;
  }

  forceCloseUpdateModal(): void {
    this._isUpdateModalOpen = false;
  }

  // Método para resetear completamente el estado del servicio
  resetState(): void {
    this._isCreateModalOpen = false;
    this._isUpdateModalOpen = false;
    this._selectedDate.next(null);
    this._selectedHour.next(null);
    this._selectedStylistId.next(null);
  }
} 