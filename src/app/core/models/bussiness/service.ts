export class Service{
    id : string;
    providerId : string;
    categoryId : number;
    serviceName : string;
    serviceDescription : string;
    durationMinutes : number;
    price : number;
    color : string;
    currency : string;
    isActive : boolean;
    createdAt : string;
    updatedAt : string;

    constructor() {
        this.id = "";
        this.providerId = "";
        this.categoryId = 0;
        this.serviceName = "";
        this.serviceDescription = "";
        this.durationMinutes = 0;
        this.price = 0;
        this.color = "";
        this.currency = "USD";
        this.isActive = false;
        this.createdAt = "";
        this.updatedAt = "";
    }
} 