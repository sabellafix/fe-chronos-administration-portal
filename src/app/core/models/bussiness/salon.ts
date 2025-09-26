import { Booking } from "./booking";
import { Company } from "./company";
import { Service } from "./service";

export class Salon{

    id : string;
    companyId : string;
    name : string;
    description : string;
    capacity : number;
    address : string;
    city : string;
    state : string;
    country : string;
    zipCode : string;
    isActive : boolean;
    createdAt : Date;
    updatedAt : Date;
    company : Company;
    bookings : Booking[];
    services : Service[];

    constructor() {
        this.id = "";
        this.companyId = "";
        this.name = "";
        this.description = "";
        this.capacity = 0;
        this.address = "";
        this.city = "";
        this.state = "";
        this.country = "";
        this.zipCode = "";
        this.isActive = false;
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.company = new Company();
        this.bookings = [];
        this.services = [];
    }

}