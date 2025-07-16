import { Pipe, PipeTransform } from '@angular/core';
import { TimeOnly } from '../models/bussiness/availability';
import { TimeUtils } from '../utils/time.utils';

@Pipe({
  name: 'timeOnly'
})
export class TimeOnlyPipe implements PipeTransform {

  transform(value: TimeOnly | null | undefined, format: 'short' | 'full' = 'short'): string {
    if (!value) {
      return '';
    }

    switch (format) {
      case 'short':
        return TimeUtils.timeOnlyToShortString(value); // HH:MM
      case 'full':
        return TimeUtils.timeOnlyToString(value); // HH:MM:SS
      default:
        return TimeUtils.timeOnlyToShortString(value);
    }
  }
} 