import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Supplier } from '@app/core/models/bussiness/supplier';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { StorageService } from '../shared/storage.service';

@Injectable({
    providedIn: 'root'
})
export class MockSupplierService {
    private readonly STORAGE_KEY = 'MOCK_SUPPLIERS';
    private readonly DELAY_MS = 500;
    private readonly NUM_SUPPLIERS = 12;

    constructor(private storageService: StorageService) {
        this.initializeMockData();
    }

    private initializeMockData(): void {
        const existingSuppliers = this.storageService.get<Supplier[]>(this.STORAGE_KEY);
        if (!existingSuppliers || existingSuppliers.length === 0) {
            const mockSuppliers: Supplier[] = [];
            const businessTypes = ['Tecnología', 'Salud', 'Educación', 'Construcción', 'Alimentación', 'Belleza'];
            
            for (let i = 1; i <= this.NUM_SUPPLIERS; i++) {
                const supplier = new Supplier();
                supplier.id = `supplier-${i.toString().padStart(3, '0')}`;
                supplier.userId = `user-supplier-${i.toString().padStart(3, '0')}`;
                supplier.companyName = `Empresa ${businessTypes[i % businessTypes.length]} ${i}`;
                supplier.businessDescription = `Descripción del negocio de ${businessTypes[i % businessTypes.length]} número ${i}`;
                supplier.businessAddress = `Av. Comercial ${i}, Local ${i}`;
                supplier.website = `https://empresa${i}.com`;
                supplier.businessEmail = `contacto@empresa${i}.com`;
                supplier.businessPhone = `+34-9${i.toString().padStart(2, '0')}-${(i * 123).toString().padStart(6, '0')}`;
                supplier.isVerified = i % 3 === 0;
                supplier.rating = Math.round((3 + Math.random() * 2) * 10) / 10;
                supplier.totalReviews = Math.floor(Math.random() * 100) + 5;
                supplier.isActive = i % 4 !== 0;
                supplier.createdAt = new Date(Date.now() - i * 48 * 60 * 60 * 1000).toISOString();
                supplier.updatedAt = new Date(Date.now() - i * 12 * 60 * 60 * 1000).toISOString();

                mockSuppliers.push(supplier);
            }
            this.storageService.set(this.STORAGE_KEY, mockSuppliers);
        }
    }

    private getSuppliersFromStorage(): Supplier[] {
        return this.storageService.get<Supplier[]>(this.STORAGE_KEY) || [];
    }

    getSuppliers(pagination: Pagination): Observable<{ data: Supplier[], count: number }> {
        let filteredSuppliers = [...this.getSuppliersFromStorage()];
        if (pagination.filters) {
            const filters = pagination.filters.split('&');
            filters.forEach((filter: string) => {
                const [key, value] = filter.split('=');
                if (key && value) {
                    if (key === 'minRating') {
                        filteredSuppliers = filteredSuppliers.filter(supplier => 
                            supplier.rating >= parseFloat(value)
                        );
                    } else {
                        filteredSuppliers = filteredSuppliers.filter(supplier => 
                            supplier[key as keyof Supplier]?.toString() === value
                        );
                    }
                }
            });
        }

        if (pagination.sort) {
            const [field, direction] = pagination.sort.split(',');
            filteredSuppliers.sort((a, b) => {
                const aValue = a[field as keyof Supplier];
                const bValue = b[field as keyof Supplier];
                return direction === 'desc' 
                    ? bValue > aValue ? 1 : -1 
                    : aValue > bValue ? 1 : -1;
            });
        }

        const start = pagination.offset * pagination.limit;
        const end = start + pagination.limit;
        const paginatedSuppliers = filteredSuppliers.slice(start, end);

        return of({
            data: paginatedSuppliers,
            count: filteredSuppliers.length
        }).pipe(delay(this.DELAY_MS));
    }

    get(id: string): Observable<Supplier> {
        const suppliers = this.getSuppliersFromStorage();
        const supplier = suppliers.find(s => s.id === id);
        return of(supplier ? supplier : new Supplier()).pipe(delay(this.DELAY_MS));
    }

    post(entity: any): Observable<any> {
        const suppliers = this.getSuppliersFromStorage();
        const newId = `supplier-${(suppliers.length + 1).toString().padStart(3, '0')}`;
        const newSupplier = { ...entity, id: newId };
        suppliers.push(newSupplier);
        this.storageService.set(this.STORAGE_KEY, suppliers);
        return of(newSupplier).pipe(delay(this.DELAY_MS));
    }

    put(entity: any, id: string): Observable<any> {
        const suppliers = this.getSuppliersFromStorage();
        const index = suppliers.findIndex(s => s.id === id);
        if (index !== -1) {
            suppliers[index] = { ...entity, id };
            this.storageService.set(this.STORAGE_KEY, suppliers);
            return of(suppliers[index]).pipe(delay(this.DELAY_MS));
        }
        return of(entity).pipe(delay(this.DELAY_MS));
    }

    patch(entity: Partial<any>, id: string): Observable<any> {
        const suppliers = this.getSuppliersFromStorage();
        const index = suppliers.findIndex(s => s.id === id);
        if (index !== -1) {
            suppliers[index] = { ...suppliers[index], ...entity };
            this.storageService.set(this.STORAGE_KEY, suppliers);
            return of(suppliers[index]).pipe(delay(this.DELAY_MS));
        }
        return of(entity as Supplier).pipe(delay(this.DELAY_MS));
    }

    delete(id: string): Observable<any> {
        const suppliers = this.getSuppliersFromStorage();
        const index = suppliers.findIndex(s => s.id === id);
        if (index !== -1) {
            suppliers.splice(index, 1);
            this.storageService.set(this.STORAGE_KEY, suppliers);
        }
        return of({ success: true }).pipe(delay(this.DELAY_MS));
    }
} 