import { Component, Input, OnInit } from '@angular/core';

interface BookingPattern {
  show: boolean;
  height: number;
  width: number;
  left: number;
  colorIndex: number;
}

@Component({
  selector: 'app-skelleton-calendar-weekly',
  templateUrl: './skelleton-calendar-weekly.component.html',
  styleUrls: ['./skelleton-calendar-weekly.component.scss']
})
export class SkelletonCalendarWeeklyComponent implements OnInit {
  @Input() hoursCount: number = 12;
  @Input() startHour: number = 7;
  @Input() weekDays: number[] = [1, 2, 3, 4, 5, 6, 7];

  hours: number[] = [];

  private bookingsPattern: { [key: string]: BookingPattern } = {};
  
  private bookingColors = [
    'rgba(220, 167, 167, 0.6)',
    'rgba(167, 220, 167, 0.6)',
    'rgba(167, 167, 220, 0.6)',
    'rgba(220, 200, 167, 0.6)',
    'rgba(200, 167, 220, 0.6)',
    'rgba(167, 200, 220, 0.6)',
    'rgba(220, 180, 180, 0.6)',
    'rgba(180, 220, 200, 0.6)',
  ];

  ngOnInit(): void {
    this.generateHours();
    this.generateBookingsPattern();
  }

  private generateHours(): void {
    this.hours = [];
    for (let i = 0; i < this.hoursCount; i++) {
      this.hours.push(this.startHour + i);
    }
  }

  private generateBookingsPattern(): void {
    this.weekDays.forEach(day => {
      this.hours.forEach(hour => {
        const key = `${hour}-${day}`;
        const random = Math.random();
        
        if (random > 0.7) {
          const heightMultiplier = Math.random() > 0.5 ? 2 : (Math.random() > 0.5 ? 3 : 1);
          const hasOverlap = Math.random() > 0.7;
          
          this.bookingsPattern[key] = {
            show: true,
            height: 76 * heightMultiplier,
            width: hasOverlap ? Math.floor(Math.random() * 30) + 45 : 96,
            left: hasOverlap && Math.random() > 0.5 ? Math.floor(Math.random() * 40) + 10 : 2,
            colorIndex: Math.floor(Math.random() * this.bookingColors.length)
          };
        } else {
          this.bookingsPattern[key] = {
            show: false,
            height: 0,
            width: 0,
            left: 0,
            colorIndex: 0
          };
        }
      });
    });
  }

  shouldShowBooking(hour: number, day: number): boolean {
    const key = `${hour}-${day}`;
    return this.bookingsPattern[key]?.show || false;
  }

  getBookingHeight(hour: number, day: number): string {
    const key = `${hour}-${day}`;
    const height = this.bookingsPattern[key]?.height || 76;
    return `${height}px`;
  }

  getBookingWidth(hour: number, day: number): string {
    const key = `${hour}-${day}`;
    const width = this.bookingsPattern[key]?.width || 96;
    return `${width}%`;
  }

  getBookingLeft(hour: number, day: number): string {
    const key = `${hour}-${day}`;
    const left = this.bookingsPattern[key]?.left || 2;
    return `${left}%`;
  }

  getBookingColor(hour: number, day: number): string {
    const key = `${hour}-${day}`;
    const colorIndex = this.bookingsPattern[key]?.colorIndex || 0;
    return this.bookingColors[colorIndex];
  }
}
