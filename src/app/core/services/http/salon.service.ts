import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StorageKeyConst } from '@app/core/models/constants/storageKey.const';
import { StorageService } from '../shared/storage.service';
import { Salon, CreateSalonDto, UpdateSalonDto } from '@app/core/models/bussiness';

@Injectable({
    providedIn: 'root'
})
export class CategoryService {

    apiUrl: string = environment.apiUrl;
    controller: string = "api/chronos/salons";
    token: string = "";

    constructor(private http: HttpClient, private storageService: StorageService) {
        this.token = this.storageService.get(StorageKeyConst._TOKEN)!; 
     }

    private getHttpOptions() {
        return {
            headers: { Authorization: `Bearer ${this.token}` }
        };
    }

    getSalons(): Observable<Salon[]> {
        const url = `${this.apiUrl}/${this.controller}/get-salons`;
        return this.http.get<Salon[]>(url, this.getHttpOptions());
    }

    getSalon(id: number): Observable<Salon> {
        const url = `${this.apiUrl}/${this.controller}/get-salon/${id}`;
        return this.http.get<Salon>(url, this.getHttpOptions());
    } 
  
    createSalon(entity: CreateSalonDto): Observable<Salon> {
        const url = `${this.apiUrl}/${this.controller}/create-salon`;
        return this.http.post<Salon>(url, entity, this.getHttpOptions());
    } 

    updateSalon(id: number, entity: UpdateSalonDto): Observable<Salon> {
        const url = `${this.apiUrl}/${this.controller}/update-salon/${id}`;
        return this.http.put<Salon>(url, entity, this.getHttpOptions());
    } 

    deleteSalon(id: number): Observable<void> {
        const url = `${this.apiUrl}/${this.controller}/delete-salon/${id}`;
        return this.http.delete<void>(url, this.getHttpOptions());
    } 
    
} 