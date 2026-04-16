import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TwilioMessageRequest } from '@app/core/models/dtos/twilioMessageRequest';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    apiUrl: string = environment.apiUrl;
    controller: string = "api/Chat";
    token: string = environment.token;
    headers = { headers: { Authorization: `Bearer ${this.token}` } };

    private twilioApiUrl: string = 'https://chronos-assistant-cqf0gxahe6g5adbh.eastus-01.azurewebsites.net';

    constructor(private http: HttpClient) { }

    createMessage(message: any): Observable<string> {
        const url = `${this.apiUrl}/${this.controller}/message`;
        return this.http.post<string>(url, message, this.headers);
    }

    twilioWsAgent(request: TwilioMessageRequest): Observable<string> {
        const url = `${this.twilioApiUrl}/api/twilio_ws_agent`;
        
        const body = new URLSearchParams();
        body.set('ToCountry', request.ToCountry);
        body.set('ToState', request.ToState);
        body.set('SmsMessageSid', request.SmsMessageSid);
        body.set('NumMedia', request.NumMedia);
        body.set('SmsSid', request.SmsSid);
        body.set('SmsStatus', request.SmsStatus);
        body.set('Body', request.Body);
        body.set('FromCountry', request.FromCountry);
        body.set('To', request.To);
        body.set('NumSegments', request.NumSegments);
        body.set('MessageSid', request.MessageSid);
        body.set('AccountSid', request.AccountSid);
        body.set('From', request.From);
        body.set('ApiVersion', request.ApiVersion);

        const httpHeaders = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded'
        });

        return this.http.post<string>(url, body.toString(), { headers: httpHeaders });
    }
} 