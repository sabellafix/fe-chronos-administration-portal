import { BookingStatus } from './enums';
import { DateOnly, TimeOnly } from './availability';
import { Service } from './service';
import { Customer } from './customer';

export class BookingServiceDTO {
    bookingId: string;
    serviceId: string;
    order: number;
    durationInMinutes: number;

    constructor() {
        this.bookingId = "";
        this.serviceId = "";
        this.order = 0;
        this.durationInMinutes = 0;
    }
}

export class Booking{
    id: string;
    customerId: string;
    customer: Customer;
    supplierId: string;
    serviceId: string;
    bookingDate: DateOnly;
    startTime: TimeOnly;
    endTime: TimeOnly;
    durationMinutes: number;
    totalPrice: number;
    currency: string | null;
    status: BookingStatus;
    clientNotes: string | null;
    providerNotes: string | null;
    bookingReference: string | null;
    createdAt: string;
    updatedAt: string;
    confirmedAt: string | null;
    completedAt: string | null;
    cancelledAt: string | null;
    cancellationReason: string | null;
    bookingServices: BookingServiceDTO[] | null;
    services: Service[] | null;

    constructor() {
        this.id = "";
        this.customerId = "";
        this.customer = new Customer();
        this.supplierId = "";
        this.serviceId = "";
        this.bookingDate = new DateOnly();
        this.startTime = new TimeOnly();
        this.endTime = new TimeOnly();
        this.durationMinutes = 0;
        this.totalPrice = 0;
        this.currency = null;
        this.status = BookingStatus.Pending;
        this.clientNotes = null;
        this.providerNotes = null;
        this.bookingReference = null;
        this.createdAt = "";
        this.updatedAt = "";
        this.confirmedAt = null;
        this.completedAt = null;
        this.cancelledAt = null;
        this.cancellationReason = null;
        this.bookingServices = null;
        this.services = null;
    }
} 