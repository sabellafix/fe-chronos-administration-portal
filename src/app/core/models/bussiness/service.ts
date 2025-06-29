import { Category } from './category';
import { Supplier } from './supplier';

export class Service{
    id : string;
    providerId : string;
    categoryId : number;
    serviceName : string | null;
    serviceDescription : string | null;
    durationMinutes : number;
    price : number;
    color : string | null;
    currency : string | null;
    isActive : boolean;
    createdAt : string;
    updatedAt : string;
    category: Category;
    provider: Supplier;

    constructor() {
        this.id = "";
        this.providerId = "";
        this.categoryId = 0;
        this.serviceName = null;
        this.serviceDescription = null;
        this.durationMinutes = 0;
        this.price = 0;
        this.color = null;
        this.currency = null;
        this.isActive = false;
        this.createdAt = "";
        this.updatedAt = "";
        this.category = new Category();
        this.provider = new Supplier();
    }
} 