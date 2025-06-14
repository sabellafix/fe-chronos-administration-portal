import { Component } from '@angular/core';
import { DateItem } from '@app/core/models/bussiness/calendar/dateItem';

@Component({
  selector: 'app-calendar-weekly',
  templateUrl: './calendar-weekly.component.html',
  styleUrl: './calendar-weekly.component.scss'
})
export class CalendarWeeklyComponent {

  dateNow : Date = new Date();
  dates: DateItem[] = [];
  activeDate: DateItem = new DateItem();

  constructor(){
    this.dates = this.getDates();
  }
  
  getDates(){
    const dates: DateItem[] = [];
    
    for (let i = 0; i < 7; i++) {
      const dateItem = new DateItem();
      const nextDate = new Date(this.dateNow);
      nextDate.setDate(this.dateNow.getDate() + i);
      
      dateItem.date = nextDate;
      dateItem.isToday = i === 0;
      
      dates.push(dateItem);
    }
    
    return dates;
  } 

  setActiveDate(date: DateItem = new DateItem()   ){
    this.dates.forEach(date => date.isActive = false);
    date.isActive = true;
    this.activeDate = date;
  }

  // Genera el rango de horas de 7 AM a 10 PM
  getHoursRange(): number[] {
    const hours: number[] = [];
    for (let i = 7; i <= 22; i++) {
      hours.push(i);
    }
    return hours;
  }

  // Formatea la hora en formato 12 horas con AM/PM
  formatHour(hour: number): string {
    if (hour === 0) {
      return '12 am';
    } else if (hour < 12) {
      return `${hour} am`;
    } else if (hour === 12) {
      return '12 pm';
    } else {
      return `${hour - 12} pm`;
    }
  }

}
