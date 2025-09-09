import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dayNumber'
})
export class DayNumberPipe implements PipeTransform {

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

    // Retornar el día con formato de dos dígitos
    return date.getDate().toString().padStart(2, '0');
  }
}
