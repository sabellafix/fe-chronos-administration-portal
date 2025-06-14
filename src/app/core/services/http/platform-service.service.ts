import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StorageKeyConst } from '@app/core/models/constants/storageKey.const';
import { StorageService } from '../shared/storage.service';

@Injectable({
    providedIn: 'root'
})
export class PlatformServiceService {

    apiUrl: string = environment.apiUrl;
    controller: string = "api/chronos/services";
    token: string = "";
    headers : any = {};

    constructor(private http: HttpClient, private storageService: StorageService) {
        this.token = this.storageService.get(StorageKeyConst._TOKEN)!; 
        this.headers = { headers: { Authorization: `Bearer ${this.token}` } };
     }

    getServices(): Observable<any[]> {
        const url = `${this.apiUrl}/${this.controller}/get-services`;
        return this.http.get<any[]>(url, this.headers) as unknown as Observable<any[]>;
    }

    getServicesByProvider(providerId: string): Observable<any[]> {
        const url = `${this.apiUrl}/${this.controller}/get-services-by-provider/${providerId}`;
        return this.http.get<any[]>(url, this.headers) as unknown as Observable<any[]>;
    }

    getServicesByCategory(categoryId: number): Observable<any[]> {
        const url = `${this.apiUrl}/${this.controller}/get-services-by-category/${categoryId}`;
        return this.http.get<any[]>(url, this.headers) as unknown as Observable<any[]>;
    }

    get(id: string): Observable<any> {
        const url = `${this.apiUrl}/${this.controller}/get-service/${id}`;
        return this.http.get<any>(url, this.headers);
    } 
  
    post(entity: any): Observable<any> {
        const url = `${this.apiUrl}/${this.controller}/create-service`;
        return this.http.post<any>(url, entity, this.headers);
    } 

    put(entity: any, id: string): Observable<any> {
        const url = `${this.apiUrl}/${this.controller}/update-service/${id}`;
        return this.http.put<any>(url, entity, this.headers);
    } 

    delete(id: string): Observable<any> {
        const url = `${this.apiUrl}/${this.controller}/delete-service/${id}`;
        return this.http.delete<any>(url, this.headers);
    } 
    
}