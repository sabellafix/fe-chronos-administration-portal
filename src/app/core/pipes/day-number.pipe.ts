import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dayNumber'
})
export class DayNumberPipe implements PipeTransform {

  transform(dateValue: any): string {
    if (!dateValue) return '';

    let date: Date;

    if (typeof dateValue === 'string') {
      if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const parts = dateValue.split('-');
        date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } else {
        date = new Date(dateValue);
      }
    }
    else if (dateValue && typeof dateValue === 'object' && dateValue.year && dateValue.month && dateValue.day) {
      date = new Date(dateValue.year, dateValue.month - 1, dateValue.day);
    }
    else if (dateValue instanceof Date) {
      date = dateValue;
    }
    else {
      return '';
    }

    if (isNaN(date.getTime())) {
      return '';
    }

    return date.getDate().toString().padStart(2, '0');
  }
}
