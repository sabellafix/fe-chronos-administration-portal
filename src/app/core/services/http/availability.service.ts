import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StorageKeyConst } from '@app/core/models/constants/storageKey.const';
import { StorageService } from '../shared/storage.service';
import { Availability, CreateAvailabilityDto, UpdateAvailabilityDto } from '@app/core/models/bussiness';

@Injectable({
    providedIn: 'root'
})
export class AvailabilityService {

    apiUrl: string = environment.apiUrl;
    controller: string = "api/chronos/availabilities";
    token: string = "";

    constructor(private http: HttpClient, private storageService: StorageService) {
        this.token = this.storageService.get(StorageKeyConst._TOKEN)!; 
     }

    private getHttpOptions() {
        return {
            headers: { Authorization: `Bearer ${this.token}` }
        };
    }

    getAvailabilities(): Observable<Availability[]> {
        const url = `${this.apiUrl}/${this.controller}/get-availabilities`;
        return this.http.get<Availability[]>(url, this.getHttpOptions());
    }

    getAvailabilitiesByProvider(providerId: string): Observable<Availability[]> {
        const url = `${this.apiUrl}/${this.controller}/get-availabilities-by-provider/${providerId}`;
        return this.http.get<Availability[]>(url, this.getHttpOptions());
    }

    getAvailability(id: string): Observable<Availability> {
        const url = `${this.apiUrl}/${this.controller}/get-availability/${id}`;
        return this.http.get<Availability>(url, this.getHttpOptions());
    } 
  
    createAvailability(entity: CreateAvailabilityDto): Observable<Availability> {
        const url = `${this.apiUrl}/${this.controller}/create-availability`;
        return this.http.post<Availability>(url, entity, this.getHttpOptions());
    } 

    updateAvailability(id: string, entity: UpdateAvailabilityDto): Observable<Availability> {
        const url = `${this.apiUrl}/${this.controller}/update-availability/${id}`;
        return this.http.put<Availability>(url, entity, this.getHttpOptions());
    } 

    deleteAvailability(id: string): Observable<void> {
        const url = `${this.apiUrl}/${this.controller}/delete-availability/${id}`;
        return this.http.delete<void>(url, this.getHttpOptions());
    } 
    
} 