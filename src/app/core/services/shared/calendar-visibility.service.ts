import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalendarVisibilityService {
  
  private bookingsVisibleSubject = new BehaviorSubject<boolean>(true);
  
  public bookingsVisible$: Observable<boolean> = this.bookingsVisibleSubject.asObservable();

  constructor() {}

  getBookingsVisible(): boolean {
    return this.bookingsVisibleSubject.getValue();
  }

  setBookingsVisible(visible: boolean): void {
    this.bookingsVisibleSubject.next(visible);
  }

  toggleBookingsVisible(): boolean {
    const newValue = !this.bookingsVisibleSubject.getValue();
    this.bookingsVisibleSubject.next(newValue);
    return newValue;
  }
}
