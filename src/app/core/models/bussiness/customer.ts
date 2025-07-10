import { ServiceModifier } from './service-modifier';

export class Customer{
    id: string;
    userId: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    photo: string | null;
    email: string | null;
    notes: string | null;
    preferredLanguage: string | null;
    isActive: boolean;
    createdAt: string; // format: date-time
    updatedAt: string; // format: date-time
    serviceModifiers: ServiceModifier[] | null;

    constructor() {
        this.id = "";
        this.userId = "";
        this.firstName = null;
        this.lastName = null;
        this.phoneNumber = null;
        this.photo = null;
        this.email = null;
        this.notes = null;
        this.preferredLanguage = null;
        this.isActive = false;
        this.createdAt = "";
        this.updatedAt = "";
        this.serviceModifiers = null;
    }
} 