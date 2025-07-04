import { DateOnly, TimeOnly } from './availability';
import { UserRole } from './enums';

// DTOs de Creación del Swagger Chronos

export class CreateAvailabilityDto {
    providerId: string;
    dayOfWeek: number; // 1-7
    startTime: TimeOnly;
    endTime: TimeOnly;
    isRecurring: boolean;
    effectiveFromDate: DateOnly;
    effectiveToDate: DateOnly;

    constructor() {
        this.providerId = "";
        this.dayOfWeek = 1;
        this.startTime = new TimeOnly();
        this.endTime = new TimeOnly();
        this.isRecurring = false;
        this.effectiveFromDate = new DateOnly();
        this.effectiveToDate = new DateOnly();
    }
}

export class CreateBlockedTimeDto {
    providerId: string;
    blockedDate: DateOnly;
    startTime: TimeOnly;
    endTime: TimeOnly;
    reason: string;

    constructor() {
        this.providerId = "";
        this.blockedDate = new DateOnly();
        this.startTime = new TimeOnly();
        this.endTime = new TimeOnly();
        this.reason = "";
    }
}

export interface BookingServiceRequest {
    serviceId: string;
    order: number;
    durationInMinutes: number;
}

export class CreateBookingDto {
    customerId: string;
    serviceId: string;
    bookingDate: string; // Cambiar a string para compatibilidad con System.DateOnly
    durationMinutes?: number;
    startTime: TimeOnly;
    endTime?: TimeOnly;
    totalPrice: number;
    currency?: string;
    clientNotes?: string;
    services?: BookingServiceRequest[];

    constructor() {
        this.customerId = "";
        this.serviceId = "";
        this.bookingDate = "";
        this.durationMinutes = undefined;
        this.startTime = new TimeOnly();
        this.endTime = undefined;
        this.totalPrice = 0;
        this.currency = undefined;
        this.clientNotes = undefined;
        this.services = undefined;
    }
}

export class CreateCategoryDto {
    name: string;
    description: string;

    constructor() {
        this.name = "";
        this.description = "";
    }
}

export class CreateCustomerDto {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    preferredLanguage?: string;
    email?: string;
    notes?: string;

    constructor() {
        this.firstName = undefined;
        this.lastName = undefined;
        this.phoneNumber = undefined;
        this.preferredLanguage = undefined;
        this.email = undefined;
        this.notes = undefined;
    }
}

export class CreateServiceDto {
    providerId?: string;
    categoryId: number;
    serviceName: string;
    serviceDescription?: string;
    durationMinutes: number;
    price: number;
    color?: string;
    currency?: string;

    constructor() {
        this.providerId = undefined;
        this.categoryId = 0;
        this.serviceName = "";
        this.serviceDescription = undefined;
        this.durationMinutes = 0;
        this.price = 0;
        this.color = undefined;
        this.currency = undefined;
    }
}

export class CreateSupplierDto {
    userId: string;
    companyName: string;
    businessDescription: string;
    businessAddress: string;
    website: string;
    businessEmail: string;
    businessPhone: string;

    constructor() {
        this.userId = "";
        this.companyName = "";
        this.businessDescription = "";
        this.businessAddress = "";
        this.website = "";
        this.businessEmail = "";
        this.businessPhone = "";
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