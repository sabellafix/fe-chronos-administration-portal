import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StorageKeyConst } from '@app/core/models/constants/storageKey.const';
import { StorageService } from '../shared/storage.service';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@app/core/models/bussiness';

@Injectable({
    providedIn: 'root'
})
export class CategoryService {

    apiUrl: string = environment.apiUrl;
    controller: string = "api/chronos/categories";
    token: string = "";

    constructor(private http: HttpClient, private storageService: StorageService) {
        this.token = this.storageService.get(StorageKeyConst._TOKEN)!; 
     }

    private getHttpOptions() {
        return {
            headers: { Authorization: `Bearer ${this.token}` }
        };
    }

    getCategories(): Observable<Category[]> {
        const url = `${this.apiUrl}/${this.controller}/get-categories`;
        return this.http.get<Category[]>(url, this.getHttpOptions());
    }

    getCategory(id: number): Observable<Category> {
        const url = `${this.apiUrl}/${this.controller}/get-category/${id}`;
        return this.http.get<Category>(url, this.getHttpOptions());
    } 
  
    createCategory(entity: CreateCategoryDto): Observable<Category> {
        const url = `${this.apiUrl}/${this.controller}/create-category`;
        return this.http.post<Category>(url, entity, this.getHttpOptions());
    } 

    updateCategory(id: number, entity: UpdateCategoryDto): Observable<Category> {
        const url = `${this.apiUrl}/${this.controller}/update-category/${id}`;
        return this.http.put<Category>(url, entity, this.getHttpOptions());
    } 

    deleteCategory(id: number): Observable<void> {
        const url = `${this.apiUrl}/${this.controller}/delete-category/${id}`;
        return this.http.delete<void>(url, this.getHttpOptions());
    } 
    
} 