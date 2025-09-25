import { Category } from './category';
import { Supplier } from './supplier';

export class Service{
    id : string;
    providerId : string;
    categoryId : number;
    serviceName : string | null;
    serviceDescription : string | null;
    durationMinutes : number;
    processingTime : number;
    price : number;
    color : string | null;
    currency : string | null;
    type : string;
    isActive : boolean;
    createdAt : string; // format: date-time
    updatedAt : string; // format: date-time
    category: Category;
    provider: Supplier;

    constructor() {
        this.id = "";
        this.providerId = "";
        this.categoryId = 0;
        this.serviceName = null;
        this.serviceDescription = null;
        this.durationMinutes = 0;
        this.processingTime = 0;
        this.price = 0;
        this.color = null;
        this.currency = null;
        this.type = "";
        this.isActive = false;
        this.createdAt = "";
        this.updatedAt = "";
        this.category = new Category();
        this.provider = new Supplier();
    }
} 