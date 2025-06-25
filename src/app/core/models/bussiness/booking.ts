import { BookingStatus } from './enums';
import { DateOnly, TimeOnly } from './availability';
import { Service } from './service';
import { Customer } from './customer';

export class Booking{
    id : string;
    customerId : string;
    supplierId : string;
    serviceId : string;
    service : Service;
    customer : Customer;
    bookingDate : DateOnly;
    startTime : TimeOnly;
    endTime : TimeOnly;
    durationMinutes : number;
    totalPrice : number;
    currency : string;
    status : BookingStatus;
    clientNotes : string;
    providerNotes : string;
    bookingReference : string;
    createdAt : string;
    updatedAt : string;
    confirmedAt : string;
    completedAt : string;
    cancelledAt : string;
    cancellationReason : string;

    constructor() {
        this.id = "";
        this.customerId = "";
        this.supplierId = "";
        this.serviceId = "";
        this.service = new Service();
        this.customer = new Customer();
        this.bookingDate = new DateOnly();
        this.startTime = new TimeOnly();
        this.endTime = new TimeOnly();
        this.durationMinutes = 0;
        this.totalPrice = 0;
        this.currency = "USD";
        this.status = BookingStatus.Pending;
        this.clientNotes = "";
        this.providerNotes = "";
        this.bookingReference = "";
        this.createdAt = "";
        this.updatedAt = "";
        this.confirmedAt = "";
        this.completedAt = "";
        this.cancelledAt = "";
        this.cancellationReason = "";
    }
} 