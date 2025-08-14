import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageKeyConst } from '@app/core/models/constants/storageKey.const';
import { StorageService } from '../shared/storage.service';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    apiUrl: string = environment.apiUrl;
    controller: string = "api/auth/users";
    token: string = "";
    headers : any = {};

    constructor(private http: HttpClient, private storageService: StorageService) {
        this.refreshToken();
     }

    refreshToken(): void {
        this.token = this.storageService.get(StorageKeyConst._TOKEN) || '';
        this.headers = { headers: { Authorization: `Bearer ${this.token}` } };
    }

    getUsers(): Observable<any[]> {
        const url = `${this.apiUrl}/${this.controller}/get-users`;
        return this.http.get<any[]>(url, this.headers) as unknown as Observable<any[]>;
    }

    getUserByEmail(email: string): Observable<any> {
        const url = `${this.apiUrl}/${this.controller}/get-user-by-email/${email}`;
        return this.http.get<any>(url, this.headers);
    }

    getUsersByRole(role: string): Observable<any[]> {
        const url = `${this.apiUrl}/${this.controller}/get-users-by-role/${role}`;
        return this.http.get<any[]>(url, this.headers) as unknown as Observable<any[]>;
    }

    get(id: string): Observable<any> {
        const url = `${this.apiUrl}/${this.controller}/get-user/${id}`;
        return this.http.get<any>(url, this.headers);
    } 
  
    post(entity: any): Observable<any> {
        const url = `${this.apiUrl}/${this.controller}/create-user`;
        return this.http.post<any>(url, entity, this.headers);
    } 

    put(entity: any, id: string): Observable<any> {
        const url = `${this.apiUrl}/${this.controller}/update-user/${id}`;
        return this.http.put<any>(url, entity, this.headers);
    } 

    delete(id: string): Observable<any> {
        const url = `${this.apiUrl}/${this.controller}/delete-user/${id}`;
        return this.http.delete<any>(url, this.headers);
    }

    login(loginDto: any): Observable<any> {
        const url = `${this.apiUrl}/${this.controller}/login`;
        return this.http.post<any>(url, loginDto);
    }

    changePassword(userId: string, changePasswordDto: any): Observable<any> {
        const url = `${this.apiUrl}/${this.controller}/change-password/${userId}`;
        return this.http.post<any>(url, changePasswordDto, this.headers);
    }
    
}
