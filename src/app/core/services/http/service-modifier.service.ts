import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StorageKeyConst } from '@app/core/models/constants/storageKey.const';
import { StorageService } from '../shared/storage.service';
import { ServiceModifier, CreateServiceModifierDto, UpdateServiceModifierDto } from '@app/core/models/bussiness';

@Injectable({
    providedIn: 'root'
})
export class ServiceModifierService {

    apiUrl: string = environment.apiUrl;
    controller: string = "api/service-modifiers";
    token: string = "";

    constructor(private http: HttpClient, private storageService: StorageService) {
        this.token = this.storageService.get(StorageKeyConst._TOKEN)!; 
     }

    private getHttpOptions() {
        return {
            headers: { Authorization: `Bearer ${this.token}` }
        };
    }

    getServiceModifiers(): Observable<ServiceModifier[]> {
        const url = `${this.apiUrl}/${this.controller}/get-service-modifiers`;
        return this.http.get<ServiceModifier[]>(url, this.getHttpOptions());
    }

    getServiceModifier(customerId: string, serviceId: string): Observable<ServiceModifier> {
        const url = `${this.apiUrl}/${this.controller}/get-service-modifier/${customerId}/${serviceId}`;
        return this.http.get<ServiceModifier>(url, this.getHttpOptions());
    }

    getServiceModifiersByCustomer(customerId: string): Observable<ServiceModifier[]> {
        const url = `${this.apiUrl}/${this.controller}/get-service-modifiers-by-customer/${customerId}`;
        return this.http.get<ServiceModifier[]>(url, this.getHttpOptions());
    }

    getServiceModifiersByService(serviceId: string): Observable<ServiceModifier[]> {
        const url = `${this.apiUrl}/${this.controller}/get-service-modifiers-by-service/${serviceId}`;
        return this.http.get<ServiceModifier[]>(url, this.getHttpOptions());
    }
  
    createServiceModifier(entity: CreateServiceModifierDto): Observable<ServiceModifier> {
        const url = `${this.apiUrl}/${this.controller}/create-service-modifier`;
        return this.http.post<ServiceModifier>(url, entity, this.getHttpOptions());
    } 

    updateServiceModifier(customerId: string, serviceId: string, entity: UpdateServiceModifierDto): Observable<ServiceModifier> {
        const url = `${this.apiUrl}/${this.controller}/update-service-modifier/${customerId}/${serviceId}`;
        return this.http.put<ServiceModifier>(url, entity, this.getHttpOptions());
    } 

    deleteServiceModifier(customerId: string, serviceId: string): Observable<void> {
        const url = `${this.apiUrl}/${this.controller}/delete-service-modifier/${customerId}/${serviceId}`;
        return this.http.delete<void>(url, this.getHttpOptions());
    } 
    
} 