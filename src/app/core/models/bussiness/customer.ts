import { DateOnly } from './availability';

export class Customer{
    id : string;
    userId : string;
    dateOfBirth : DateOnly;
    gender : string;
    preferredLanguage : string;
    address : string;
    isActive : boolean;
    createdAt : string;
    updatedAt : string;

    constructor() {
        this.id = "";
        this.userId = "";
        this.dateOfBirth = new DateOnly();
        this.gender = "";
        this.preferredLanguage = "EN";
        this.address = "";
        this.isActive = false;
        this.createdAt = "";
        this.updatedAt = "";
    }
} 