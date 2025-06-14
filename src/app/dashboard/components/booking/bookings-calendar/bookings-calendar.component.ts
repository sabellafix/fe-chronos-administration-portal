import { Component } from '@angular/core';

@Component({
  selector: 'app-bookings-calendar',
  templateUrl: './bookings-calendar.component.html',
  styleUrl: './bookings-calendar.component.scss'
})
export class BookingsCalendarComponent {
  dateNow : Date = new Date();

}
