import { DateOnly } from './availability';

export class Customer{
    id : string;
    userId : string;
    firstName : string;
    lastName : string;
    dateOfBirth : DateOnly;
    gender : string;
    photo : string;
    preferredLanguage : string;
    address : string;
    isActive : boolean;
    createdAt : string;
    updatedAt : string;

    constructor() {
        this.id = "";
        this.userId = "";
        this.firstName = "";
        this.lastName = "";
        this.dateOfBirth = new DateOnly();
        this.gender = "";
        this.photo = "";
        this.preferredLanguage = "EN";
        this.address = "";
        this.isActive = false;
        this.createdAt = "";
        this.updatedAt = "";
    }
} 