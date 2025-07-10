import { Customer } from './customer';
import { Service } from './service';

export class ServiceModifier {
    customerId: string;
    serviceId: string;
    modifiedDurationInMinutes: number;
    customer: Customer | null;
    service: Service | null;

    constructor() {
        this.customerId = "";
        this.serviceId = "";
        this.modifiedDurationInMinutes = 0;
        this.customer = null;
        this.service = null;
    }
} 