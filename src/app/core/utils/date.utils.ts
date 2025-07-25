import { DateOnly, TimeOnly } from "../models/bussiness/availability";
import { DayOfWeek } from "../models/bussiness/enums";

export class DateUtils {

  /**
   * Convierte un string formato "YYYY-MM-DD" a DateOnly
   */
  static stringToDateOnly(dateString: string): DateOnly {
    const dateOnly = new DateOnly();
    const [year, month, day] = dateString.split('-').map(Number);
    dateOnly.year = year;
    dateOnly.month = month;
    dateOnly.day = day;
    dateOnly.dayOfWeek = new Date(year, month - 1, day).getDay();
    return dateOnly;
  }

  /**
   * Convierte DateOnly a string formato "YYYY-MM-DD"
   */
  static dateOnlyToString(date: DateOnly): string {
    const year = date.year.toString();
    const month = date.month.toString().padStart(2, '0');
    const day = date.day.toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  /**
   * Convierte DateOnly a string formato "DD/MM/YYYY"
   */
  static dateOnlyToShortString(date: DateOnly): string {
    const year = date.year.toString();
    const month = date.month.toString().padStart(2, '0');
    const day = date.day.toString().padStart(2, '0');
    
    return `${day}/${month}/${year}`;
  }

  /**
   * Calcula la diferencia en días entre dos DateOnly
   */
  static getDateDifferenceInDays(startDate: DateOnly, endDate: DateOnly): number {
    const start = new Date(startDate.year, startDate.month - 1, startDate.day);
    const end = new Date(endDate.year, endDate.month - 1, endDate.day);
    
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Añade días a un DateOnly y retorna un nuevo DateOnly
   */
  static addDays(date: DateOnly, days: number): DateOnly {
    const jsDate = new Date(date.year, date.month - 1, date.day);
    jsDate.setDate(jsDate.getDate() + days);
    
    const newDate = new DateOnly();
    newDate.year = jsDate.getFullYear();
    newDate.month = jsDate.getMonth() + 1;
    newDate.day = jsDate.getDate();
    newDate.dayOfWeek = jsDate.getDay();
    
    return newDate;
  }

  /**
   * Resta días a un DateOnly y retorna un nuevo DateOnly
   */
  static subtractDays(date: DateOnly, days: number): DateOnly {
    return this.addDays(date, -days);
  }

  /**
   * Convierte input HTML date (YYYY-MM-DD) a DateOnly
   */
  static htmlDateInputToDateOnly(htmlDate: string): DateOnly {
    return this.stringToDateOnly(htmlDate);
  }

  /**
   * Convierte DateOnly a formato para input HTML date (YYYY-MM-DD)
   */
  static dateOnlyToHtmlDateInput(date: DateOnly): string {
    return this.dateOnlyToString(date);
  }

  /**
   * Verifica si un DateOnly está en un rango
   */
  static isDateInRange(date: DateOnly, startRange: DateOnly, endRange: DateOnly): boolean {
    const checkDate = new Date(date.year, date.month - 1, date.day);
    const startDate = new Date(startRange.year, startRange.month - 1, startRange.day);
    const endDate = new Date(endRange.year, endRange.month - 1, endRange.day);
    
    return checkDate >= startDate && checkDate <= endDate;
  }

  /**
   * Crea un DateOnly desde Date (extrae solo la fecha)
   */
  static dateToDateOnly(date: Date): DateOnly {
    const dateOnly = new DateOnly();
    
    dateOnly.year = date.getFullYear();
    dateOnly.month = date.getMonth() + 1;
    dateOnly.day = date.getDate();
    dateOnly.dayOfWeek = date.getDay();
    
    return dateOnly;
  }

  /**
   * Combina DateOnly con TimeOnly para crear un Date completo
   */
  static combineDateTime(dateOnly: DateOnly, timeOnly: TimeOnly): Date {
    return new Date(
      dateOnly.year, 
      dateOnly.month - 1, 
      dateOnly.day, 
      timeOnly.hour, 
      timeOnly.minute, 
      timeOnly.second
    );
  }

  /**
   * Crea un Date desde DateOnly (hora 00:00:00)
   */
  static dateOnlyToDate(dateOnly: DateOnly): Date {
    return new Date(dateOnly.year, dateOnly.month - 1, dateOnly.day);
  }

  /**
   * Verifica si un DateOnly es fin de semana
   */
  static isWeekend(date: DateOnly): boolean {
    return date.dayOfWeek === DayOfWeek.Saturday || date.dayOfWeek === DayOfWeek.Sunday;
  }

  /**
   * Verifica si un DateOnly es día de semana
   */
  static isWeekday(date: DateOnly): boolean {
    return !this.isWeekend(date);
  }

  /**
   * Verifica si un DateOnly es hoy
   */
  static isToday(date: DateOnly): boolean {
    const today = this.dateToDateOnly(new Date());
    return this.isSameDate(date, today);
  }

  /**
   * Verifica si dos DateOnly son la misma fecha
   */
  static isSameDate(date1: DateOnly, date2: DateOnly): boolean {
    return date1.year === date2.year && 
           date1.month === date2.month && 
           date1.day === date2.day;
  }

  /**
   * Obtiene el primer día del mes para un DateOnly
   */
  static getFirstDayOfMonth(date: DateOnly): DateOnly {
    const firstDay = new DateOnly();
    firstDay.year = date.year;
    firstDay.month = date.month;
    firstDay.day = 1;
    firstDay.dayOfWeek = new Date(date.year, date.month - 1, 1).getDay();
    
    return firstDay;
  }

  /**
   * Obtiene el último día del mes para un DateOnly
   */
  static getLastDayOfMonth(date: DateOnly): DateOnly {
    const lastDay = new Date(date.year, date.month, 0).getDate();
    const lastDayDate = new DateOnly();
    lastDayDate.year = date.year;
    lastDayDate.month = date.month;
    lastDayDate.day = lastDay;
    lastDayDate.dayOfWeek = new Date(date.year, date.month - 1, lastDay).getDay();
    
    return lastDayDate;
  }

  /**
   * Obtiene el DateOnly de hoy
   */
  static today(): DateOnly {
    return this.dateToDateOnly(new Date());
  }

  /**
   * Obtiene el DateOnly de ayer
   */
  static yesterday(): DateOnly {
    return this.addDays(this.today(), -1);
  }

  /**
   * Obtiene el DateOnly de mañana
   */
  static tomorrow(): DateOnly {
    return this.addDays(this.today(), 1);
  }

  /**
   * Formatea DateOnly según diferentes patrones
   */
  static formatDate(date: DateOnly, format: 'iso' | 'short' | 'long' | 'weekday' = 'iso'): string {
    const jsDate = this.dateOnlyToDate(date);
    
    switch (format) {
      case 'iso':
        return this.dateOnlyToString(date); // YYYY-MM-DD
      case 'short':
        return this.dateOnlyToShortString(date); // DD/MM/YYYY
      case 'long':
        return jsDate.toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }); // 15 de enero de 2024
      case 'weekday':
        return jsDate.toLocaleDateString('es-ES', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }); // lunes, 15 de enero de 2024
      default:
        return this.dateOnlyToString(date);
    }
  }

  /**
   * Obtiene el nombre del día de la semana en español
   */
  static getDayName(date: DateOnly): string {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[date.dayOfWeek];
  }

  /**
   * Obtiene el nombre del mes en español
   */
  static getMonthName(date: DateOnly): string {
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return monthNames[date.month - 1];
  }

  /**
   * Añade meses a un DateOnly
   */
  static addMonths(date: DateOnly, months: number): DateOnly {
    const jsDate = new Date(date.year, date.month - 1, date.day);
    jsDate.setMonth(jsDate.getMonth() + months);
    
    return this.dateToDateOnly(jsDate);
  }

  /**
   * Añade años a un DateOnly
   */
  static addYears(date: DateOnly, years: number): DateOnly {
    const jsDate = new Date(date.year, date.month - 1, date.day);
    jsDate.setFullYear(jsDate.getFullYear() + years);
    
    return this.dateToDateOnly(jsDate);
  }

  /**
   * Verifica si un año es bisiesto
   */
  static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  /**
   * Obtiene el número de días en un mes específico
   */
  static getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }

  /**
   * Obtiene un array de DateOnly para un rango de fechas
   */
  static getDateRange(startDate: DateOnly, endDate: DateOnly): DateOnly[] {
    const dates: DateOnly[] = [];
    let currentDate = startDate;
    
    while (!this.isSameDate(currentDate, endDate)) {
      dates.push(currentDate);
      currentDate = this.addDays(currentDate, 1);
    }
    dates.push(endDate); // Incluir fecha final
    
    return dates;
  }

  /**
   * Compara dos DateOnly (-1 si date1 < date2, 0 si iguales, 1 si date1 > date2)
   */
  static compareDates(date1: DateOnly, date2: DateOnly): number {
    const jsDate1 = this.dateOnlyToDate(date1);
    const jsDate2 = this.dateOnlyToDate(date2);
    
    if (jsDate1 < jsDate2) return -1;
    if (jsDate1 > jsDate2) return 1;
    return 0;
  }

  /**
   * Obtiene el número de de semanna del mes de un DateOnly 
   */
  static getWeekNumber(date: DateOnly): number {
    const firstDayOfMonth = this.getFirstDayOfMonth(date);
    const firstDayOfWeek = firstDayOfMonth.dayOfWeek;
    return firstDayOfWeek;
  }
}