import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StorageKeyConst } from '@app/core/models/constants/storageKey.const';
import { StorageService as StorageServiceLocal } from '../shared/storage.service';
import { Service, CreateServiceDto, UpdateServiceDto } from '@app/core/models/bussiness';

@Injectable({
    providedIn: 'root'
})
export class ServiceService {

    apiUrl: string = environment.apiUrl;
    controller: string = "api/services";
    token: string = "";

    constructor(private http: HttpClient, private storageService: StorageServiceLocal) {
        this.refreshToken();
     }

    refreshToken(): void {
        this.token = this.storageService.get(StorageKeyConst._TOKEN) || '';
    }

    private getHttpOptions() {
        return {
            headers: { Authorization: `Bearer ${this.token}` }
        };
    }

    getAllServices(): Observable<Service[]> {
        const url = `${this.apiUrl}/${this.controller}/get-all-services`;
        return this.http.get<Service[]>(url, this.getHttpOptions());
    }

    getServices(): Observable<Service[]> {
        const url = `${this.apiUrl}/${this.controller}/get-services`;
        return this.http.get<Service[]>(url, this.getHttpOptions());
    }

    getService(id: string): Observable<Service> {
        const url = `${this.apiUrl}/${this.controller}/get-service/${id}`;
        return this.http.get<Service>(url, this.getHttpOptions());
    }

    getServicesByCategory(categoryId: number): Observable<Service[]> {
        const url = `${this.apiUrl}/${this.controller}/get-services-by-category/${categoryId}`;
        return this.http.get<Service[]>(url, this.getHttpOptions());
    }

    getServicesByProvider(providerId: string): Observable<Service[]> {
        const url = `${this.apiUrl}/${this.controller}/get-services-by-provider/${providerId}`;
        return this.http.get<Service[]>(url, this.getHttpOptions());
    }

    getServicesBySalon(salonId: string): Observable<Service[]> {
        const url = `${this.apiUrl}/${this.controller}/get-services-by-salon/${salonId}`;
        return this.http.get<Service[]>(url, this.getHttpOptions());
    }
  
    createService(entity: CreateServiceDto): Observable<Service> {
        const url = `${this.apiUrl}/${this.controller}/create-service`;
        return this.http.post<Service>(url, entity, this.getHttpOptions());
    } 

    create(entity: CreateServiceDto): Observable<Service> {
        const url = `${this.apiUrl}/${this.controller}/create`;
        return this.http.post<Service>(url, entity, this.getHttpOptions());
    } 

    createUserServices(userId: string): Observable<Service[]> {
        const url = `${this.apiUrl}/${this.controller}/create-user-services/${userId}`;
        return this.http.post<Service[]>(url, {}, this.getHttpOptions());
    }

    updateService(id: string, entity: UpdateServiceDto): Observable<Service> {
        const url = `${this.apiUrl}/${this.controller}/update-service/${id}`;
        return this.http.put<Service>(url, entity, this.getHttpOptions());
    } 

    deleteService(id: string): Observable<void> {
        const url = `${this.apiUrl}/${this.controller}/delete-service/${id}`;
        return this.http.delete<void>(url, this.getHttpOptions());
    } 
    
}