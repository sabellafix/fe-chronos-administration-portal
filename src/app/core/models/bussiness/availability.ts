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
    createdAt: string;
    updatedAt: string;

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

    constructor() {
        this.hour = 0;
        this.minute = 0;
    }
}

export class DateOnly {
    year: number;
    month: number;
    day: number;

    constructor() {
        this.year = new Date().getFullYear();
        this.month = new Date().getMonth() + 1;
        this.day = new Date().getDate();
    }
} 