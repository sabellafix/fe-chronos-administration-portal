import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Salon } from '@app/core/models/bussiness/salon';

@Injectable({
  providedIn: 'root'
})
export class SalonStateService {

  // BehaviorSubject privado para mantener el estado del salón seleccionado
  private selectedSalonSubject: BehaviorSubject<Salon | null> = new BehaviorSubject<Salon | null>(null);

  // Observable público para que los componentes se suscriban
  public selectedSalon$: Observable<Salon | null> = this.selectedSalonSubject.asObservable();

  constructor() { }

  /**
   * Establece el salón seleccionado y notifica a todos los observadores
   * @param salon El salón seleccionado
   */
  setSelectedSalon(salon: Salon): void {
    this.selectedSalonSubject.next(salon);
  }

  /**
   * Obtiene el valor actual del salón seleccionado sin suscribirse
   * @returns El salón actualmente seleccionado o null
   */
  getCurrentSalon(): Salon | null {
    return this.selectedSalonSubject.value;
  }
}

