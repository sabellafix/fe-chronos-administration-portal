import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { StorageService } from '../shared/storage.service';
import { BlockedTime } from '@app/core/models/bussiness/blocked-time';
import { CreateBlockedTimeDto, CreateBlockedTimesDto } from '@app/core/models/bussiness/create-dtos';
import { UpdateBlockedTimeDto } from '@app/core/models/bussiness/update-dtos';
import { DateOnly, TimeOnly } from '@app/core/models/bussiness/availability';

@Injectable({
    providedIn: 'root'
})
export class MockBlockedTimeService {
    private readonly STORAGE_KEY = 'MOCK_BLOCKED_TIMES';
    private readonly DELAY_MS = 500;
    private readonly NUM_BLOCKED_TIMES = 15;

    constructor(private storageService: StorageService) {
        this.initializeMockData();
    }

    private initializeMockData(): void {
        const existingBlockedTimes = this.storageService.get<BlockedTime[]>(this.STORAGE_KEY);
        if (!existingBlockedTimes || existingBlockedTimes.length === 0) {
            const mockBlockedTimes: BlockedTime[] = [];
            const reasons = ['Vacaciones', 'Cita médica', 'Reunión importante', 'Capacitación', 'Mantenimiento', 'Evento personal'];
            const userIds = ['1121aae0-83fa-4282-bd33-3ec76732ca5b', '72c92b4a-6322-4823-bde6-5c676458e0a6', 'ce83c035-e96b-4e7b-a5bb-6440492b6936', 'a5648398-348f-4544-8b09-7d3c2781a2cf', '3f437d11-1fea-449d-a284-8a0b7fbbca89'];
            
            for (let i = 1; i <= this.NUM_BLOCKED_TIMES; i++) {
                const blockedTime = new BlockedTime();
                blockedTime.blockedTimeId = `blocked-time-${i.toString().padStart(3, '0')}`;
                blockedTime.userId = userIds[i % userIds.length];
                
                // Generar fechas futuras aleatorias
                const futureDate = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
                blockedTime.blockedDate = new DateOnly();
                blockedTime.blockedDate.year = futureDate.getFullYear();
                blockedTime.blockedDate.month = futureDate.getMonth() + 1;
                blockedTime.blockedDate.day = futureDate.getDate();
                blockedTime.blockedDate.dayOfWeek = futureDate.getDay();
                
                // Generar horarios aleatorios
                const startHour = 8 + (i % 8); // Entre 8 AM y 4 PM
                blockedTime.startTime = new TimeOnly();
                blockedTime.startTime.hour = startHour;
                blockedTime.startTime.minute = (i % 4) * 15; // 0, 15, 30, 45 minutos
                
                blockedTime.endTime = new TimeOnly();
                blockedTime.endTime.hour = startHour + 1 + (i % 3); // 1-3 horas después
                blockedTime.endTime.minute = blockedTime.startTime.minute;
                
                blockedTime.reason = reasons[i % reasons.length];
                blockedTime.isActive = i % 5 !== 0; // 80% activos
                blockedTime.createdAt = new Date(Date.now() - i * 12 * 60 * 60 * 1000).toISOString();

                mockBlockedTimes.push(blockedTime);
            }
            this.storageService.set(this.STORAGE_KEY, mockBlockedTimes);
        }
    }

    private getBlockedTimesFromStorage(): BlockedTime[] {
        return this.storageService.get<BlockedTime[]>(this.STORAGE_KEY) || [];
    }

    getBlockedTimes(): Observable<BlockedTime[]> {
        const blockedTimes = this.getBlockedTimesFromStorage();
        return of(blockedTimes).pipe(delay(this.DELAY_MS));
    }

    getBlockedTimesByUser(userId: string): Observable<BlockedTime[]> {
        const blockedTimes = this.getBlockedTimesFromStorage();
        const userBlockedTimes = blockedTimes.filter(bt => bt.userId === userId);
        return of(userBlockedTimes).pipe(delay(this.DELAY_MS));
    }

    getBlockedTime(id: string): Observable<BlockedTime> {
        const blockedTimes = this.getBlockedTimesFromStorage();
        const blockedTime = blockedTimes.find(bt => bt.blockedTimeId === id);
        return of(blockedTime ? blockedTime : new BlockedTime()).pipe(delay(this.DELAY_MS));
    }

    createBlockedTime(entity: CreateBlockedTimeDto): Observable<BlockedTime> {
        const blockedTimes = this.getBlockedTimesFromStorage();
        const newId = `blocked-time-${(blockedTimes.length + 1).toString().padStart(3, '0')}`;
        
        const newBlockedTime = new BlockedTime();
        newBlockedTime.blockedTimeId = newId;
        newBlockedTime.userId = entity.userId;
        newBlockedTime.blockedDate = entity.blockedDate;
        newBlockedTime.startTime = entity.startTime;
        newBlockedTime.endTime = entity.endTime;
        newBlockedTime.reason = entity.reason || null;
        newBlockedTime.isActive = true;
        newBlockedTime.createdAt = new Date().toISOString();
        
        blockedTimes.push(newBlockedTime);
        this.storageService.set(this.STORAGE_KEY, blockedTimes);
        return of(newBlockedTime).pipe(delay(this.DELAY_MS));
    }

    createBlockedTimes(entity: CreateBlockedTimesDto): Observable<BlockedTime[]> {
        const blockedTimes = this.getBlockedTimesFromStorage();
        const newBlockedTimes: BlockedTime[] = [];
        
        entity.blockedTimes.forEach((dto, index) => {
            const newId = `blocked-time-${(blockedTimes.length + index + 1).toString().padStart(3, '0')}`;
            
            const newBlockedTime = new BlockedTime();
            newBlockedTime.blockedTimeId = newId;
            newBlockedTime.userId = dto.userId;
            newBlockedTime.blockedDate = dto.blockedDate;
            newBlockedTime.startTime = dto.startTime;
            newBlockedTime.endTime = dto.endTime;
            newBlockedTime.reason = dto.reason || null;
            newBlockedTime.isActive = true;
            newBlockedTime.createdAt = new Date().toISOString();
            
            blockedTimes.push(newBlockedTime);
            newBlockedTimes.push(newBlockedTime);
        });
        
        this.storageService.set(this.STORAGE_KEY, blockedTimes);
        return of(newBlockedTimes).pipe(delay(this.DELAY_MS));
    }

    updateBlockedTime(id: string, entity: UpdateBlockedTimeDto): Observable<BlockedTime> {
        const blockedTimes = this.getBlockedTimesFromStorage();
        const index = blockedTimes.findIndex(bt => bt.blockedTimeId === id);
        
        if (index !== -1) {
            const updatedBlockedTime = { ...blockedTimes[index] };
            
            if (entity.blockedDate !== undefined) updatedBlockedTime.blockedDate = entity.blockedDate;
            if (entity.startTime !== undefined) updatedBlockedTime.startTime = entity.startTime;
            if (entity.endTime !== undefined) updatedBlockedTime.endTime = entity.endTime;
            if (entity.reason !== undefined) updatedBlockedTime.reason = entity.reason;
            if (entity.isActive !== undefined) updatedBlockedTime.isActive = entity.isActive;
            
            blockedTimes[index] = updatedBlockedTime;
            this.storageService.set(this.STORAGE_KEY, blockedTimes);
            return of(updatedBlockedTime).pipe(delay(this.DELAY_MS));
        }
        
        return of(new BlockedTime()).pipe(delay(this.DELAY_MS));
    }

    deleteBlockedTime(id: string): Observable<void> {
        const blockedTimes = this.getBlockedTimesFromStorage();
        const index = blockedTimes.findIndex(bt => bt.blockedTimeId === id);
        
        if (index !== -1) {
            blockedTimes.splice(index, 1);
            this.storageService.set(this.STORAGE_KEY, blockedTimes);
        }
        
        return of(undefined).pipe(delay(this.DELAY_MS));
    }
} 