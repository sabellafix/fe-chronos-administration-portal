import { DateOnly, TimeOnly } from './availability';
import { BookingStatus, UserRole } from './enums';
import { ServiceModifier } from './service-modifier';

// DTOs de Actualización del Swagger Chronos

export class UpdateAvailabilityDto {
    dayOfWeek?: number; // minimum: 1, maximum: 7, nullable
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
    reason?: string; // maxLength: 255, nullable
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
    bookingDate?: string;
    startTime: string;
    endTime?: string;
    durationMinutes?: number;
    totalPrice?: number;
    currency?: string;
    status?: BookingStatus;
    clientNotes?: string;
    providerNotes?: string;
    cancellationReason?: string;

    constructor() { 
        this.bookingDate = "";
        this.startTime = "";
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

export class UpdateRolDto {
    name?: string;
    code?: string;
    description?: string;
    isActive?: boolean;

    constructor() {
        this.name = undefined;
        this.code = undefined;
        this.description = undefined;
        this.isActive = undefined;
    }
}

export class UpdateCustomerDto {
    firstName?: string;
    lastName?: string;
    preferredLanguage?: string; // maxLength: 10
    isActive?: boolean;
    phoneNumber?: string;
    email?: string; // maxLength: 500
    notes?: string;
    serviceModifiers?: ServiceModifier[];

    constructor() {
        this.firstName = undefined;
        this.lastName = undefined;
        this.preferredLanguage = undefined;
        this.isActive = undefined;
        this.phoneNumber = undefined;
        this.email = undefined;
        this.notes = undefined;
        this.serviceModifiers = undefined;
    }
}

export class UpdateServiceDto {
    categoryId?: number;
    serviceName?: string;
    serviceDescription?: string;
    durationMinutes?: number; // minimum: 1, maximum: 2147483647
    processingTime?: number; // minimum: 0, maximum: 2147483647
    price?: number; // minimum: 0
    color?: string; // maxLength: 7, minLength: 0
    currency?: string;
    isActive?: boolean;

    constructor() {
        this.categoryId = undefined;
        this.serviceName = undefined;
        this.serviceDescription = undefined;
        this.durationMinutes = undefined;
        this.processingTime = undefined;
        this.price = undefined;
        this.color = undefined;
        this.currency = undefined;
        this.isActive = undefined;
    }
}

export class UpdateHallsServicesDto {
    hallId?: string;
    categoryId?: number;
    serviceName?: string;
    serviceDescription?: string;
    durationMinutes?: number; 
    processingTime?: number; 
    price?: number; 
    color?: string; 
    currency?: string;
    isActive?: boolean;

    constructor() {
        this.hallId = undefined;
        this.categoryId = undefined;
        this.serviceName = undefined;
        this.serviceDescription = undefined;
        this.durationMinutes = undefined; 
        this.price = undefined;
        this.color = undefined;
        this.currency = undefined;
        this.isActive = undefined;
    }
}

export class UpdateServiceModifierDto {
    modifiedDurationInMinutes?: number; // minimum: 1, maximum: 2147483647

    constructor() {
        this.modifiedDurationInMinutes = undefined;
    }
}

export class UpdateSupplierDto {
    companyName?: string;
    businessDescription?: string;
    businessAddress?: string;
    website?: string;
    businessEmail?: string; // format: email
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