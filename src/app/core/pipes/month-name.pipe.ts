import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'monthName'
})
export class MonthNamePipe implements PipeTransform {

  private monthNames = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  transform(dateValue: any): string {
    if (!dateValue) return '';

    let date: Date;

    // Si es un string, convertir a Date
    if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    }
    // Si es un objeto con propiedades year, month, day
    else if (dateValue.year && dateValue.month && dateValue.day) {
      date = new Date(dateValue.year, dateValue.month - 1, dateValue.day);
    }
    // Si ya es una fecha
    else if (dateValue instanceof Date) {
      date = dateValue;
    }
    else {
      return '';
    }

    // Verificar que la fecha sea válida
    if (isNaN(date.getTime())) {
      return '';
    }

    return this.monthNames[date.getMonth()];
  }
}
