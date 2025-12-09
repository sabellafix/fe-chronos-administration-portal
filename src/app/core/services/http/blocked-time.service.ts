import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StorageKeyConst } from '@app/core/models/constants/storageKey.const';
import { StorageService } from '../shared/storage.service';
import { BlockedTime, CreateBlockedTimeDto, CreateBlockedTimesDto, UpdateBlockedTimeDto } from '@app/core/models/bussiness';

@Injectable({
    providedIn: 'root'
})
export class BlockedTimeService {

    apiUrl: string = environment.apiUrl;
    controller: string = "api/blocked-times";
    token: string = "";

    constructor(private http: HttpClient, private storageService: StorageService) {
        this.token = this.storageService.get(StorageKeyConst._TOKEN)!; 
     }

    private getHttpOptions() {
        return {
            headers: { Authorization: `Bearer ${this.token}` }
        };
    }

    getBlockedTimes(): Observable<BlockedTime[]> {
        const url = `${this.apiUrl}/${this.controller}/get-blocked-times`;
        return this.http.get<BlockedTime[]>(url, this.getHttpOptions());
    }

    getBlockedTimesByProvider(providerId: string): Observable<BlockedTime[]> {
        const url = `${this.apiUrl}/${this.controller}/get-blocked-times-by-provider/${providerId}`;
        return this.http.get<BlockedTime[]>(url, this.getHttpOptions());
    }

    getBlockedTime(id: string): Observable<BlockedTime> {
        const url = `${this.apiUrl}/${this.controller}/get-blocked-time/${id}`;
        return this.http.get<BlockedTime>(url, this.getHttpOptions());
    } 
  
    createBlockedTime(entity: CreateBlockedTimeDto): Observable<BlockedTime> {
        const url = `${this.apiUrl}/${this.controller}/create-blocked-time`;
        return this.http.post<BlockedTime>(url, entity, this.getHttpOptions());
    } 

    createBlockedTimes(entity: CreateBlockedTimesDto): Observable<BlockedTime> {
        const url = `${this.apiUrl}/${this.controller}/create-blocked-times`;
        return this.http.post<BlockedTime>(url, entity, this.getHttpOptions());
    } 

    updateBlockedTime(id: string, entity: UpdateBlockedTimeDto): Observable<BlockedTime> {
        const url = `${this.apiUrl}/${this.controller}/update-blocked-times/${id}`;
        return this.http.put<BlockedTime>(url, entity, this.getHttpOptions());
    } 

    deleteBlockedTime(id: string): Observable<void> {
        const url = `${this.apiUrl}/${this.controller}/delete-blocked-time/${id}`;
        return this.http.delete<void>(url, this.getHttpOptions());
    } 
    
} 