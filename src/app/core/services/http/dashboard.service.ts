import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { StorageKeyConst } from '@app/core/models/constants/storageKey.const';
import { StorageService } from '../shared/storage.service';
import {
    DashboardMetricsDto,
    KpiCardsDto,
    RevenueChartDto,
    RevenueActivityDto,
    OrderStatsDto,
    TopServiceDto,
    SalonOccupancyDto
} from '@app/core/models/bussiness/dashboard-dtos';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {

    apiUrl: string = environment.apiUrl;
    controller: string = "api/chronos/dashboard";
    token: string = "";

    constructor(private http: HttpClient, private storageService: StorageService) {
        this.token = this.storageService.get(StorageKeyConst._TOKEN)!; 
    }

    private getHttpOptions() {
        return {
            headers: { Authorization: `Bearer ${this.token}` }
        };
    }

    getMetrics(salonId: string, date?: Date): Observable<DashboardMetricsDto> {
        const url = `${this.apiUrl}/${this.controller}/metrics/${salonId}`;
        let params = new HttpParams();
        
        if (date) {
            params = params.set('date', date.toISOString());
        }

        return this.http.get<DashboardMetricsDto>(url, {
            ...this.getHttpOptions(),
            params
        });
    }

    getKpiCards(salonId: string, date?: Date): Observable<KpiCardsDto> {
        const url = `${this.apiUrl}/${this.controller}/kpi-cards/${salonId}`;
        let params = new HttpParams();
        
        if (date) {
            params = params.set('date', date.toISOString());
        }

        return this.http.get<KpiCardsDto>(url, {
            ...this.getHttpOptions(),
            params
        });
    }

    getRevenueChart(salonId: string, date?: Date): Observable<RevenueChartDto> {
        const url = `${this.apiUrl}/${this.controller}/revenue-chart/${salonId}`;
        let params = new HttpParams();
        
        if (date) {
            params = params.set('date', date.toISOString());
        }

        return this.http.get<RevenueChartDto>(url, {
            ...this.getHttpOptions(),
            params
        });
    }

    getRevenueActivity(salonId: string, date?: Date): Observable<RevenueActivityDto> {
        const url = `${this.apiUrl}/${this.controller}/revenue-activity/${salonId}`;
        let params = new HttpParams();
        
        if (date) {
            params = params.set('date', date.toISOString());
        }

        return this.http.get<RevenueActivityDto>(url, {
            ...this.getHttpOptions(),
            params
        });
    }

    getOrderStats(salonId: string, startDate?: Date, endDate?: Date): Observable<OrderStatsDto> {
        const url = `${this.apiUrl}/${this.controller}/order-stats/${salonId}`;
        let params = new HttpParams();
        
        if (startDate) {
            params = params.set('startDate', startDate.toISOString());
        }
        if (endDate) {
            params = params.set('endDate', endDate.toISOString());
        }

        return this.http.get<OrderStatsDto>(url, {
            ...this.getHttpOptions(),
            params
        });
    }

    getTopServices(salonId: string, topCount: number = 10, startDate?: Date, endDate?: Date): Observable<TopServiceDto[]> {
        const url = `${this.apiUrl}/${this.controller}/top-services/${salonId}`;
        let params = new HttpParams();
        
        params = params.set('topCount', topCount.toString());
        
        if (startDate) {
            params = params.set('startDate', startDate.toISOString());
        }
        if (endDate) {
            params = params.set('endDate', endDate.toISOString());
        }

        return this.http.get<TopServiceDto[]>(url, {
            ...this.getHttpOptions(),
            params
        });
    }

    getSalonOccupancy(salonId: string, date?: Date): Observable<SalonOccupancyDto> {
        const url = `${this.apiUrl}/${this.controller}/salon-occupancy/${salonId}`;
        let params = new HttpParams();
        
        if (date) {
            params = params.set('date', date.toISOString());
        }

        return this.http.get<SalonOccupancyDto>(url, {
            ...this.getHttpOptions(),
            params
        });
    }
} 