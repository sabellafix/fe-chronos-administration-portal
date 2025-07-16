import { Pipe, PipeTransform } from '@angular/core';
import { DateOnly } from '../models/bussiness/availability';
import { DateUtils } from '../utils/date.utils';

@Pipe({
  name: 'dateOnly'
})
export class DateOnlyPipe implements PipeTransform {

  transform(value: DateOnly | null | undefined, format: 'iso' | 'short' | 'long' | 'weekday' = 'iso'): string {
    if (!value) {
      return '';
    }

    return DateUtils.formatDate(value, format);
  }
} 