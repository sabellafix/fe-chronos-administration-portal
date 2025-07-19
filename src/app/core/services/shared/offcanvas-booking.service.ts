import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Booking } from '../../models/bussiness/booking';

@Injectable({
  providedIn: 'root'
})
export class OffcanvasBookingService {
  private _selectedDate = new BehaviorSubject<Date | null>(null);
  private _selectedHour = new BehaviorSubject<number | null>(null);
  private _showOffcanvas = new Subject<void>();
  private _bookingCreated = new Subject<Booking>();
  private _cancelled = new Subject<void>();

  // Nuevas propiedades para el offcanvas de actualización
  private _showUpdateOffcanvas = new Subject<string>();
  private _bookingUpdated = new Subject<Booking>();

  selectedDate$ = this._selectedDate.asObservable();
  selectedHour$ = this._selectedHour.asObservable();
  showOffcanvas$ = this._showOffcanvas.asObservable();
  bookingCreated$ = this._bookingCreated.asObservable();
  cancelled$ = this._cancelled.asObservable();

  // Nuevos observables para el offcanvas de actualización
  showUpdateOffcanvas$ = this._showUpdateOffcanvas.asObservable();
  bookingUpdated$ = this._bookingUpdated.asObservable();

  constructor() { }

  openBookingModal(date: Date, hour?: number): void {
    this._selectedDate.next(date);
    this._selectedHour.next(hour || null);
    this._showOffcanvas.next();
  }

  onBookingCreated(booking: Booking | null): void {
    if(booking !== null){
      this._bookingCreated.next(booking);
    }
  }

  onCancelled(): void {
    this._cancelled.next();
  }

  // Nuevos métodos para el offcanvas de actualización
  openUpdateBookingModal(bookingId: string): void {
    this._showUpdateOffcanvas.next(bookingId);
  }

  onBookingUpdated(booking: Booking): void {
    this._bookingUpdated.next(booking);
  }

  get selectedDate(): Date | null {
    return this._selectedDate.value;
  }

  get selectedHour(): number | null {
    return this._selectedHour.value;
  }
} 