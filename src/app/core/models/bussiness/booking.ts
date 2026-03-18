import { BookingStatus } from './enums';
import { DateOnly, TimeOnly } from './availability';
import { Service } from './service';
import { Customer } from './customer';
import { User } from './user';

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

export type BookingSearchField = 
    | 'bookingReference' 
    | 'customer.firstName' 
    | 'customer.lastName' 
    | 'customer.phoneNumber';

export type BookingStatusFilter = 
    | 'pending' 
    | 'confirmed' 
    | 'inProgress' 
    | 'completed' 
    | 'cancelled' 
    | 'noShow';


export type SortOrder = 'asc' | 'desc';

export type BookingSortField = 
    | 'bookingDate' 
    | 'startTime' 
    | 'status' 
    | 'totalPrice' 
    | 'durationMinutes' 
    | 'bookingReference' 
    | 'customer.lastName' 
    | 'user.lastName' 
    | 'createdAt';

export interface QueryBookingsParams {
    search?: string;
    searchField?: BookingSearchField;
    
    status?: BookingStatusFilter;
    
    dateFrom?: string;
    dateTo?: string;
    
    supplierId?: string;
    serviceId?: string;
    customerId?: string;
    salonId?: string;
    
    page?: number;
    pageSize?: number;
    
    sortBy?: BookingSortField;
    sortOrder?: SortOrder;
    
    includeCount?: boolean;
}


export interface PaginationInfo {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface BookingQueryResponse {
    data: Booking[];
    pagination?: PaginationInfo;
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
    user: User;

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
        this.user = new User(); 
    }
} 