import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ServiceType } from '@app/core/models/bussiness/floor/serviceType';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { StorageService } from '../shared/storage.service';

@Injectable({
    providedIn: 'root'
})
export class MockServiceTypeService {
    private readonly STORAGE_KEY = 'MOCK_SERVICE_TYPES';
    private readonly DELAY_MS = 500;

    constructor(private storageService: StorageService) {
        this.initializeMockData();
    }

    private initializeMockData(): void {
        const existingServiceTypes = this.storageService.get<ServiceType[]>(this.STORAGE_KEY);
        if (!existingServiceTypes || existingServiceTypes.length === 0) {
            const mockServiceTypes: ServiceType[] = [];
            
            // Servicio 1: Corte de Cabello
            const haircut = new ServiceType();
            haircut.id = 'servicetype-001';
            haircut.name = 'Corte de Cabello';
            haircut.description = 'Corte de cabello profesional para damas y caballeros';
            haircut.category = 'hair';
            haircut.subCategory = 'corte';
            haircut.duration = { min: 30, max: 90, default: 45, increment: 15 };
            haircut.requirements = {
                siteTypes: ['sitetype-001'], // workstation
                equipment: ['tijeras', 'peine', 'secador'],
                products: ['shampoo', 'acondicionador'],
                stylistSkills: ['corte-basico', 'corte-avanzado'],
                certifications: ['certificacion-corte']
            };
            haircut.pricing = {
                basePrice: 25000,
                currency: 'COP',
                priceVariations: { seniorStylist: 10000, peakHours: 5000, weekend: 7500, holiday: 10000 },
                discounts: { loyalty: 10, bulk: 15, firstTime: 20 }
            };
            haircut.visualRepresentation = {
                color: '#FF6B6B',
                icon: 'scissors',
                effectsConfig: { particleEffect: true, colorOverlay: '#FFE5E5', animationType: 'glow', intensity: 0.7 }
            };
            
            // Servicio 2: Lavado y Secado
            const washAndDry = new ServiceType();
            washAndDry.id = 'servicetype-002';
            washAndDry.name = 'Lavado y Secado';
            washAndDry.description = 'Lavado profundo y secado profesional';
            washAndDry.category = 'hair';
            washAndDry.subCategory = 'lavado';
            washAndDry.duration = { min: 20, max: 45, default: 30, increment: 5 };
            washAndDry.requirements = {
                siteTypes: ['sitetype-002'], // washstation
                equipment: ['lavabo', 'secador', 'toallas'],
                products: ['shampoo-premium', 'acondicionador-hidratante'],
                stylistSkills: ['lavado-especializado'],
                certifications: []
            };
            washAndDry.pricing = {
                basePrice: 15000,
                currency: 'COP',
                priceVariations: { seniorStylist: 5000, peakHours: 2500, weekend: 3000, holiday: 5000 },
                discounts: { loyalty: 10, bulk: 20, firstTime: 15 }
            };
            washAndDry.visualRepresentation = {
                color: '#4ECDC4',
                icon: 'water-drop',
                effectsConfig: { particleEffect: true, colorOverlay: '#E8F8F8', animationType: 'pulse', intensity: 0.6 }
            };
            
            // Servicio 3: Peinado y Styling
            const styling = new ServiceType();
            styling.id = 'servicetype-003';
            styling.name = 'Peinado y Styling';
            styling.description = 'Peinado profesional para eventos especiales';
            styling.category = 'hair';
            styling.subCategory = 'peinado';
            styling.duration = { min: 45, max: 120, default: 60, increment: 15 };
            styling.requirements = {
                siteTypes: ['sitetype-001'], // workstation
                equipment: ['secador', 'rizadora', 'plancha', 'cepillos'],
                products: ['gel', 'laca', 'serum'],
                stylistSkills: ['peinado-formal', 'peinado-casual'],
                certifications: ['certificacion-styling']
            };
            styling.pricing = {
                basePrice: 35000,
                currency: 'COP',
                priceVariations: { seniorStylist: 15000, peakHours: 7500, weekend: 10000, holiday: 15000 },
                discounts: { loyalty: 15, bulk: 20, firstTime: 25 }
            };
            styling.visualRepresentation = {
                color: '#A569BD',
                icon: 'styling-tool',
                effectsConfig: { particleEffect: true, colorOverlay: '#F4E7F7', animationType: 'glow', intensity: 0.8 }
            };
            
            // Servicio 4: Tratamiento Capilar
            const treatment = new ServiceType();
            treatment.id = 'servicetype-004';
            treatment.name = 'Tratamiento Capilar';
            treatment.description = 'Tratamiento intensivo de hidratación y reparación';
            treatment.category = 'hair';
            treatment.subCategory = 'tratamiento';
            treatment.duration = { min: 60, max: 90, default: 75, increment: 15 };
            treatment.requirements = {
                siteTypes: ['sitetype-002'], // washstation
                equipment: ['vaporizador', 'toallas-calientes'],
                products: ['mascarilla-hidratante', 'ampolla-reparadora'],
                stylistSkills: ['tratamientos-especializados'],
                certifications: ['certificacion-tratamientos']
            };
            treatment.pricing = {
                basePrice: 45000,
                currency: 'COP',
                priceVariations: { seniorStylist: 20000, peakHours: 10000, weekend: 12500, holiday: 20000 },
                discounts: { loyalty: 20, bulk: 25, firstTime: 30 }
            };
            treatment.visualRepresentation = {
                color: '#52C41A',
                icon: 'leaf',
                effectsConfig: { particleEffect: true, colorOverlay: '#E8F5E8', animationType: 'pulse', intensity: 0.9 }
            };
            
            // Servicio 5: Manicure
            const manicure = new ServiceType();
            manicure.id = 'servicetype-005';
            manicure.name = 'Manicure';
            manicure.description = 'Cuidado completo de uñas de manos';
            manicure.category = 'nails';
            manicure.subCategory = 'manicure';
            manicure.duration = { min: 45, max: 90, default: 60, increment: 15 };
            manicure.requirements = {
                siteTypes: ['sitetype-001'], // workstation con mesa especial
                equipment: ['mesa-manicure', 'lampara-uv', 'herramientas-uñas'],
                products: ['esmaltes', 'base', 'top-coat'],
                stylistSkills: ['manicure-basico', 'nail-art'],
                certifications: ['certificacion-manicure']
            };
            manicure.pricing = {
                basePrice: 30000,
                currency: 'COP',
                priceVariations: { seniorStylist: 12000, peakHours: 6000, weekend: 8000, holiday: 12000 },
                discounts: { loyalty: 15, bulk: 20, firstTime: 25 }
            };
            manicure.visualRepresentation = {
                color: '#FF69B4',
                icon: 'nail-polish',
                effectsConfig: { particleEffect: false, colorOverlay: '#FFE5F1', animationType: 'glow', intensity: 0.6 }
            };
            
            // Servicio 6: Consulta Inicial
            const consultation = new ServiceType();
            consultation.id = 'servicetype-006';
            consultation.name = 'Consulta Inicial';
            consultation.description = 'Consulta y evaluación del estado del cabello';
            consultation.category = 'consultation';
            consultation.subCategory = 'evaluacion';
            consultation.duration = { min: 15, max: 30, default: 20, increment: 5 };
            consultation.requirements = {
                siteTypes: ['sitetype-003'], // reception
                equipment: ['lupa', 'camara-microscópica'],
                products: [],
                stylistSkills: ['diagnostico-capilar'],
                certifications: ['certificacion-consulta']
            };
            consultation.pricing = {
                basePrice: 10000,
                currency: 'COP',
                priceVariations: { seniorStylist: 5000, peakHours: 0, weekend: 0, holiday: 0 },
                discounts: { loyalty: 0, bulk: 0, firstTime: 100 } // Gratis para nuevos clientes
            };
            consultation.visualRepresentation = {
                color: '#1890FF',
                icon: 'consultation',
                effectsConfig: { particleEffect: false, colorOverlay: '#E6F7FF', animationType: 'none', intensity: 0.3 }
            };
            
            // Configurar disponibilidad estándar
            [haircut, washAndDry, styling, treatment, manicure, consultation].forEach(service => {
                service.availability = {
                    daysOfWeek: [1, 2, 3, 4, 5, 6], // Lunes a sábado
                    timeSlots: [{ start: '08:00', end: '18:00' }],
                    seasonalAvailability: [
                        { season: 'spring', isAvailable: true },
                        { season: 'summer', isAvailable: true },
                        { season: 'autumn', isAvailable: true },
                        { season: 'winter', isAvailable: true }
                    ],
                    blackoutDates: []
                };
                
                service.businessRules = {
                    maxConcurrent: 1,
                    bufferTime: 15,
                    cancellationPolicy: {
                        allowCancellation: true,
                        freeWithinHours: 24,
                        penaltyPercentage: 0
                    },
                    reschedulePolicy: {
                        allowReschedule: true,
                        freeWithinHours: 24,
                        maxReschedules: 3
                    },
                    noShowPolicy: {
                        waitingTime: 15,
                        penaltyPercentage: 50
                    }
                };
                
                service.statistics = {
                    popularity: Math.floor(Math.random() * 50) + 50, // 50-100
                    averageRating: Math.random() * 2 + 3, // 3-5
                    totalBookings: Math.floor(Math.random() * 100),
                    averageDuration: service.duration.default,
                    revenue: 0
                };
            });
            
            mockServiceTypes.push(haircut, washAndDry, styling, treatment, manicure, consultation);
            this.storageService.set(this.STORAGE_KEY, mockServiceTypes);
        }
    }

    private getServiceTypesFromStorage(): ServiceType[] {
        const rawServiceTypes = this.storageService.get<any[]>(this.STORAGE_KEY) || [];
        return rawServiceTypes.map(rawServiceType => this.convertToServiceTypeInstance(rawServiceType));
    }

    private convertToServiceTypeInstance(rawServiceType: any): ServiceType {
        const serviceType = new ServiceType();
        // Copiar todas las propiedades del objeto plano a la instancia de ServiceType
        Object.assign(serviceType, rawServiceType);
        return serviceType;
    }

    getServiceTypes(pagination: Pagination): Observable<{ data: ServiceType[], count: number }> {
        let filteredServiceTypes = [...this.getServiceTypesFromStorage()];
        
        if (pagination.filters) {
            const filters = pagination.filters.split('&');
            filters.forEach((filter: string) => {
                const [key, value] = filter.split('=');
                if (key && value) {
                    filteredServiceTypes = filteredServiceTypes.filter(serviceType => {
                        const fieldValue = serviceType[key as keyof ServiceType];
                        return fieldValue?.toString() === value;
                    });
                }
            });
        }

        if (pagination.sort) {
            const [field, direction] = pagination.sort.split(',');
            filteredServiceTypes.sort((a, b) => {
                const aValue = a[field as keyof ServiceType];
                const bValue = b[field as keyof ServiceType];
                
                if (aValue == null || bValue == null) return 0;
                
                return direction === 'desc' 
                    ? bValue > aValue ? 1 : -1 
                    : aValue > bValue ? 1 : -1;
            });
        }

        const start = pagination.offset * pagination.limit;
        const end = start + pagination.limit;
        const paginatedServiceTypes = filteredServiceTypes.slice(start, end);

        return of({
            data: paginatedServiceTypes,
            count: filteredServiceTypes.length
        }).pipe(delay(this.DELAY_MS));
    }

    get(id: string): Observable<ServiceType> {
        const serviceTypes = this.getServiceTypesFromStorage();
        const serviceType = serviceTypes.find(st => st.id === id);
        return of(serviceType ? serviceType : new ServiceType()).pipe(delay(this.DELAY_MS));
    }

    post(entity: ServiceType): Observable<ServiceType> {
        const serviceTypes = this.getServiceTypesFromStorage();
        const newId = `servicetype-${(serviceTypes.length + 1).toString().padStart(3, '0')}`;
        const newServiceType = new ServiceType();
        
        Object.assign(newServiceType, entity);
        newServiceType.id = newId;
        
        serviceTypes.push(newServiceType);
        this.storageService.set(this.STORAGE_KEY, serviceTypes);
        return of(newServiceType).pipe(delay(this.DELAY_MS));
    }

    put(entity: ServiceType, id: string): Observable<ServiceType> {
        const serviceTypes = this.getServiceTypesFromStorage();
        const index = serviceTypes.findIndex(st => st.id === id);
        if (index !== -1) {
            const updatedServiceType = new ServiceType();
            Object.assign(updatedServiceType, entity);
            updatedServiceType.id = id;
            
            serviceTypes[index] = updatedServiceType;
            this.storageService.set(this.STORAGE_KEY, serviceTypes);
            return of(serviceTypes[index]).pipe(delay(this.DELAY_MS));
        }
        return of(entity).pipe(delay(this.DELAY_MS));
    }

    patch(entity: Partial<ServiceType>, id: string): Observable<ServiceType> {
        const serviceTypes = this.getServiceTypesFromStorage();
        const index = serviceTypes.findIndex(st => st.id === id);
        if (index !== -1) {
            Object.assign(serviceTypes[index], entity);
            this.storageService.set(this.STORAGE_KEY, serviceTypes);
            return of(serviceTypes[index]).pipe(delay(this.DELAY_MS));
        }
        return of(entity as ServiceType).pipe(delay(this.DELAY_MS));
    }

    delete(id: string): Observable<any> {
        const serviceTypes = this.getServiceTypesFromStorage();
        const index = serviceTypes.findIndex(st => st.id === id);
        if (index !== -1) {
            serviceTypes.splice(index, 1);
            this.storageService.set(this.STORAGE_KEY, serviceTypes);
        }
        return of({ success: true }).pipe(delay(this.DELAY_MS));
    }

    // Métodos específicos
    getByCategory(category: string): Observable<ServiceType[]> {
        const serviceTypes = this.getServiceTypesFromStorage();
        const filteredTypes = serviceTypes.filter(st => st.category === category);
        return of(filteredTypes).pipe(delay(this.DELAY_MS));
    }

    getActiveServiceTypes(): Observable<ServiceType[]> {
        const serviceTypes = this.getServiceTypesFromStorage();
        const activeTypes = serviceTypes.filter(st => st.isActive && !st.isDeleted);
        return of(activeTypes).pipe(delay(this.DELAY_MS));
    }

    getServiceTypesForSiteType(siteTypeId: string): Observable<ServiceType[]> {
        const serviceTypes = this.getServiceTypesFromStorage();
        const compatibleServices = serviceTypes.filter(st => 
            st.requirements.siteTypes.includes(siteTypeId) || 
            st.requirements.siteTypes.length === 0
        );
        return of(compatibleServices).pipe(delay(this.DELAY_MS));
    }
} 