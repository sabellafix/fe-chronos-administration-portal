import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { SiteService } from '@app/core/models/bussiness/floor/siteService';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { StorageService } from '../shared/storage.service';

@Injectable({
    providedIn: 'root'
})
export class MockSiteServiceService {
    private readonly STORAGE_KEY = 'MOCK_SITE_SERVICES';
    private readonly DELAY_MS = 500;

    constructor(private storageService: StorageService) {
        this.initializeMockData();
    }

    private initializeMockData(): void {
        const existingSiteServices = this.storageService.get<SiteService[]>(this.STORAGE_KEY);
        if (!existingSiteServices || existingSiteServices.length === 0) {
            const mockSiteServices: SiteService[] = [];
            
            // Configuraciones de relaciones sitio-servicio
            const relationships = [
                // WORKSTATIONS - Pueden hacer servicios de cabello y manicure
                { siteTypePattern: 'sitetype-001', serviceIds: ['servicetype-001', 'servicetype-003', 'servicetype-005'], siteRange: { start: 1, end: 20 } },
                
                // WASHSTATIONS - Solo servicios de lavado y tratamientos
                { siteTypePattern: 'sitetype-002', serviceIds: ['servicetype-002', 'servicetype-004'], siteRange: { start: 21, end: 30 } },
                
                // RECEPTION - Solo consultas
                { siteTypePattern: 'sitetype-003', serviceIds: ['servicetype-006'], siteRange: { start: 31, end: 31 } },
                
                // WAITING - No servicios activos (solo espera)
                { siteTypePattern: 'sitetype-004', serviceIds: [], siteRange: { start: 32, end: 41 } },
                
                // STORAGE - No servicios
                { siteTypePattern: 'sitetype-005', serviceIds: [], siteRange: { start: 42, end: 47 } }
            ];

            let siteServiceCounter = 1;

            relationships.forEach(relationship => {
                // Para cada sitio en el rango
                for (let siteNum = relationship.siteRange.start; siteNum <= relationship.siteRange.end; siteNum++) {
                    const siteId = `site-${siteNum.toString().padStart(3, '0')}`;
                    
                    // Para cada servicio compatible
                    relationship.serviceIds.forEach(serviceId => {
                        const siteService = new SiteService();
                        siteService.id = `siteservice-${siteServiceCounter.toString().padStart(3, '0')}`;
                        siteService.siteId = siteId;
                        siteService.serviceTypeId = serviceId;
                        siteService.createdAt = new Date(Date.now() - siteServiceCounter * 30 * 60 * 1000); // Escalonado cada 30 min
                        siteService.updatedAt = new Date();
                        siteService.isActive = true;
                        siteService.isDeleted = false;

                        // Configuración específica según tipo de servicio
                        this.configureServiceSpecifics(siteService, serviceId, relationship.siteTypePattern);
                        
                        // Simular métricas de rendimiento
                        this.generatePerformanceMetrics(siteService);
                        
                        mockSiteServices.push(siteService);
                        siteServiceCounter++;
                    });
                }
            });

            this.storageService.set(this.STORAGE_KEY, mockSiteServices);
        }
    }

    private configureServiceSpecifics(siteService: SiteService, serviceId: string, siteTypePattern: string): void {
        // Configuración específica por tipo de servicio
        switch (serviceId) {
            case 'servicetype-001': // Corte de Cabello
                siteService.configuration = {
                    isPreferred: siteTypePattern === 'sitetype-001',
                    efficiency: siteTypePattern === 'sitetype-001' ? 95 : 70,
                    quality: siteTypePattern === 'sitetype-001' ? 90 : 75,
                    timeModifiers: {
                        setupTime: 5,
                        executionMultiplier: 1.0,
                        cleanupTime: 10
                    },
                    priceModifiers: {
                        surcharge: 0,
                        discount: 0,
                        reason: ''
                    }
                };
                siteService.visualConfig.serviceActiveColor = '#FF6B6B';
                break;

            case 'servicetype-002': // Lavado y Secado
                siteService.configuration = {
                    isPreferred: siteTypePattern === 'sitetype-002',
                    efficiency: siteTypePattern === 'sitetype-002' ? 98 : 60,
                    quality: siteTypePattern === 'sitetype-002' ? 95 : 70,
                    timeModifiers: {
                        setupTime: 2,
                        executionMultiplier: 1.0,
                        cleanupTime: 5
                    },
                    priceModifiers: {
                        surcharge: 0,
                        discount: 0,
                        reason: ''
                    }
                };
                siteService.visualConfig.serviceActiveColor = '#4ECDC4';
                break;

            case 'servicetype-003': // Peinado y Styling
                siteService.configuration = {
                    isPreferred: siteTypePattern === 'sitetype-001',
                    efficiency: siteTypePattern === 'sitetype-001' ? 90 : 65,
                    quality: siteTypePattern === 'sitetype-001' ? 88 : 70,
                    timeModifiers: {
                        setupTime: 10,
                        executionMultiplier: 1.1,
                        cleanupTime: 15
                    },
                    priceModifiers: {
                        surcharge: siteTypePattern === 'sitetype-001' ? 0 : 5000,
                        discount: 0,
                        reason: siteTypePattern !== 'sitetype-001' ? 'Estación no especializada' : ''
                    }
                };
                siteService.visualConfig.serviceActiveColor = '#A569BD';
                break;

            case 'servicetype-004': // Tratamiento Capilar
                siteService.configuration = {
                    isPreferred: siteTypePattern === 'sitetype-002',
                    efficiency: siteTypePattern === 'sitetype-002' ? 95 : 70,
                    quality: siteTypePattern === 'sitetype-002' ? 92 : 75,
                    timeModifiers: {
                        setupTime: 15,
                        executionMultiplier: 1.0,
                        cleanupTime: 10
                    },
                    priceModifiers: {
                        surcharge: 0,
                        discount: 0,
                        reason: ''
                    }
                };
                siteService.visualConfig.serviceActiveColor = '#52C41A';
                break;

            case 'servicetype-005': // Manicure
                siteService.configuration = {
                    isPreferred: siteTypePattern === 'sitetype-001',
                    efficiency: siteTypePattern === 'sitetype-001' ? 85 : 60,
                    quality: siteTypePattern === 'sitetype-001' ? 80 : 65,
                    timeModifiers: {
                        setupTime: 10,
                        executionMultiplier: 1.2,
                        cleanupTime: 15
                    },
                    priceModifiers: {
                        surcharge: siteTypePattern === 'sitetype-001' ? 0 : 8000,
                        discount: 0,
                        reason: siteTypePattern !== 'sitetype-001' ? 'Requiere mesa especializada' : ''
                    }
                };
                siteService.visualConfig.serviceActiveColor = '#FF69B4';
                break;

            case 'servicetype-006': // Consulta Inicial
                siteService.configuration = {
                    isPreferred: siteTypePattern === 'sitetype-003',
                    efficiency: siteTypePattern === 'sitetype-003' ? 100 : 80,
                    quality: siteTypePattern === 'sitetype-003' ? 95 : 85,
                    timeModifiers: {
                        setupTime: 2,
                        executionMultiplier: 1.0,
                        cleanupTime: 3
                    },
                    priceModifiers: {
                        surcharge: 0,
                        discount: 0,
                        reason: ''
                    }
                };
                siteService.visualConfig.serviceActiveColor = '#1890FF';
                break;
        }

        // Configuración de notificaciones estándar
        siteService.notificationConfig = {
            preServiceReminder: 15,
            postServiceFollow: 30,
            specialInstructions: [],
            customerNotes: '',
            staffNotes: ''
        };

        // Restricciones por defecto
        siteService.restrictions = {
            maxDailyExecutions: 0, // Sin límite por defecto
            maxWeeklyExecutions: 0,
            restrictedHours: [],
            restrictedDays: [],
            seasonalRestrictions: []
        };
    }

    private generatePerformanceMetrics(siteService: SiteService): void {
        // Generar métricas simuladas basadas en la configuración
        const baseExecutions = Math.floor(Math.random() * 50) + 10; // 10-60 ejecuciones
        const baseRating = 3 + (siteService.configuration.quality / 100) * 2; // 3-5 basado en calidad
        const baseSuccess = siteService.configuration.efficiency; // Basado en eficiencia

        siteService.performanceMetrics = {
            totalExecutions: baseExecutions,
            averageRating: Math.min(5, Math.max(1, baseRating + (Math.random() - 0.5) * 0.5)),
            averageDuration: 45 + Math.floor(Math.random() * 30), // 45-75 minutos
            complaintRate: Math.max(0, (100 - baseSuccess) * 0.1), // Menos quejas si más eficiente
            repeatCustomerRate: Math.min(100, baseSuccess + Math.random() * 20), // Más repetición si eficiente
            revenue: baseExecutions * (20000 + Math.random() * 30000), // Ingresos simulados
            successRate: Math.min(100, baseSuccess + Math.random() * 10)
        };
    }

    private getSiteServicesFromStorage(): SiteService[] {
        const rawSiteServices = this.storageService.get<any[]>(this.STORAGE_KEY) || [];
        return rawSiteServices.map(rawSiteService => this.convertToSiteServiceInstance(rawSiteService));
    }

    private convertToSiteServiceInstance(rawSiteService: any): SiteService {
        const siteService = new SiteService();
        // Copiar todas las propiedades del objeto plano a la instancia de SiteService
        Object.assign(siteService, rawSiteService);
        return siteService;
    }

    getSiteServices(pagination: Pagination): Observable<{ data: SiteService[], count: number }> {
        let filteredSiteServices = [...this.getSiteServicesFromStorage()];
        
        if (pagination.filters) {
            const filters = pagination.filters.split('&');
            filters.forEach((filter: string) => {
                const [key, value] = filter.split('=');
                if (key && value) {
                    filteredSiteServices = filteredSiteServices.filter(siteService => {
                        const fieldValue = siteService[key as keyof SiteService];
                        return fieldValue?.toString() === value;
                    });
                }
            });
        }

        if (pagination.sort) {
            const [field, direction] = pagination.sort.split(',');
            filteredSiteServices.sort((a, b) => {
                const aValue = a[field as keyof SiteService];
                const bValue = b[field as keyof SiteService];
                
                if (aValue == null || bValue == null) return 0;
                
                return direction === 'desc' 
                    ? bValue > aValue ? 1 : -1 
                    : aValue > bValue ? 1 : -1;
            });
        }

        const start = pagination.offset * pagination.limit;
        const end = start + pagination.limit;
        const paginatedSiteServices = filteredSiteServices.slice(start, end);

        return of({
            data: paginatedSiteServices,
            count: filteredSiteServices.length
        }).pipe(delay(this.DELAY_MS));
    }

    get(id: string): Observable<SiteService> {
        const siteServices = this.getSiteServicesFromStorage();
        const siteService = siteServices.find(ss => ss.id === id);
        return of(siteService ? siteService : new SiteService()).pipe(delay(this.DELAY_MS));
    }

    post(entity: SiteService): Observable<SiteService> {
        const siteServices = this.getSiteServicesFromStorage();
        const newId = `siteservice-${(siteServices.length + 1).toString().padStart(3, '0')}`;
        const newSiteService = new SiteService();
        
        Object.assign(newSiteService, entity);
        newSiteService.id = newId;
        
        siteServices.push(newSiteService);
        this.storageService.set(this.STORAGE_KEY, siteServices);
        return of(newSiteService).pipe(delay(this.DELAY_MS));
    }

    put(entity: SiteService, id: string): Observable<SiteService> {
        const siteServices = this.getSiteServicesFromStorage();
        const index = siteServices.findIndex(ss => ss.id === id);
        if (index !== -1) {
            const updatedSiteService = new SiteService();
            Object.assign(updatedSiteService, entity);
            updatedSiteService.id = id;
            
            siteServices[index] = updatedSiteService;
            this.storageService.set(this.STORAGE_KEY, siteServices);
            return of(siteServices[index]).pipe(delay(this.DELAY_MS));
        }
        return of(entity).pipe(delay(this.DELAY_MS));
    }

    patch(entity: Partial<SiteService>, id: string): Observable<SiteService> {
        const siteServices = this.getSiteServicesFromStorage();
        const index = siteServices.findIndex(ss => ss.id === id);
        if (index !== -1) {
            Object.assign(siteServices[index], entity);
            this.storageService.set(this.STORAGE_KEY, siteServices);
            return of(siteServices[index]).pipe(delay(this.DELAY_MS));
        }
        return of(entity as SiteService).pipe(delay(this.DELAY_MS));
    }

    delete(id: string): Observable<any> {
        const siteServices = this.getSiteServicesFromStorage();
        const index = siteServices.findIndex(ss => ss.id === id);
        if (index !== -1) {
            siteServices.splice(index, 1);
            this.storageService.set(this.STORAGE_KEY, siteServices);
        }
        return of({ success: true }).pipe(delay(this.DELAY_MS));
    }

    // Métodos específicos
    getBySite(siteId: string): Observable<SiteService[]> {
        const siteServices = this.getSiteServicesFromStorage();
        const siteSiteServices = siteServices.filter(ss => ss.siteId === siteId);
        return of(siteSiteServices).pipe(delay(this.DELAY_MS));
    }

    getByService(serviceTypeId: string): Observable<SiteService[]> {
        const siteServices = this.getSiteServicesFromStorage();
        const serviceSiteServices = siteServices.filter(ss => ss.serviceTypeId === serviceTypeId);
        return of(serviceSiteServices).pipe(delay(this.DELAY_MS));
    }

    getCompatibleSites(serviceTypeId: string): Observable<SiteService[]> {
        const siteServices = this.getSiteServicesFromStorage();
        const compatibleSites = siteServices.filter(ss => 
            ss.serviceTypeId === serviceTypeId && 
            ss.isActive && 
            !ss.isDeleted
        );
        return of(compatibleSites).pipe(delay(this.DELAY_MS));
    }

    getBestSiteForService(serviceTypeId: string): Observable<SiteService | null> {
        const siteServices = this.getSiteServicesFromStorage();
        const compatibleSites = siteServices.filter(ss => 
            ss.serviceTypeId === serviceTypeId && 
            ss.isActive && 
            !ss.isDeleted
        );
        
        if (compatibleSites.length === 0) {
            return of(null).pipe(delay(this.DELAY_MS));
        }

        // Ordenar por eficiencia y si es preferido
        const bestSite = compatibleSites.sort((a, b) => {
            const aScore = (a.configuration.isPreferred ? 20 : 0) + a.configuration.efficiency;
            const bScore = (b.configuration.isPreferred ? 20 : 0) + b.configuration.efficiency;
            return bScore - aScore;
        })[0];

        return of(bestSite).pipe(delay(this.DELAY_MS));
    }

    updatePerformanceMetrics(id: string, rating: number, duration: number, revenue: number, wasSuccessful: boolean): Observable<SiteService> {
        const siteServices = this.getSiteServicesFromStorage();
        const index = siteServices.findIndex(ss => ss.id === id);
        if (index !== -1) {
            siteServices[index].updatePerformanceMetrics(rating, duration, revenue, wasSuccessful);
            this.storageService.set(this.STORAGE_KEY, siteServices);
            return of(siteServices[index]).pipe(delay(this.DELAY_MS));
        }
        return of(new SiteService()).pipe(delay(this.DELAY_MS));
    }

    // Método para obtener métricas agregadas
    getServiceMetrics(serviceTypeId: string): Observable<{
        totalExecutions: number;
        averageRating: number;
        averageEfficiency: number;
        totalRevenue: number;
        bestPerformingSite: string;
    }> {
        const siteServices = this.getSiteServicesFromStorage();
        const serviceRelations = siteServices.filter(ss => ss.serviceTypeId === serviceTypeId);
        
        if (serviceRelations.length === 0) {
            return of({
                totalExecutions: 0,
                averageRating: 0,
                averageEfficiency: 0,
                totalRevenue: 0,
                bestPerformingSite: ''
            }).pipe(delay(this.DELAY_MS));
        }

        const metrics = serviceRelations.reduce((acc, ss) => {
            acc.totalExecutions += ss.performanceMetrics.totalExecutions;
            acc.totalRating += ss.performanceMetrics.averageRating * ss.performanceMetrics.totalExecutions;
            acc.totalEfficiency += ss.configuration.efficiency;
            acc.totalRevenue += ss.performanceMetrics.revenue;
            return acc;
        }, { totalExecutions: 0, totalRating: 0, totalEfficiency: 0, totalRevenue: 0 });

        const bestSite = serviceRelations.sort((a, b) => 
            b.getEfficiencyScore() - a.getEfficiencyScore()
        )[0];

        return of({
            totalExecutions: metrics.totalExecutions,
            averageRating: metrics.totalExecutions > 0 ? metrics.totalRating / metrics.totalExecutions : 0,
            averageEfficiency: metrics.totalEfficiency / serviceRelations.length,
            totalRevenue: metrics.totalRevenue,
            bestPerformingSite: bestSite.siteId
        }).pipe(delay(this.DELAY_MS));
    }
} 