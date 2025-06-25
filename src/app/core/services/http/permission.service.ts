import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StorageKeyConst } from '@app/core/models/constants/storageKey.const';
import { StorageService } from '../shared/storage.service';

@Injectable({
    providedIn: 'root'
})
export class PermissionService {

    apiUrl: string = environment.apiUrl;
    controller: string = "api/auth/permissions";
    token: string = "";
    headers : any = {};

    constructor(private http: HttpClient, private storageService: StorageService) {
        this.token = this.storageService.get(StorageKeyConst._TOKEN)!; 
        this.headers = { headers: { Authorization: `Bearer ${this.token}` } };
     }

    getPermissions(): Observable<any[]> {
        const url = `${this.apiUrl}/${this.controller}/get-permissions`;
        return this.http.get<any[]>(url, this.headers) as unknown as Observable<any[]>;
    }

    getPermissionsByResource(resource: string): Observable<any[]> {
        const url = `${this.apiUrl}/${this.controller}/get-permissions-by-resource/${resource}`;
        return this.http.get<any[]>(url, this.headers) as unknown as Observable<any[]>;
    }

    getPermissionsByAction(action: string): Observable<any[]> {
        const url = `${this.apiUrl}/${this.controller}/get-permissions-by-action/${action}`;
        return this.http.get<any[]>(url, this.headers) as unknown as Observable<any[]>;
    }

    get(id: number): Observable<any> {
        const url = `${this.apiUrl}/${this.controller}/get-permission/${id}`;
        return this.http.get<any>(url, this.headers);
    } 
  
    post(entity: any): Observable<any> {
        const url = `${this.apiUrl}/${this.controller}/create-permission`;
        return this.http.post<any>(url, entity, this.headers);
    } 

    put(entity: any, id: number): Observable<any> {
        const url = `${this.apiUrl}/${this.controller}/update-permission/${id}`;
        return this.http.put<any>(url, entity, this.headers);
    } 

    delete(id: number): Observable<any> {
        const url = `${this.apiUrl}/${this.controller}/delete-permission/${id}`;
        return this.http.delete<any>(url, this.headers);
    } 
    
} 