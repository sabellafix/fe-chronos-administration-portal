import { Component } from '@angular/core';

@Component({
  selector: 'app-skelleton-calendar-monthly',
  templateUrl: './skelleton-calendar-monthly.component.html',
  styleUrls: ['./skelleton-calendar-monthly.component.scss']
})
export class SkelletonCalendarMonthlyComponent {
  weekDays = [1, 2, 3, 4, 5, 6, 7];
  weeks = [1, 2, 3, 4, 5];

  private bookingsPattern: { [key: string]: number[] } = {};

  constructor() {
    this.generateBookingsPattern();
  }

  private generateBookingsPattern(): void {
    this.weeks.forEach(week => {
      this.weekDays.forEach(day => {
        const key = `${week}-${day}`;
        const count = Math.random() > 0.6 ? Math.floor(Math.random() * 2) + 1 : 0;
        this.bookingsPattern[key] = Array(count).fill(0);
      });
    });
  }

  shouldShowBookings(week: number, day: number): boolean {
    const key = `${week}-${day}`;
    return this.bookingsPattern[key].length > 0;
  }

  getBookings(week: number, day: number): number[] {
    const key = `${week}-${day}`;
    return this.bookingsPattern[key];
  }
}
