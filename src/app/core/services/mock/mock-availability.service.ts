import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { StorageService } from '../shared/storage.service';
import { Availability, DateOnly, TimeOnly } from '@app/core/models/bussiness/availability';
import { CreateAvailabilityDto } from '@app/core/models/bussiness/create-dtos';
import { UpdateAvailabilityDto } from '@app/core/models/bussiness/update-dtos';

@Injectable({
    providedIn: 'root'
})
export class MockAvailabilityService {
    private readonly STORAGE_KEY = 'MOCK_AVAILABILITIES';
    private readonly DELAY_MS = 500;
    private readonly NUM_AVAILABILITIES = 20;

    constructor(private storageService: StorageService) {
        this.initializeMockData();
    }

    private initializeMockData(): void {
        const existingAvailabilities = this.storageService.get<Availability[]>(this.STORAGE_KEY);
        if (!existingAvailabilities || existingAvailabilities.length === 0) {
            const mockAvailabilities: Availability[] = [];
            const providerIds = ['1121aae0-83fa-4282-bd33-3ec76732ca5b', '72c92b4a-6322-4823-bde6-5c676458e0a6', 'ce83c035-e96b-4e7b-a5bb-6440492b6936', 'a5648398-348f-4544-8b09-7d3c2781a2cf', '3f437d11-1fea-449d-a284-8a0b7fbbca89'];
            
            for (let i = 1; i <= this.NUM_AVAILABILITIES; i++) {
                const availability = new Availability();
                availability.availabilityId = `availability-${i.toString().padStart(3, '0')}`;
                availability.providerId = providerIds[i % providerIds.length];
                
                availability.dayOfWeek = (i % 7) + 1;
                
                const startHour = 8 + (i % 10); 
                availability.startTime = new TimeOnly();
                availability.startTime.hour = startHour;
                availability.startTime.minute = (i % 4) * 15; 
                
                availability.endTime = new TimeOnly();
                availability.endTime.hour = startHour + 1 + (i % 2); 
                availability.endTime.minute = availability.startTime.minute;
                
                availability.isRecurring = true;
                
                const currentDate = new Date();
                availability.effectiveFromDate = new DateOnly();
                availability.effectiveFromDate.year = currentDate.getFullYear();
                availability.effectiveFromDate.month = currentDate.getMonth() + 1;
                availability.effectiveFromDate.day = currentDate.getDate();
                availability.effectiveFromDate.dayOfWeek = currentDate.getDay();
                
                const futureDate = new Date();
                futureDate.setMonth(futureDate.getMonth() + 6);
                availability.effectiveToDate = new DateOnly();
                availability.effectiveToDate.year = futureDate.getFullYear();
                availability.effectiveToDate.month = futureDate.getMonth() + 1;
                availability.effectiveToDate.day = futureDate.getDate();
                availability.effectiveToDate.dayOfWeek = futureDate.getDay();
                
                availability.isActive = i % 8 !== 0; 
                availability.createdAt = new Date(Date.now() - i * 6 * 60 * 60 * 1000).toISOString();
                availability.updatedAt = availability.createdAt;

                mockAvailabilities.push(availability);
            }
            this.storageService.set(this.STORAGE_KEY, mockAvailabilities);
        }
    }

    private getAvailabilitiesFromStorage(): Availability[] {
        return this.storageService.get<Availability[]>(this.STORAGE_KEY) || [];
    }

    getAvailabilities(): Observable<Availability[]> {
        const availabilities = this.getAvailabilitiesFromStorage();
        return of(availabilities).pipe(delay(this.DELAY_MS));
    }

    getAvailabilitiesByProvider(providerId: string): Observable<Availability[]> {
        const availabilities = this.getAvailabilitiesFromStorage();
        const providerAvailabilities = availabilities.filter(av => 
            av.providerId === providerId && av.isActive
        );
        return of(providerAvailabilities).pipe(delay(this.DELAY_MS));
    }

    getAvailability(id: string): Observable<Availability> {
        const availabilities = this.getAvailabilitiesFromStorage();
        const availability = availabilities.find(av => av.availabilityId === id);
        return of(availability ? availability : new Availability()).pipe(delay(this.DELAY_MS));
    }

    getAvailabilitiesByDay(dateToSearch: DateOnly): Observable<Availability[]> {
        const availabilities = this.getAvailabilitiesFromStorage();
        const dayOfWeek = dateToSearch.dayOfWeek;
        const dayAvailabilities = availabilities.filter(av => 
            av.dayOfWeek === dayOfWeek && av.isActive
        );
        return of(dayAvailabilities).pipe(delay(this.DELAY_MS));
    }

    getAvailabilitiesByWeek(dateToSearch: DateOnly): Observable<Availability[]> {
        const availabilities = this.getAvailabilitiesFromStorage();
        const weekAvailabilities = availabilities.filter(av => av.isActive);
        return of(weekAvailabilities).pipe(delay(this.DELAY_MS));
    }

    getAvailabilitiesByMonth(searchMonth: DateOnly): Observable<DateOnly[]> {
        const availabilities = this.getAvailabilitiesFromStorage();
        const monthAvailabilities = availabilities.filter(av => 
            av.effectiveFromDate.month <= searchMonth.month && 
            av.effectiveToDate.month >= searchMonth.month &&
            av.isActive
        );
        
        const uniqueDates: DateOnly[] = [];
        monthAvailabilities.forEach(av => {
            const date = new DateOnly();
            date.year = searchMonth.year;
            date.month = searchMonth.month;
            date.day = av.dayOfWeek;
            uniqueDates.push(date);
        });
        
        return of(uniqueDates).pipe(delay(this.DELAY_MS));
    }

    createAvailability(entity: CreateAvailabilityDto, providerId?: string): Observable<Availability> {
        const availabilities = this.getAvailabilitiesFromStorage();
        const newId = `availability-${(availabilities.length + 1).toString().padStart(3, '0')}`;
        
        const newAvailability = new Availability();
        newAvailability.availabilityId = newId;
        newAvailability.providerId = providerId || '1121aae0-83fa-4282-bd33-3ec76732ca5b';
        newAvailability.dayOfWeek = entity.dayOfWeek;
        newAvailability.startTime = entity.startTime;
        newAvailability.endTime = entity.endTime;
        newAvailability.isRecurring = entity.isRecurring;
        newAvailability.effectiveFromDate = entity.effectiveFromDate;
        newAvailability.effectiveToDate = entity.effectiveToDate || new DateOnly();
        newAvailability.isActive = entity.isActive;
        newAvailability.createdAt = new Date().toISOString();
        newAvailability.updatedAt = new Date().toISOString();
        
        availabilities.push(newAvailability);
        this.storageService.set(this.STORAGE_KEY, availabilities);
        return of(newAvailability).pipe(delay(this.DELAY_MS));
    }

    updateAvailability(id: string, entity: UpdateAvailabilityDto): Observable<Availability> {
        const availabilities = this.getAvailabilitiesFromStorage();
        const index = availabilities.findIndex(av => av.availabilityId === id);
        
        if (index !== -1) {
            const updatedAvailability = { ...availabilities[index] };
            
            if (entity.dayOfWeek !== undefined) updatedAvailability.dayOfWeek = entity.dayOfWeek;
            if (entity.startTime !== undefined) updatedAvailability.startTime = entity.startTime;
            if (entity.endTime !== undefined) updatedAvailability.endTime = entity.endTime;
            if (entity.isRecurring !== undefined) updatedAvailability.isRecurring = entity.isRecurring;
            if (entity.effectiveFromDate !== undefined) updatedAvailability.effectiveFromDate = entity.effectiveFromDate;
            if (entity.effectiveToDate !== undefined) updatedAvailability.effectiveToDate = entity.effectiveToDate;
            if (entity.isActive !== undefined) updatedAvailability.isActive = entity.isActive;
            
            updatedAvailability.updatedAt = new Date().toISOString();
            
            availabilities[index] = updatedAvailability;
            this.storageService.set(this.STORAGE_KEY, availabilities);
            return of(updatedAvailability).pipe(delay(this.DELAY_MS));
        }
        
        return of(new Availability()).pipe(delay(this.DELAY_MS));
    }

    deleteAvailability(id: string): Observable<void> {
        const availabilities = this.getAvailabilitiesFromStorage();
        const index = availabilities.findIndex(av => av.availabilityId === id);
        
        if (index !== -1) {
            availabilities.splice(index, 1);
            this.storageService.set(this.STORAGE_KEY, availabilities);
        } else {
        }
        
        return of(undefined).pipe(delay(this.DELAY_MS));
    }

    clearAvailabilitiesByProvider(providerId: string): Observable<number> {
        const availabilities = this.getAvailabilitiesFromStorage();
        const initialCount = availabilities.length;
        const filteredAvailabilities = availabilities.filter(av => av.providerId !== providerId);
        const deletedCount = initialCount - filteredAvailabilities.length;
        
        this.storageService.set(this.STORAGE_KEY, filteredAvailabilities);
        
        return of(deletedCount).pipe(delay(this.DELAY_MS));
    }
} 