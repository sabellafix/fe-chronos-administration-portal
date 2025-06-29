import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StorageKeyConst } from '@app/core/models/constants/storageKey.const';
import { StorageService } from '../shared/storage.service';
import { Customer, CreateCustomerDto, UpdateCustomerDto } from '@app/core/models/bussiness';

@Injectable({
    providedIn: 'root'
})
export class CustomerService {

    apiUrl: string = environment.apiUrl;
    controller: string = "api/chronos/customers";
    token: string = "";

    constructor(private http: HttpClient, private storageService: StorageService) {
        this.token = this.storageService.get(StorageKeyConst._TOKEN)!; 
     }

    private getHttpOptions() {
        return {
            headers: { Authorization: `Bearer ${this.token}` }
        };
    }

    getAllCustomers(): Observable<Customer[]> {
        const url = `${this.apiUrl}/${this.controller}/get-all-customers`;
        return this.http.get<Customer[]>(url, this.getHttpOptions());
    }

    getCustomers(): Observable<Customer[]> {
        const url = `${this.apiUrl}/${this.controller}/get-customers`;
        return this.http.get<Customer[]>(url, this.getHttpOptions());
    }

    getCustomer(id: string): Observable<Customer> {
        const url = `${this.apiUrl}/${this.controller}/get-customer/${id}`;
        return this.http.get<Customer>(url, this.getHttpOptions());
    } 
  
    createCustomer(entity: CreateCustomerDto): Observable<Customer> {
        const url = `${this.apiUrl}/${this.controller}/create-customer`;
        return this.http.post<Customer>(url, entity, this.getHttpOptions());
    } 

    updateCustomer(id: string, entity: UpdateCustomerDto): Observable<Customer> {
        const url = `${this.apiUrl}/${this.controller}/update-customer/${id}`;
        return this.http.put<Customer>(url, entity, this.getHttpOptions());
    } 

    deleteCustomer(id: string): Observable<void> {
        const url = `${this.apiUrl}/${this.controller}/delete-customer/${id}`;
        return this.http.delete<void>(url, this.getHttpOptions());
    } 
    
}