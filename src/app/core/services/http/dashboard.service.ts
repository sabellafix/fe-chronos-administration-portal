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
    SalonOccupancyDto,
    SupplierMetricsDto
} from '@app/core/models/bussiness/dashboard-dtos';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {

    apiUrl: string = environment.apiUrl;
    controller: string = "api/dashboard";
    token: string = "";

    constructor(private http: HttpClient, private storageService: StorageService) {
        this.token = this.storageService.get(StorageKeyConst._TOKEN)!; 
    }

    private getHttpOptions() {
        return {
            headers: { Authorization: `Bearer ${this.token}` }
        };
    }

    private buildParams(startDate?: Date, endDate?: Date, supplierId?: string): HttpParams {
        let params = new HttpParams();
        
        if (startDate) {
            params = params.set('startDate', startDate.toISOString());
        }
        if (endDate) {
            params = params.set('endDate', endDate.toISOString());
        }
        if (supplierId) {
            params = params.set('supplierId', supplierId);
        }
        
        return params;
    }

    getMetrics(salonId: string, startDate?: Date, endDate?: Date, supplierId?: string): Observable<DashboardMetricsDto> {
        const url = `${this.apiUrl}/${this.controller}/metrics/${salonId}`;
        const params = this.buildParams(startDate, endDate, supplierId);

        return this.http.get<DashboardMetricsDto>(url, {
            ...this.getHttpOptions(),
            params
        });
    }

    getKpiCards(salonId: string, startDate?: Date, endDate?: Date, supplierId?: string): Observable<KpiCardsDto> {
        const url = `${this.apiUrl}/${this.controller}/kpi-cards/${salonId}`;
        const params = this.buildParams(startDate, endDate, supplierId);

        return this.http.get<KpiCardsDto>(url, {
            ...this.getHttpOptions(),
            params
        });
    }

    getRevenueChart(salonId: string, startDate?: Date, endDate?: Date, supplierId?: string): Observable<RevenueChartDto> {
        const url = `${this.apiUrl}/${this.controller}/revenue-chart/${salonId}`;
        const params = this.buildParams(startDate, endDate, supplierId);

        return this.http.get<RevenueChartDto>(url, {
            ...this.getHttpOptions(),
            params
        });
    }

    getRevenueActivity(salonId: string, startDate?: Date, endDate?: Date, supplierId?: string): Observable<RevenueActivityDto> {
        const url = `${this.apiUrl}/${this.controller}/revenue-activity/${salonId}`;
        const params = this.buildParams(startDate, endDate, supplierId);

        return this.http.get<RevenueActivityDto>(url, {
            ...this.getHttpOptions(),
            params
        });
    }

    getOrderStats(salonId: string, startDate?: Date, endDate?: Date, supplierId?: string): Observable<OrderStatsDto> {
        const url = `${this.apiUrl}/${this.controller}/order-stats/${salonId}`;
        const params = this.buildParams(startDate, endDate, supplierId);

        return this.http.get<OrderStatsDto>(url, {
            ...this.getHttpOptions(),
            params
        });
    }

    getTopServices(salonId: string, topCount: number = 10, startDate?: Date, endDate?: Date, supplierId?: string): Observable<TopServiceDto[]> {
        const url = `${this.apiUrl}/${this.controller}/top-services/${salonId}`;
        let params = this.buildParams(startDate, endDate, supplierId);
        params = params.set('topCount', topCount.toString());

        return this.http.get<TopServiceDto[]>(url, {
            ...this.getHttpOptions(),
            params
        });
    }

    getSalonOccupancy(salonId: string, startDate?: Date, endDate?: Date, supplierId?: string): Observable<SalonOccupancyDto> {
        const url = `${this.apiUrl}/${this.controller}/salon-occupancy/${salonId}`;
        const params = this.buildParams(startDate, endDate, supplierId);

        return this.http.get<SalonOccupancyDto>(url, {
            ...this.getHttpOptions(),
            params
        });
    }

    getSupplierMetrics(salonId: string, supplierId: string, startDate: Date, endDate?: Date): Observable<SupplierMetricsDto> {
        const url = `${this.apiUrl}/${this.controller}/supplier-metrics/${salonId}`;
        let params = new HttpParams().set('supplierId', supplierId).set('startDate', startDate.toISOString());
        
        if (endDate) {
            params = params.set('endDate', endDate.toISOString());
        }

        return this.http.get<SupplierMetricsDto>(url, {
            ...this.getHttpOptions(),
            params
        });
    }
} 