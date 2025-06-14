import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Service } from '@app/core/models/bussiness/service';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { StorageService } from '../shared/storage.service';

@Injectable({
    providedIn: 'root'
})
export class MockPlatformServiceService {
    private readonly STORAGE_KEY = 'MOCK_PLATFORM_SERVICES';
    private readonly DELAY_MS = 500;
    private readonly NUM_SERVICES = 15;

    constructor(private storageService: StorageService) {
        this.initializeMockData();
    }

    private initializeMockData(): void {
        const existingServices = this.storageService.get<Service[]>(this.STORAGE_KEY);
        if (!existingServices || existingServices.length === 0) {
            const mockServices: Service[] = [];
            const serviceNames = ['Consultoría IT', 'Desarrollo Web', 'Diseño Gráfico', 'Marketing Digital', 'Limpieza', 'Reparaciones', 'Mantenimiento', 'Capacitación', 'Auditoría'];
            const currencies = ['USD', 'EUR', 'COP'];
            
            for (let i = 1; i <= this.NUM_SERVICES; i++) {
                const service = new Service();
                service.id = `service-${i.toString().padStart(3, '0')}`;
                service.providerId = `supplier-${((i % 12) + 1).toString().padStart(3, '0')}`;
                service.categoryId = (i % 5) + 1;
                service.serviceName = `${serviceNames[i % serviceNames.length]} ${i}`;
                service.serviceDescription = `Descripción detallada del servicio ${serviceNames[i % serviceNames.length]} número ${i}`;
                service.durationMinutes = [30, 60, 90, 120, 180][i % 5];
                service.price = Math.round((50 + Math.random() * 450) * 100) / 100;
                service.currency = currencies[i % currencies.length];
                service.isActive = i % 5 !== 0;
                service.createdAt = new Date(Date.now() - i * 72 * 60 * 60 * 1000).toISOString();
                service.updatedAt = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString();

                mockServices.push(service);
            }
            this.storageService.set(this.STORAGE_KEY, mockServices);
        }
    }

    private getServicesFromStorage(): Service[] {
        return this.storageService.get<Service[]>(this.STORAGE_KEY) || [];
    }

    getServices(pagination: Pagination): Observable<{ data: Service[], count: number }> {
        let filteredServices = [...this.getServicesFromStorage()];
        if (pagination.filters) {
            const filters = pagination.filters.split('&');
            filters.forEach((filter: string) => {
                const [key, value] = filter.split('=');
                if (key && value) {
                    if (key === 'minPrice') {
                        filteredServices = filteredServices.filter(service => 
                            service.price >= parseFloat(value)
                        );
                    } else if (key === 'maxPrice') {
                        filteredServices = filteredServices.filter(service => 
                            service.price <= parseFloat(value)
                        );
                    } else if (key === 'categoryId') {
                        filteredServices = filteredServices.filter(service => 
                            service.categoryId === parseInt(value)
                        );
                    } else {
                        filteredServices = filteredServices.filter(service => 
                            service[key as keyof Service]?.toString() === value
                        );
                    }
                }
            });
        }

        if (pagination.sort) {
            const [field, direction] = pagination.sort.split(',');
            filteredServices.sort((a, b) => {
                const aValue = a[field as keyof Service];
                const bValue = b[field as keyof Service];
                return direction === 'desc' 
                    ? bValue > aValue ? 1 : -1 
                    : aValue > bValue ? 1 : -1;
            });
        }

        const start = pagination.offset * pagination.limit;
        const end = start + pagination.limit;
        const paginatedServices = filteredServices.slice(start, end);

        return of({
            data: paginatedServices,
            count: filteredServices.length
        }).pipe(delay(this.DELAY_MS));
    }

    get(id: string): Observable<Service> {
        const services = this.getServicesFromStorage();
        const service = services.find(s => s.id === id);
        return of(service ? service : new Service()).pipe(delay(this.DELAY_MS));
    }

    post(entity: any): Observable<any> {
        const services = this.getServicesFromStorage();
        const newId = `service-${(services.length + 1).toString().padStart(3, '0')}`;
        const newService = { ...entity, id: newId };
        services.push(newService);
        this.storageService.set(this.STORAGE_KEY, services);
        return of(newService).pipe(delay(this.DELAY_MS));
    }

    put(entity: any, id: string): Observable<any> {
        const services = this.getServicesFromStorage();
        const index = services.findIndex(s => s.id === id);
        if (index !== -1) {
            services[index] = { ...entity, id };
            this.storageService.set(this.STORAGE_KEY, services);
            return of(services[index]).pipe(delay(this.DELAY_MS));
        }
        return of(entity).pipe(delay(this.DELAY_MS));
    }

    patch(entity: Partial<any>, id: string): Observable<any> {
        const services = this.getServicesFromStorage();
        const index = services.findIndex(s => s.id === id);
        if (index !== -1) {
            services[index] = { ...services[index], ...entity };
            this.storageService.set(this.STORAGE_KEY, services);
            return of(services[index]).pipe(delay(this.DELAY_MS));
        }
        return of(entity as Service).pipe(delay(this.DELAY_MS));
    }

    delete(id: string): Observable<any> {
        const services = this.getServicesFromStorage();
        const index = services.findIndex(s => s.id === id);
        if (index !== -1) {
            services.splice(index, 1);
            this.storageService.set(this.STORAGE_KEY, services);
        }
        return of({ success: true }).pipe(delay(this.DELAY_MS));
    }
} 