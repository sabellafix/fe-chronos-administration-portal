import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StorageKeyConst } from '@app/core/models/constants/storageKey.const';
import { StorageService } from '../shared/storage.service';
import { Rol, CreateRolDto, UpdateRolDto } from '@app/core/models/bussiness';

@Injectable({
    providedIn: 'root'
})
export class RolService {

    apiUrl: string = environment.apiUrl;
    controller: string = "api/roles";
    token: string = "";

    constructor(private http: HttpClient, private storageService: StorageService) {
        this.token = this.storageService.get(StorageKeyConst._TOKEN)!; 
     }

    private getHttpOptions() {
        return {
            headers: { Authorization: `Bearer ${this.token}` }
        };
    }

    getRoles(): Observable<Rol[]> {
        const url = `${this.apiUrl}/${this.controller}/get-roles`;
        return this.http.get<Rol[]>(url, this.getHttpOptions());
    }

    getRol(id: number): Observable<Rol> {
        const url = `${this.apiUrl}/${this.controller}/get-role/${id}`;
        return this.http.get<Rol>(url, this.getHttpOptions());
    } 

    getRolByName(name: string): Observable<Rol> {
        const url = `${this.apiUrl}/${this.controller}/get-role-by-name/${name}`;
        return this.http.get<Rol>(url, this.getHttpOptions());
    } 

    getRolByIdBearer(id: number, token: string): Observable<Rol> {
        const url = `${this.apiUrl}/${this.controller}/get-role/${id}`;
        return this.http.get<Rol>(url, { headers: { Authorization: `Bearer ${token}` } });
    } 
  
    createRol(entity: CreateRolDto): Observable<Rol> {
        const url = `${this.apiUrl}/${this.controller}/create-role`;
        return this.http.post<Rol>(url, entity, this.getHttpOptions());
    } 

    updateRol(id: number, entity: UpdateRolDto): Observable<Rol> {
        const url = `${this.apiUrl}/${this.controller}/update-role/${id}`;
        return this.http.put<Rol>(url, entity, this.getHttpOptions());
    } 

    deleteRol(id: number): Observable<void> {
        const url = `${this.apiUrl}/${this.controller}/delete-role/${id}`;
        return this.http.delete<void>(url, this.getHttpOptions());
    } 
    
} 