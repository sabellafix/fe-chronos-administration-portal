import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StorageKeyConst } from '@app/core/models/constants/storageKey.const';
import { StorageService } from '../shared/storage.service';
import { Supplier, CreateSupplierDto, UpdateSupplierDto } from '@app/core/models/bussiness';

@Injectable({
    providedIn: 'root'
})
export class SupplierService {

    apiUrl: string = environment.apiUrl;
    controller: string = "api/suppliers";
    token: string = "";

    constructor(private http: HttpClient, private storageService: StorageService) {
        this.token = this.storageService.get(StorageKeyConst._TOKEN)!; 
     }

    private getHttpOptions() {
        return {
            headers: { Authorization: `Bearer ${this.token}` }
        };
    }

    getSuppliers(): Observable<Supplier[]> {
        const url = `${this.apiUrl}/${this.controller}/get-suppliers`;
        return this.http.get<Supplier[]>(url, this.getHttpOptions());
    }

    getSupplier(id: string): Observable<Supplier> {
        const url = `${this.apiUrl}/${this.controller}/get-supplier/${id}`;
        return this.http.get<Supplier>(url, this.getHttpOptions());
    } 
  
    createSupplier(entity: CreateSupplierDto): Observable<Supplier> {
        const url = `${this.apiUrl}/${this.controller}/create-supplier`;
        return this.http.post<Supplier>(url, entity, this.getHttpOptions());
    } 

    updateSupplier(id: string, entity: UpdateSupplierDto): Observable<Supplier> {
        const url = `${this.apiUrl}/${this.controller}/update-supplier/${id}`;
        return this.http.put<Supplier>(url, entity, this.getHttpOptions());
    } 

    deleteSupplier(id: string): Observable<void> {
        const url = `${this.apiUrl}/${this.controller}/delete-supplier/${id}`;
        return this.http.delete<void>(url, this.getHttpOptions());
    } 
    
} 