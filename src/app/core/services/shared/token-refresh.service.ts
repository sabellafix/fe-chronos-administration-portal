import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenRefreshService {
  
  private _tokenUpdated = new Subject<void>();
  
  /**
   * Observable que se emite cuando el token es actualizado
   */
  tokenUpdated$ = this._tokenUpdated.asObservable();

  constructor() { }

  /**
   * Notifica que el token ha sido actualizado
   * Debe ser llamado después de un login exitoso
   */
  notifyTokenUpdate(): void {
    console.log('🔄 Notificando actualización de token...');
    this._tokenUpdated.next();
  }
}
