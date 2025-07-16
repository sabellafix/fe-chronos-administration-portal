import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { StorageKeyConst } from '@app/core/models/constants/storageKey.const';
import { StorageService } from '../shared/storage.service';
import { Booking, CreateBookingDto, UpdateBookingDto, DateOnly } from '@app/core/models/bussiness';

@Injectable({
    providedIn: 'root'
})
export class BookingService {

    apiUrl: string = environment.apiUrl;
    controller: string = "api/chronos/bookings";
    token: string = "";

    constructor(private http: HttpClient, private storageService: StorageService) {
        this.token = this.storageService.get(StorageKeyConst._TOKEN)!; 
     }

    private getHttpOptions() {
        return {
            headers: { Authorization: `Bearer ${this.token}` }
        };
    }

    getBookings(): Observable<Booking[]> {
        const url = `${this.apiUrl}/${this.controller}/get-bookings`;
        return this.http.get<Booking[]>(url, this.getHttpOptions());
    }

    getBookingsByMonth(searchMonth: DateOnly): Observable<DateOnly[]> {
        const url = `${this.apiUrl}/${this.controller}/get-bookings-by-month`;
        const params = new HttpParams().set('searchMonth', JSON.stringify(searchMonth));
        return this.http.get<DateOnly[]>(url, { ...this.getHttpOptions(), params });
    }

    getBookingsByWeek(dateToSearch: Date): Observable<Booking[]> {
        const url = `${this.apiUrl}/${this.controller}/get-bookings-by-week`;
        const formattedDate = `${dateToSearch.getFullYear()}/${dateToSearch.getMonth() + 1}/${dateToSearch.getDate()}`;
        const params = new HttpParams().set('dateToSearch', formattedDate);
        return this.http.get<Booking[]>(url, { ...this.getHttpOptions(), params });
    }
     
    getBookingsByDay(dateToSearch: DateOnly): Observable<Booking[]> {
        const url = `${this.apiUrl}/${this.controller}/get-bookings-by-day`;
        const params = new HttpParams().set('dateToSearch', JSON.stringify(dateToSearch));
        return this.http.get<Booking[]>(url, { ...this.getHttpOptions(), params });
    }


    getByMonth(dateToSearch: Date): Observable<DateOnly[]> {
        const url = `${this.apiUrl}/${this.controller}/get-by-month`;
        const formattedDate = `${dateToSearch.getFullYear()}/${dateToSearch.getMonth() + 1}/${dateToSearch.getDate()}`;
        const params = new HttpParams().set('month', JSON.stringify(formattedDate));
        return this.http.get<DateOnly[]>(url, { ...this.getHttpOptions(), params });
    }

    getByWeek(dateToSearch: Date): Observable<Booking[]> {
        const url = `${this.apiUrl}/${this.controller}/get-by-week`;
        const formattedDate = `${dateToSearch.getFullYear()}/${dateToSearch.getMonth() + 1}/${dateToSearch.getDate()}`;
        const params = new HttpParams().set('week', formattedDate);
        return this.http.get<Booking[]>(url, { ...this.getHttpOptions(), params });
    }
     
    getByDay(dateToSearch: Date): Observable<Booking[]> {
        const url = `${this.apiUrl}/${this.controller}/get-by-day`;
        const formattedDate = `${dateToSearch.getFullYear()}/${dateToSearch.getMonth() + 1}/${dateToSearch.getDate()}`;
        const params = new HttpParams().set('day', formattedDate);
        return this.http.get<Booking[]>(url, { ...this.getHttpOptions(), params });
    }

    create(entity: CreateBookingDto | any): Observable<Booking> {
        const url = `${this.apiUrl}/${this.controller}/create`;
        return this.http.post<Booking>(url, entity, this.getHttpOptions());
    } 

    getBookingsCountWeek(dateToSearch: DateOnly): Observable<number> {
        const url = `${this.apiUrl}/${this.controller}/get-bookings-count-week`;
        const params = new HttpParams().set('dateToSearch', JSON.stringify(dateToSearch));
        return this.http.get<number>(url, { ...this.getHttpOptions(), params });
    }

    getBooking(id: string): Observable<Booking> {
        const url = `${this.apiUrl}/${this.controller}/get-booking/${id}`;
        return this.http.get<Booking>(url, this.getHttpOptions());
    }

    getBookingsByCustomer(customerId: string): Observable<Booking[]> {
        const url = `${this.apiUrl}/${this.controller}/get-bookings-by-customer/${customerId}`;
        return this.http.get<Booking[]>(url, this.getHttpOptions());
    }

    getBookingsBySupplier(): Observable<Booking[]> {
        const url = `${this.apiUrl}/${this.controller}/get-bookings-by-supplier`;
        return this.http.get<Booking[]>(url, this.getHttpOptions());
    }

    getBookingsByService(serviceId: string): Observable<Booking[]> {
        const url = `${this.apiUrl}/${this.controller}/get-bookings-by-service/${serviceId}`;
        return this.http.get<Booking[]>(url, this.getHttpOptions());
    }
  
    createBooking(entity: CreateBookingDto | any): Observable<Booking> {
        const url = `${this.apiUrl}/${this.controller}/create-booking`;
        return this.http.post<Booking>(url, entity, this.getHttpOptions());
    } 

    updateBooking(id: string, entity: UpdateBookingDto): Observable<Booking> {
        const url = `${this.apiUrl}/${this.controller}/update-booking/${id}`;
        return this.http.put<Booking>(url, entity, this.getHttpOptions());
    } 

    deleteBooking(id: string): Observable<void> {
        const url = `${this.apiUrl}/${this.controller}/delete-booking/${id}`;
        return this.http.delete<void>(url, this.getHttpOptions());
    } 
    
} 