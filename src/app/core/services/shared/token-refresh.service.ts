import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenRefreshService {
  
  private _tokenUpdated = new Subject<void>();
  tokenUpdated$ = this._tokenUpdated.asObservable();

  constructor() { }

  notifyTokenUpdate(): void {    
    this._tokenUpdated.next();
  }
}
