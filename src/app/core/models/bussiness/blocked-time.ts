import { DateOnly, TimeOnly } from './availability';

export class BlockedTime{
    blockedTimeId: string;
    userId: string;
    blockedDate: DateOnly;
    startTime: TimeOnly;
    endTime: TimeOnly;
    reason: string | null;
    isActive: boolean;
    createdAt: string; // format: date-time

    constructor() {
        this.blockedTimeId = "";
        this.userId = "";
        this.blockedDate = new DateOnly();
        this.startTime = new TimeOnly();
        this.endTime = new TimeOnly();
        this.reason = null;
        this.isActive = false;
        this.createdAt = "";
    }
} 