import { TimeOnly } from '../models/bussiness/availability';

export class TimeUtils {
  
  /**
   * Convierte un string formato "HH:MM:SS" a TimeOnly
   */
  static stringToTimeOnly(timeString: string): TimeOnly {
    const timeOnly = new TimeOnly();
    const [hour, minute, second] = timeString.split(':').map(Number);
    
    timeOnly.hour = hour || 0;
    timeOnly.minute = minute || 0;
    (timeOnly as any).second = second || 0;
    
    return timeOnly;
  }

  /**
   * Convierte TimeOnly a string formato "HH:MM:SS"
   */
  static timeOnlyToString(time: TimeOnly): string {
    const hour = time.hour.toString().padStart(2, '0');
    const minute = time.minute.toString().padStart(2, '0');
    const second = time.second.toString().padStart(2, '0');
    
    return `${hour}:${minute}:${second}`;
  }

  /**
   * Convierte TimeOnly a string formato "HH:MM" (sin segundos)
   */
  static timeOnlyToShortString(time: TimeOnly): string {
    const hour = time.hour.toString().padStart(2, '0');
    const minute = time.minute.toString().padStart(2, '0');
    
    return `${hour}:${minute}`;
  }

  /**
   * Calcula la diferencia en minutos entre dos TimeOnly
   */
  static getTimeDifferenceInMinutes(startTime: TimeOnly, endTime: TimeOnly): number {
    const startMinutes = startTime.hour * 60 + startTime.minute;
    const endMinutes = endTime.hour * 60 + endTime.minute;
    
    return endMinutes - startMinutes;
  }

  /**
   * Añade minutos a un TimeOnly y retorna un nuevo TimeOnly
   */
  static addMinutes(time: TimeOnly, minutes: number): TimeOnly {
    const totalMinutes = time.hour * 60 + time.minute + minutes;
    const newTime = new TimeOnly();
    
    newTime.hour = Math.floor(totalMinutes / 60) % 24;
    newTime.minute = totalMinutes % 60;
    
    return newTime;
  }

  /**
   * Convierte input HTML time (HH:MM) a TimeOnly
   */
  static htmlTimeInputToTimeOnly(htmlTime: string): TimeOnly {
    const [hour, minute] = htmlTime.split(':').map(Number);
    const timeOnly = new TimeOnly();
    
    timeOnly.hour = hour || 0;
    timeOnly.minute = minute || 0;
    
    return timeOnly;
  }

  /**
   * Convierte TimeOnly a formato para input HTML time (HH:MM)
   */
  static timeOnlyToHtmlTimeInput(time: TimeOnly): string {
    return this.timeOnlyToShortString(time);
  }

  /**
   * Verifica si un TimeOnly está en un rango
   */
  static isTimeInRange(time: TimeOnly, startRange: TimeOnly, endRange: TimeOnly): boolean {
    const timeMinutes = time.hour * 60 + time.minute;
    const startMinutes = startRange.hour * 60 + startRange.minute;
    const endMinutes = endRange.hour * 60 + endRange.minute;
    
    return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
  }

  /**
   * Crea un TimeOnly desde Date (extrae solo la hora)
   */
  static dateToTimeOnly(date: Date): TimeOnly {
    const timeOnly = new TimeOnly();
    
    timeOnly.hour = date.getHours();
    timeOnly.minute = date.getMinutes();
    (timeOnly as any).second = date.getSeconds();
    
    return timeOnly;
  }

  /**
   * Combina DateOnly con TimeOnly para crear un Date completo
   */
  static combineDateTime(dateOnly: any, timeOnly: TimeOnly): Date {
    return new Date(dateOnly.year, dateOnly.month - 1, dateOnly.day, timeOnly.hour, timeOnly.minute, timeOnly.second);
  }
} 