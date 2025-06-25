import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Supplier } from '@app/core/models/bussiness/supplier';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { StorageService } from '../shared/storage.service';
import { Company } from '@app/core/models/bussiness/company';

@Injectable({
    providedIn: 'root'
})
export class MockCompanyService {
    private readonly STORAGE_KEY = 'MOCK_COMPANIES';
    private readonly DELAY_MS = 500;
    private readonly NUM_COMPANIES = 12;

    constructor(private storageService: StorageService) {
        this.initializeMockData();
    }

    private initializeMockData(): void {
        const existingCompanies = this.storageService.get<Company[]>(this.STORAGE_KEY);
        if (!existingCompanies || existingCompanies.length === 0) {
            const mockCompanies: Company[] = [];
            const businessTypes = ['Tecnología', 'Salud', 'Educación', 'Construcción', 'Alimentación', 'Belleza'];
            
            for (let i = 1; i <= this.NUM_COMPANIES; i++) {
                const company = new Company();
                company.id = i;
                company.companyName = `Empresa ${businessTypes[i % businessTypes.length]} ${i}`;
                company.legalName = `Empresa ${businessTypes[i % businessTypes.length]} ${i}`;
                company.industry = `Industria ${businessTypes[i % businessTypes.length]} ${i}`;
                company.headquartersAddress = `Av. Comercial ${i}, Local ${i}`;
                company.website = `https://empresa${i}.com`;
                company.email = `contacto@empresa${i}.com`;
                company.phone = `+34-9${i.toString().padStart(2, '0')}-${(i * 123).toString().padStart(6, '0')}`;
                company.contactPersonName = `Contacto ${businessTypes[i % businessTypes.length]} ${i}`;
                company.contactPersonEmail = `contacto@empresa${i}.com`;
                company.contactPersonPhone = `+34-9${i.toString().padStart(2, '0')}-${(i * 123).toString().padStart(6, '0')}`;
                company.subscriptionPlan = `Plan ${businessTypes[i % businessTypes.length]} ${i}`;
                company.subscriptionStartDate = new Date(Date.now() - i * 48 * 60 * 60 * 1000).toISOString();
                company.subscriptionEndDate = new Date(Date.now() - i * 12 * 60 * 60 * 1000).toISOString();
                company.createdAt = new Date(Date.now() - i * 48 * 60 * 60 * 1000).toISOString();
                company.updatedAt = new Date(Date.now() - i * 12 * 60 * 60 * 1000).toISOString();

                mockCompanies.push(company);
            }
            this.storageService.set(this.STORAGE_KEY, mockCompanies);
        }
    }

    private getCompaniesFromStorage(): Company[] {
        return this.storageService.get<Company[]>(this.STORAGE_KEY) || [];
    }

    getCompanies(pagination: Pagination): Observable<{ data: Company[], count: number }> {
        let filteredCompanies = [...this.getCompaniesFromStorage()];
        if (pagination.filters) {
            const filters = pagination.filters.split('&');
            filters.forEach((filter: string) => {
                const [key, value] = filter.split('=');
                if (key && value) {
                    if (key === 'subscriptionPlan') {
                        filteredCompanies = filteredCompanies.filter(company => 
                            company.subscriptionPlan === value
                        );
                    } else {
                        filteredCompanies = filteredCompanies.filter(company => 
                            company[key as keyof Company]?.toString() === value
                        );
                    }
                }
            });
        }

        if (pagination.sort) {
            const [field, direction] = pagination.sort.split(',');
            filteredCompanies.sort((a, b) => {
                const aValue = a[field as keyof Company];
                const bValue = b[field as keyof Company];
                return direction === 'desc' 
                    ? bValue > aValue ? 1 : -1 
                    : aValue > bValue ? 1 : -1;
            });
        }

        const start = pagination.offset * pagination.limit;
        const end = start + pagination.limit;
        const paginatedCompanies = filteredCompanies.slice(start, end);

        return of({
            data: paginatedCompanies,
            count: filteredCompanies.length
        }).pipe(delay(this.DELAY_MS));
    }

    get(id: number): Observable<Company> {
        const companies = this.getCompaniesFromStorage();
        const company = companies.find(c => c.id === id);
        return of(company ? company : new Company()).pipe(delay(this.DELAY_MS));
    }

    post(entity: any): Observable<any> {
        const companies = this.getCompaniesFromStorage();
        const newId = `company-${(companies.length + 1).toString().padStart(3, '0')}`;
        const newCompany = { ...entity, id: newId };
        companies.push(newCompany);
        this.storageService.set(this.STORAGE_KEY, companies);
        return of(newCompany).pipe(delay(this.DELAY_MS));
    }

    put(entity: any, id: number): Observable<any> {
        const companies = this.getCompaniesFromStorage();
        const index = companies.findIndex(c => c.id === id);
        if (index !== -1) {
            companies[index] = { ...entity, id };
            this.storageService.set(this.STORAGE_KEY, companies);
            return of(companies[index]).pipe(delay(this.DELAY_MS));
        }
        return of(entity).pipe(delay(this.DELAY_MS));
    }

    patch(entity: Partial<any>, id: number): Observable<any> {
        const companies = this.getCompaniesFromStorage();
        const index = companies.findIndex(c => c.id === id);
        if (index !== -1) {
            companies[index] = { ...companies[index], ...entity };
            this.storageService.set(this.STORAGE_KEY, companies);
            return of(companies[index]).pipe(delay(this.DELAY_MS));
        }
        return of(entity as Supplier).pipe(delay(this.DELAY_MS));
    }

    delete(id: number): Observable<any> {
        const companies = this.getCompaniesFromStorage();
        const index = companies.findIndex(c => c.id === id);
        if (index !== -1) {
            companies.splice(index, 1);
            this.storageService.set(this.STORAGE_KEY, companies);
        }
        return of({ success: true }).pipe(delay(this.DELAY_MS));
    }
} 