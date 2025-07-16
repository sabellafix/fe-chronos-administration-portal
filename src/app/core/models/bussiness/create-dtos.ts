import { DateOnly, TimeOnly } from './availability';
import { UserRole } from './enums';
import { ServiceModifier } from './service-modifier';

// DTOs de Creación del Swagger Chronos

export class CreateAvailabilityDto {
    dayOfWeek: number; // 1-7 (required, min: 1, max: 7)
    startTime: TimeOnly;
    endTime: TimeOnly;
    isRecurring: boolean;
    effectiveFromDate: DateOnly;
    effectiveToDate?: DateOnly;
    isActive: boolean;

    constructor() {
        this.dayOfWeek = 1;
        this.startTime = new TimeOnly();
        this.endTime = new TimeOnly();
        this.isRecurring = false;
        this.effectiveFromDate = new DateOnly();
        this.effectiveToDate = undefined;
        this.isActive = true;
    }
}

export class CreateBlockedTimeDto {
    providerId: string; // required, format: uuid
    blockedDate: DateOnly;
    startTime: TimeOnly;
    endTime: TimeOnly;
    reason?: string; // maxLength: 255, nullable

    constructor() {
        this.providerId = "";
        this.blockedDate = new DateOnly();
        this.startTime = new TimeOnly();
        this.endTime = new TimeOnly();
        this.reason = undefined;
    }
}

export interface BookingServiceRequest {
    serviceId: string;
    name: string;
    color: string;
    order: number;
    durationInMinutes: number;
}

export class CreateBookingDto {
    customerId: string; // required, format: uuid
    serviceId: string; // required, format: uuid
    supplierId?: string; // format: uuid
    bookingDate: string;
    durationMinutes?: number;
    startTime: string;
    endTime?: string;
    totalPrice: number; // required, minimum: 0
    currency?: string;
    clientNotes?: string;
    services?: BookingServiceRequest[];

    constructor() {
        this.customerId = "";
        this.serviceId = "";
        this.supplierId = undefined;
        this.bookingDate = "";
        this.durationMinutes = undefined;
        this.startTime = "";
        this.endTime = undefined;
        this.totalPrice = 0;
        this.currency = undefined;
        this.clientNotes = undefined;
        this.services = undefined;
    }
}

export class CreateCategoryDto {
    name: string; // required, minLength: 1
    description?: string;

    constructor() {
        this.name = "";
        this.description = undefined;
    }
}

export class CreateCustomerDto {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    preferredLanguage?: string; // maxLength: 10
    email?: string; // maxLength: 500
    notes?: string;
    serviceModifiers?: ServiceModifier[];

    constructor() {
        this.firstName = undefined;
        this.lastName = undefined;
        this.phoneNumber = undefined;
        this.preferredLanguage = undefined;
        this.email = undefined;
        this.notes = undefined;
        this.serviceModifiers = undefined;
    }
}

export class CreateServiceDto {
    providerId?: string; // format: uuid
    categoryId: number; // required
    serviceName: string; // required, minLength: 1
    serviceDescription?: string;
    durationMinutes: number; // required, minimum: 1, maximum: 2147483647
    processingTime?: number; // minimum: 1, maximum: 2147483647
    price: number; // required, minimum: 0
    color?: string; // maxLength: 7, minLength: 0
    currency?: string;

    constructor() {
        this.providerId = undefined;
        this.categoryId = 0;
        this.serviceName = "";
        this.serviceDescription = undefined;
        this.durationMinutes = 0;
        this.processingTime = undefined;
        this.price = 0;
        this.color = undefined;
        this.currency = undefined;
    }
}

export class CreateServiceModifierDto {
    customerId: string; // required, format: uuid
    serviceId: string; // required, format: uuid
    modifiedDurationInMinutes: number; // required, minimum: 1, maximum: 2147483647

    constructor() {
        this.customerId = "";
        this.serviceId = "";
        this.modifiedDurationInMinutes = 0;
    }
}

export class CreateSupplierDto {
    userId: string; // required, format: uuid
    companyName?: string;
    businessDescription?: string;
    businessAddress?: string;
    website?: string;
    businessEmail?: string; // format: email
    businessPhone?: string;

    constructor() {
        this.userId = "";
        this.companyName = undefined;
        this.businessDescription = undefined;
        this.businessAddress = undefined;
        this.website = undefined;
        this.businessEmail = undefined;
        this.businessPhone = undefined;
    }
}

// DTOs de Creación del Swagger Auth

export class CreateUserDto {
    email: string;
    password: string;
    userRole: UserRole;
    firstName: string;
    lastName: string;
    phone: string;

    constructor() {
        this.email = "";
        this.password = "";
        this.userRole = UserRole.Client;
        this.firstName = "";
        this.lastName = "";
        this.phone = "";
    }
}

export class CreatePermissionDto {
    name: string;
    description: string;
    resource: string;
    action: string;

    constructor() {
        this.name = "";
        this.description = "";
        this.resource = "";
        this.action = "";
    }
}

export class LoginDto {
    email: string;
    password: string;

    constructor() {
        this.email = "";
        this.password = "";
    }
}

export class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;

    constructor() {
        this.currentPassword = "";
        this.newPassword = "";
    }
} 