import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    apiUrl: string = environment.apiUrl;
    controller: string = "api/Chat";
    token : string = environment.token;
    headers = { headers: { Authorization: `Bearer ${this.token}` } };

    constructor(private http: HttpClient) { }

    createMessage(message: any): Observable<string> {
        const url = `${this.apiUrl}/${this.controller}/message`;
        return this.http.post<string>(url, message, this.headers);
    }
  
} 