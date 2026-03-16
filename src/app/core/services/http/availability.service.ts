import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { StorageKeyConst } from '@app/core/models/constants/storageKey.const';
import { StorageService } from '../shared/storage.service';
import { Availability, CreateAvailabilityDto, UpdateAvailabilityDto, DateOnly, TimeOnly } from '@app/core/models/bussiness';

@Injectable({
    providedIn: 'root'
})
export class AvailabilityService {

    apiUrl: string = environment.apiUrl;
    controller: string = "api/Availabilities";
    token: string = "";

    constructor(private http: HttpClient, private storageService: StorageService) {
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

    private timeOnlyToString(time: TimeOnly): string {
        const hour = time.hour.toString().padStart(2, '0');
        const minute = time.minute.toString().padStart(2, '0');
        const second = (time.second || 0).toString().padStart(2, '0');
        return `${hour}:${minute}:${second}`;
    }

    private dateOnlyToString(date: DateOnly): string {
        const year = date.year.toString();
        const month = date.month.toString().padStart(2, '0');
        const day = date.day.toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    private buildDateOnlyParams(paramName: string, date: DateOnly): HttpParams {
        let params = new HttpParams();
        params = params.set(`${paramName}.year`, date.year.toString());
        params = params.set(`${paramName}.month`, date.month.toString());
        params = params.set(`${paramName}.day`, date.day.toString());
        return params;
    }

    getAvailabilities(): Observable<Availability[]> {
        const url = `${this.apiUrl}/${this.controller}/get-availabilities`;
        return this.http.get<Availability[]>(url, this.getHttpOptions());
    }

    getAvailability(id: string): Observable<Availability> {
        const url = `${this.apiUrl}/${this.controller}/get-availability/${id}`;
        return this.http.get<Availability>(url, this.getHttpOptions());
    } 

    getAvailabilitiesByProvider(providerId: string): Observable<Availability[]> {
        const url = `${this.apiUrl}/${this.controller}/get-availabilities-by-provider/${providerId}`;
        return this.http.get<Availability[]>(url, this.getHttpOptions());
    }

    getAvailabilitiesByMonth(searchMonth: DateOnly): Observable<DateOnly[]> {
        const url = `${this.apiUrl}/${this.controller}/get-availabilities-by-month`;
        const params = this.buildDateOnlyParams('searchMonth', searchMonth);
        return this.http.get<DateOnly[]>(url, { ...this.getHttpOptions(), params });
    }

    getBlockedAndAvailabilitiesByMonth(searchMonth: DateOnly): Observable<DateOnly[]> {
        const url = `${this.apiUrl}/${this.controller}/get-blocked-n-availabilities-by-month`;
        const params = this.buildDateOnlyParams('searchMonth', searchMonth);
        return this.http.get<DateOnly[]>(url, { ...this.getHttpOptions(), params });
    }

    getAvailabilitiesByDay(dateToSearch: DateOnly): Observable<Availability[]> {
        const url = `${this.apiUrl}/${this.controller}/get-availabilities-by-day`;
        const params = this.buildDateOnlyParams('dateToSearch', dateToSearch);
        return this.http.get<Availability[]>(url, { ...this.getHttpOptions(), params });
    }

    getAvailabilitiesByWeek(dateToSearch: DateOnly): Observable<Availability[]> {
        const url = `${this.apiUrl}/${this.controller}/get-availabilities-by-week`;
        const params = this.buildDateOnlyParams('dateToSearch', dateToSearch);
        return this.http.get<Availability[]>(url, { ...this.getHttpOptions(), params });
    }

    create(entity: CreateAvailabilityDto): Observable<Availability> {
        const url = `${this.apiUrl}/${this.controller}/create`;
        const payload = this.transformAvailabilityDtoForApi(entity);
        return this.http.post<Availability>(url, payload, this.getHttpOptions());
    } 
  
    createAvailability(entity: CreateAvailabilityDto): Observable<Availability> {
        const url = `${this.apiUrl}/${this.controller}/create-availability`;
        const payload = this.transformAvailabilityDtoForApi(entity);
        return this.http.post<Availability>(url, payload, this.getHttpOptions());
    }

    private transformAvailabilityDtoForApi(dto: CreateAvailabilityDto): any {
        return {
            userId: dto.userId,
            dayOfWeek: dto.dayOfWeek,
            startTime: this.timeOnlyToString(dto.startTime),
            endTime: this.timeOnlyToString(dto.endTime),
            isRecurring: dto.isRecurring,
            effectiveFromDate: this.dateOnlyToString(dto.effectiveFromDate),
            effectiveToDate: dto.effectiveToDate ? this.dateOnlyToString(dto.effectiveToDate) : null,
            isActive: dto.isActive,
            reason: dto.reason
        };
    }

    private transformUpdateAvailabilityDtoForApi(dto: UpdateAvailabilityDto): any {
        const payload: any = {};
        
        if (dto.dayOfWeek !== undefined) payload.dayOfWeek = dto.dayOfWeek;
        if (dto.startTime !== undefined) payload.startTime = this.timeOnlyToString(dto.startTime);
        if (dto.endTime !== undefined) payload.endTime = this.timeOnlyToString(dto.endTime);
        if (dto.isRecurring !== undefined) payload.isRecurring = dto.isRecurring;
        if (dto.effectiveFromDate !== undefined) payload.effectiveFromDate = this.dateOnlyToString(dto.effectiveFromDate);
        if (dto.effectiveToDate !== undefined) payload.effectiveToDate = this.dateOnlyToString(dto.effectiveToDate);
        if (dto.isActive !== undefined) payload.isActive = dto.isActive;
        if (dto.reason !== undefined) payload.reason = dto.reason;
        
        return payload;
    }

    updateAvailability(id: string, entity: UpdateAvailabilityDto): Observable<Availability> {
        const url = `${this.apiUrl}/${this.controller}/update-availability/${id}`;
        const payload = this.transformUpdateAvailabilityDtoForApi(entity);
        return this.http.put<Availability>(url, payload, this.getHttpOptions());
    } 

    deleteAvailability(id: string): Observable<void> {
        const url = `${this.apiUrl}/${this.controller}/delete-availability/${id}`;
        return this.http.delete<void>(url, this.getHttpOptions());
    } 
    
} 