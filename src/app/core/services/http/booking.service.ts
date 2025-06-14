import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StorageKeyConst } from '@app/core/models/constants/storageKey.const';
import { StorageService } from '../shared/storage.service';

@Injectable({
    providedIn: 'root'
})
export class BookingService {

    apiUrl: string = environment.apiUrl;
    controller: string = "api/chronos/bookings";
    token: string = "";
    headers : any = {};

    constructor(private http: HttpClient, private storageService: StorageService) {
        this.token = this.storageService.get(StorageKeyConst._TOKEN)!; 
        this.headers = { headers: { Authorization: `Bearer ${this.token}` } };
     }

    getBookings(): Observable<any[]> {
        const url = `${this.apiUrl}/${this.controller}/get-bookings`;
        return this.http.get<any[]>(url, this.headers) as unknown as Observable<any[]>;
    }

    getBookingsByCustomer(customerId: string): Observable<any[]> {
        const url = `${this.apiUrl}/${this.controller}/get-bookings-by-customer/${customerId}`;
        return this.http.get<any[]>(url, this.headers) as unknown as Observable<any[]>;
    }

    getBookingsBySupplier(supplierId: string): Observable<any[]> {
        const url = `${this.apiUrl}/${this.controller}/get-bookings-by-supplier/${supplierId}`;
        return this.http.get<any[]>(url, this.headers) as unknown as Observable<any[]>;
    }

    getBookingsByService(serviceId: string): Observable<any[]> {
        const url = `${this.apiUrl}/${this.controller}/get-bookings-by-service/${serviceId}`;
        return this.http.get<any[]>(url, this.headers) as unknown as Observable<any[]>;
    }

    get(id: string): Observable<any> {
        const url = `${this.apiUrl}/${this.controller}/get-booking/${id}`;
        return this.http.get<any>(url, this.headers);
    } 
  
    post(entity: any): Observable<any> {
        const url = `${this.apiUrl}/${this.controller}/create-booking`;
        return this.http.post<any>(url, entity, this.headers);
    } 

    put(entity: any, id: string): Observable<any> {
        const url = `${this.apiUrl}/${this.controller}/update-booking/${id}`;
        return this.http.put<any>(url, entity, this.headers);
    } 

    delete(id: string): Observable<any> {
        const url = `${this.apiUrl}/${this.controller}/delete-booking/${id}`;
        return this.http.delete<any>(url, this.headers);
    } 
    
} 