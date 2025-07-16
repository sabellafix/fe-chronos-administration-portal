import { DayOfWeek } from './enums';

export class Availability{
    availabilityId: string;
    providerId: string;
    dayOfWeek: number;
    startTime: TimeOnly;
    endTime: TimeOnly;
    isRecurring: boolean;
    effectiveFromDate: DateOnly;
    effectiveToDate: DateOnly;
    isActive: boolean;
    createdAt: string; // format: date-time
    updatedAt: string; // format: date-time

    constructor() {
        this.availabilityId = "";
        this.providerId = "";
        this.dayOfWeek = 1;
        this.startTime = new TimeOnly();
        this.endTime = new TimeOnly();
        this.isRecurring = false;
        this.effectiveFromDate = new DateOnly();
        this.effectiveToDate = new DateOnly();
        this.isActive = false;
        this.createdAt = "";
        this.updatedAt = "";
    }
}

export class TimeOnly {
    hour: number;
    minute: number;
    readonly second: number;
    readonly millisecond: number;
    readonly microsecond: number;
    readonly nanosecond: number;
    readonly ticks: number;

    constructor() {
        this.hour = 0;
        this.minute = 0;
        this.second = 0;
        this.millisecond = 0;
        this.microsecond = 0;
        this.nanosecond = 0;
        this.ticks = 0;
    }
}

export class DateOnly {
    year: number;
    month: number;
    day: number;
    dayOfWeek: DayOfWeek;
    // readonly dayOfYear: number;
    // readonly dayNumber: number;

    constructor() {
        this.year = new Date().getFullYear();
        this.month = new Date().getMonth() + 1;
        this.day = new Date().getDate();
        this.dayOfWeek = new Date().getDay();
        // this.dayOfYear = 0;
        // this.dayNumber = 0;
    }
} 