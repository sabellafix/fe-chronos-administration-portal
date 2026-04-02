import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { StorageKeyConst } from '@app/core/models/constants/storageKey.const';
import { StorageService } from '../shared/storage.service';
import { 
    Booking, 
    CreateBookingDto, 
    UpdateBookingDto, 
    DateOnly,
    QueryBookingsParams,
    BookingQueryResponse
} from '@app/core/models/bussiness';

@Injectable({
    providedIn: 'root'
})
export class BookingService {

    apiUrl: string = environment.apiUrl;
    controller: string = "api/bookings";
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

    queryBookings(params?: QueryBookingsParams): Observable<BookingQueryResponse> {
        const url = `${this.apiUrl}/${this.controller}/query-bookings`;
        const httpParams = this.buildQueryBookingsParams(params);
        return this.http.get<BookingQueryResponse>(url, { ...this.getHttpOptions(), params: httpParams });
    }
 
    private buildQueryBookingsParams(params?: QueryBookingsParams): HttpParams {
        let httpParams = new HttpParams();

        if (!params) {
            return httpParams;
        }

        if (params.search) {
            httpParams = httpParams.set('search', params.search);
        }
        if (params.searchField) {
            httpParams = httpParams.set('searchField', params.searchField);
        }

        if (params.status) {
            httpParams = httpParams.set('status', params.status);
        }

        if (params.dateFrom) {
            httpParams = httpParams.set('dateFrom', params.dateFrom);
        }
        if (params.dateTo) {
            httpParams = httpParams.set('dateTo', params.dateTo);
        }

        if (params.supplierId) {
            httpParams = httpParams.set('supplierId', params.supplierId);
        }
        if (params.serviceId) {
            httpParams = httpParams.set('serviceId', params.serviceId);
        }
        if (params.customerId) {
            httpParams = httpParams.set('customerId', params.customerId);
        }
        if (params.salonId) {
            httpParams = httpParams.set('salonId', params.salonId);
        }

        if (params.page !== undefined) {
            httpParams = httpParams.set('page', params.page.toString());
        }
        if (params.pageSize !== undefined) {
            httpParams = httpParams.set('pageSize', params.pageSize.toString());
        }

        if (params.sortBy) {
            httpParams = httpParams.set('sortBy', params.sortBy);
        }
        if (params.sortOrder) {
            httpParams = httpParams.set('sortOrder', params.sortOrder);
        }

        if (params.includeCount !== undefined) {
            httpParams = httpParams.set('includeCount', params.includeCount.toString());
        }

        return httpParams;
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


    getByMonth(dateToSearch: Date, salonId?: string): Observable<Booking[]> {
        const url = `${this.apiUrl}/${this.controller}/get-by-month`;
        const formattedDate = `${dateToSearch.getFullYear()}/${dateToSearch.getMonth() + 1}/${dateToSearch.getDate()}`;
        let params = new HttpParams().set('month', formattedDate);
        if (salonId) {
            params = params.set('salonId', salonId);
        }
        return this.http.get<Booking[]>(url, { ...this.getHttpOptions(), params });
    }

    getByWeek(dateToSearch: Date, salonId?: string): Observable<Booking[]> {
        const url = `${this.apiUrl}/${this.controller}/get-by-week`;
        const formattedDate = `${dateToSearch.getFullYear()}/${dateToSearch.getMonth() + 1}/${dateToSearch.getDate()}`;
        let params = new HttpParams().set('week', formattedDate);
        if (salonId) {
            params = params.set('salonId', salonId);
        }
        return this.http.get<Booking[]>(url, { ...this.getHttpOptions(), params });
    }
     
    getByDay(dateToSearch: Date, salonId?: string): Observable<Booking[]> {
        const url = `${this.apiUrl}/${this.controller}/get-by-day`;
        const formattedDate = `${dateToSearch.getFullYear()}/${dateToSearch.getMonth() + 1}/${dateToSearch.getDate()}`;
        let params = new HttpParams().set('day', formattedDate);
        if (salonId) {
            params = params.set('salonId', salonId);
        }
        return this.http.get<Booking[]>(url, { ...this.getHttpOptions(), params });
    }

    getByUserDateRange(userId: string, start: Date | undefined, end: Date | undefined): Observable<Booking[]> {
        const url = `${this.apiUrl}/${this.controller}/get-by-user-date-range`;
        const startDate = start ? `${start.getFullYear()}/${start.getMonth() + 1}/${start.getDate()}` : '';
        const endDate = end ? `${end.getFullYear()}/${end.getMonth() + 1}/${end.getDate()}` : '';
        const params = new HttpParams().set('id', userId).set('start', startDate).set('end', endDate);
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

    getBookingsByUser(userId: string, start: string, end: string): Observable<Booking[]> {
        const url = `${this.apiUrl}/${this.controller}/get-bookings-by-user/${userId}`;
        const params = new HttpParams().set('start', start).set('end', end);
        return this.http.get<Booking[]>(url, this.getHttpOptions());
    }
  
    createBooking(entity: CreateBookingDto | any): Observable<Booking> {
        const url = `${this.apiUrl}/${this.controller}/create-booking`;
        return this.http.post<Booking>(url, entity, this.getHttpOptions());
    } 

    updateBooking(id: string, entity: UpdateBookingDto): Observable<Booking> {
        const url = `${this.apiUrl}/${this.controller}/update/${id}`;
        return this.http.put<Booking>(url, entity, this.getHttpOptions());
    } 

    deleteBooking(id: string): Observable<void> {
        const url = `${this.apiUrl}/${this.controller}/delete-booking/${id}`;
        return this.http.delete<void>(url, this.getHttpOptions());
    } 
    
} 