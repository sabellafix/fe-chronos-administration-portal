import { DateOnly, TimeOnly } from './availability';
import { BookingStatus, UserRole } from './enums';

// DTOs de Actualización del Swagger Chronos

export class UpdateAvailabilityDto {
    dayOfWeek?: number; // 1-7
    startTime?: TimeOnly;
    endTime?: TimeOnly;
    isRecurring?: boolean;
    effectiveFromDate?: DateOnly;
    effectiveToDate?: DateOnly;
    isActive?: boolean;

    constructor() {
        this.dayOfWeek = undefined;
        this.startTime = undefined;
        this.endTime = undefined;
        this.isRecurring = undefined;
        this.effectiveFromDate = undefined;
        this.effectiveToDate = undefined;
        this.isActive = undefined;
    }
}

export class UpdateBlockedTimeDto {
    blockedDate?: DateOnly;
    startTime?: TimeOnly;
    endTime?: TimeOnly;
    reason?: string;
    isActive?: boolean;

    constructor() {
        this.blockedDate = undefined;
        this.startTime = undefined;
        this.endTime = undefined;
        this.reason = undefined;
        this.isActive = undefined;
    }
}

export class UpdateBookingDto {
    bookingDate?: DateOnly;
    startTime?: TimeOnly;
    endTime?: TimeOnly;
    durationMinutes?: number;
    totalPrice?: number;
    currency?: string;
    status?: BookingStatus;
    clientNotes?: string;
    providerNotes?: string;
    cancellationReason?: string;

    constructor() {
        this.bookingDate = undefined;
        this.startTime = undefined;
        this.endTime = undefined;
        this.durationMinutes = undefined;
        this.totalPrice = undefined;
        this.currency = undefined;
        this.status = undefined;
        this.clientNotes = undefined;
        this.providerNotes = undefined;
        this.cancellationReason = undefined;
    }
}

export class UpdateCategoryDto {
    name?: string;
    description?: string;
    isActive?: boolean;

    constructor() {
        this.name = undefined;
        this.description = undefined;
        this.isActive = undefined;
    }
}

export class UpdateCustomerDto {
    dateOfBirth?: DateOnly;
    gender?: string;
    preferredLanguage?: string;
    address?: string;
    isActive?: boolean;

    constructor() {
        this.dateOfBirth = undefined;
        this.gender = undefined;
        this.preferredLanguage = undefined;
        this.address = undefined;
        this.isActive = undefined;
    }
}

export class UpdateServiceDto {
    categoryId?: number;
    serviceName?: string;
    serviceDescription?: string;
    durationMinutes?: number;
    price?: number;
    currency?: string;
    isActive?: boolean;

    constructor() {
        this.categoryId = undefined;
        this.serviceName = undefined;
        this.serviceDescription = undefined;
        this.durationMinutes = undefined;
        this.price = undefined;
        this.currency = undefined;
        this.isActive = undefined;
    }
}

export class UpdateSupplierDto {
    companyName?: string;
    businessDescription?: string;
    businessAddress?: string;
    website?: string;
    businessEmail?: string;
    businessPhone?: string;
    isVerified?: boolean;
    rating?: number;
    totalReviews?: number;
    isActive?: boolean;

    constructor() {
        this.companyName = undefined;
        this.businessDescription = undefined;
        this.businessAddress = undefined;
        this.website = undefined;
        this.businessEmail = undefined;
        this.businessPhone = undefined;
        this.isVerified = undefined;
        this.rating = undefined;
        this.totalReviews = undefined;
        this.isActive = undefined;
    }
}

// DTOs de Actualización del Swagger Auth

export class UpdateUserDto {
    email?: string;
    userRole?: UserRole;
    firstName?: string;
    lastName?: string;
    phone?: string;
    isActive?: boolean;

    constructor() {
        this.email = undefined;
        this.userRole = undefined;
        this.firstName = undefined;
        this.lastName = undefined;
        this.phone = undefined;
        this.isActive = undefined;
    }
}

export class UpdatePermissionDto {
    name?: string;
    description?: string;
    resource?: string;
    action?: string;
    isActive?: boolean;

    constructor() {
        this.name = undefined;
        this.description = undefined;
        this.resource = undefined;
        this.action = undefined;
        this.isActive = undefined;
    }
} 