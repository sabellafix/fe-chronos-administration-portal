import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Customer } from '@app/core/models/bussiness/customer';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { StorageService } from '../shared/storage.service';

@Injectable({
    providedIn: 'root'
})
export class MockCustomerService {
    private readonly STORAGE_KEY = 'MOCK_CUSTOMERS';
    private readonly DELAY_MS = 500;
    private readonly NUM_CUSTOMERS = 10;

    constructor(private storageService: StorageService) {
        this.initializeMockData();
    }

    private initializeMockData(): void {
        const existingCustomers = this.storageService.get<Customer[]>(this.STORAGE_KEY);
        if (!existingCustomers || existingCustomers.length === 0) {
            const mockCustomers: Customer[] = [];
            for (let i = 1; i <= this.NUM_CUSTOMERS; i++) {
                const customer = new Customer();
                customer.id = `customer-${i.toString().padStart(3, '0')}`;
                customer.userId = `user-${i.toString().padStart(3, '0')}`;
                customer.dateOfBirth = `199${i % 10}-0${(i % 12) + 1}-${(i % 28) + 1}`;
                customer.gender = ['Male', 'Female', 'Other'][i % 3];
                customer.preferredLanguage = ['EN', 'ES', 'FR'][i % 3];
                customer.address = `Calle Customer ${i}, Ciudad ${i}`;
                customer.isActive = i % 2 === 0;
                customer.createdAt = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString();
                customer.updatedAt = new Date().toISOString();

                mockCustomers.push(customer);
            }
            this.storageService.set(this.STORAGE_KEY, mockCustomers);
        }
    }

    private getCustomersFromStorage(): Customer[] {
        return this.storageService.get<Customer[]>(this.STORAGE_KEY) || [];
    }

    getCustomers(pagination: Pagination): Observable<{ data: Customer[], count: number }> {
        let filteredCustomers = [...this.getCustomersFromStorage()];
        if (pagination.filters) {
            const filters = pagination.filters.split('&');
            filters.forEach((filter: string) => {
                const [key, value] = filter.split('=');
                if (key && value) {
                    filteredCustomers = filteredCustomers.filter(customer => 
                        customer[key as keyof Customer]?.toString() === value
                    );
                }
            });
        }

        if (pagination.sort) {
            const [field, direction] = pagination.sort.split(',');
            filteredCustomers.sort((a, b) => {
                const aValue = a[field as keyof Customer];
                const bValue = b[field as keyof Customer];
                return direction === 'desc' 
                    ? bValue > aValue ? 1 : -1 
                    : aValue > bValue ? 1 : -1;
            });
        }

        const start = pagination.offset * pagination.limit;
        const end = start + pagination.limit;
        const paginatedCustomers = filteredCustomers.slice(start, end);

        return of({
            data: paginatedCustomers,
            count: filteredCustomers.length
        }).pipe(delay(this.DELAY_MS));
    }

    get(id: string): Observable<Customer> {
        const customers = this.getCustomersFromStorage();
        const customer = customers.find(c => c.id === id);
        return of(customer ? customer : new Customer()).pipe(delay(this.DELAY_MS));
    }

    post(entity: any): Observable<any> {
        const customers = this.getCustomersFromStorage();
        const newId = `customer-${(customers.length + 1).toString().padStart(3, '0')}`;
        const newCustomer = { ...entity, id: newId };
        customers.push(newCustomer);
        this.storageService.set(this.STORAGE_KEY, customers);
        return of(newCustomer).pipe(delay(this.DELAY_MS));
    }

    put(entity: any, id: string): Observable<any> {
        const customers = this.getCustomersFromStorage();
        const index = customers.findIndex(c => c.id === id);
        if (index !== -1) {
            customers[index] = { ...entity, id };
            this.storageService.set(this.STORAGE_KEY, customers);
            return of(customers[index]).pipe(delay(this.DELAY_MS));
        }
        return of(entity).pipe(delay(this.DELAY_MS));
    }

    patch(entity: Partial<any>, id: string): Observable<any> {
        const customers = this.getCustomersFromStorage();
        const index = customers.findIndex(c => c.id === id);
        if (index !== -1) {
            customers[index] = { ...customers[index], ...entity };
            this.storageService.set(this.STORAGE_KEY, customers);
            return of(customers[index]).pipe(delay(this.DELAY_MS));
        }
        return of(entity as Customer).pipe(delay(this.DELAY_MS));
    }

    delete(id: string): Observable<any> {
        const customers = this.getCustomersFromStorage();
        const index = customers.findIndex(c => c.id === id);
        if (index !== -1) {
            customers.splice(index, 1);
            this.storageService.set(this.STORAGE_KEY, customers);
        }
        return of({ success: true }).pipe(delay(this.DELAY_MS));
    }
} 