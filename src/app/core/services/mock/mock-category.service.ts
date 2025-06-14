import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Supplier } from '@app/core/models/bussiness/supplier';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { StorageService } from '../shared/storage.service';
import { Category } from '@app/core/models/bussiness/category';

@Injectable({
    providedIn: 'root'
})
export class MockCategoryService {
    private readonly STORAGE_KEY = 'MOCK_CATEGORIES';
    private readonly DELAY_MS = 500;
    private readonly NUM_CATEGORIES = 12;

    constructor(private storageService: StorageService) {
        this.initializeMockData();
    }

    private initializeMockData(): void {
        const existingCategories = this.storageService.get<Category[]>(this.STORAGE_KEY);
        if (!existingCategories || existingCategories.length === 0) {
            const mockCategories: Category[] = [];
            const businessTypes = ['Tecnología', 'Salud', 'Educación', 'Construcción', 'Alimentación', 'Belleza'];
            
            for (let i = 1; i <= this.NUM_CATEGORIES; i++) {
                const category = new Category();
                category.id = `category-${i.toString().padStart(3, '0')}`;
                category.name = `Category ${i}`;
                category.description = `Descripción de la categoría ${i}`;
                category.isActive = i % 4 !== 0;
                category.createdAt = new Date(Date.now() - i * 48 * 60 * 60 * 1000).toISOString();

                mockCategories.push(category);
            }
            this.storageService.set(this.STORAGE_KEY, mockCategories);
        }
    }

    private getCategoriesFromStorage(): Category[] {
        return this.storageService.get<Category[]>(this.STORAGE_KEY) || [];
    }

    getCategories(pagination: Pagination): Observable<{ data: Category[], count: number }> {
        let filteredCategories = [...this.getCategoriesFromStorage()];
        if (pagination.filters) {
            const filters = pagination.filters.split('&');
            filters.forEach((filter: string) => {
                const [key, value] = filter.split('=');
                if (key && value) {
                    filteredCategories = filteredCategories.filter(category => 
                        category[key as keyof Category]?.toString() === value
                    );
                }
            });
        }

        if (pagination.sort) {
            const [field, direction] = pagination.sort.split(',');
            filteredCategories.sort((a, b) => {
                const aValue = a[field as keyof Category];
                const bValue = b[field as keyof Category];
                return direction === 'desc' 
                    ? bValue > aValue ? 1 : -1 
                    : aValue > bValue ? 1 : -1;
            });
        }

        const start = pagination.offset * pagination.limit;
        const end = start + pagination.limit;
        const paginatedCategories = filteredCategories.slice(start, end);

        return of({
            data: paginatedCategories,
            count: filteredCategories.length
        }).pipe(delay(this.DELAY_MS));
    }

    get(id: string): Observable<Category> {
        const categories = this.getCategoriesFromStorage();
        const category = categories.find(c => c.id === id);
        return of(category ? category : new Category()).pipe(delay(this.DELAY_MS));
    }

    post(entity: any): Observable<any> {
        const categories = this.getCategoriesFromStorage();
        const newId = `category-${(categories.length + 1).toString().padStart(3, '0')}`;
        const newCategory = { ...entity, id: newId };
        categories.push(newCategory);
        this.storageService.set(this.STORAGE_KEY, categories);
        return of(newCategory).pipe(delay(this.DELAY_MS));
    }

    put(entity: any, id: string): Observable<any> {
        const categories = this.getCategoriesFromStorage();
        const index = categories.findIndex(c => c.id === id);
        if (index !== -1) {
            categories[index] = { ...entity, id };
            this.storageService.set(this.STORAGE_KEY, categories);
            return of(categories[index]).pipe(delay(this.DELAY_MS));
        }
        return of(entity).pipe(delay(this.DELAY_MS));
    }

    patch(entity: Partial<any>, id: string): Observable<any> {
        const categories = this.getCategoriesFromStorage();
        const index = categories.findIndex(c => c.id === id);
        if (index !== -1) {
            categories[index] = { ...categories[index], ...entity };
            this.storageService.set(this.STORAGE_KEY, categories);
            return of(categories[index]).pipe(delay(this.DELAY_MS));
        }
        return of(entity as Supplier).pipe(delay(this.DELAY_MS));
    }

    delete(id: string): Observable<any> {
        const categories = this.getCategoriesFromStorage();
        const index = categories.findIndex(c => c.id === id);
        if (index !== -1) {
            categories.splice(index, 1);
            this.storageService.set(this.STORAGE_KEY, categories);
        }
        return of({ success: true }).pipe(delay(this.DELAY_MS));
    }
} 