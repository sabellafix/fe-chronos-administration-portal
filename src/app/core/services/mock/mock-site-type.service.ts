import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { SiteType } from '@app/core/models/bussiness/floor/siteType';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { StorageService } from '../shared/storage.service';

@Injectable({
    providedIn: 'root'
})
export class MockSiteTypeService {
    private readonly STORAGE_KEY = 'MOCK_SITE_TYPES';
    private readonly DELAY_MS = 500;

    constructor(private storageService: StorageService) {
        this.initializeMockData();
    }

    private initializeMockData(): void {
        const existingSiteTypes = this.storageService.get<SiteType[]>(this.STORAGE_KEY);
        if (!existingSiteTypes || existingSiteTypes.length === 0) {
            const mockSiteTypes: SiteType[] = [];
            
            // Tipo 1: Workstation (Estación de trabajo principal)
            const workstation = new SiteType();
            workstation.id = 'sitetype-001';
            workstation.name = 'Estación de Trabajo';
            workstation.description = 'Silla principal para servicios de cabello y belleza';
            workstation.category = 'workstation';
            workstation.subCategory = 'corte-peinado';
            workstation.maxCapacity = 1;
            workstation.requiresSpecialEquipment = false;
            workstation.equipmentList = ['silla-reclinable', 'espejo', 'mesa-auxiliar'];
            workstation.defaultDimensions = { width: 1.5, height: 1.2, depth: 1.5 };
            workstation.visualConfig.defaultColor = '#8B4513'; // Marrón
            workstation.visualConfig.stateColors = {
                available: '#4CAF50',
                occupied: '#F44336', 
                reserved: '#FF9800',
                maintenance: '#9E9E9E',
                outOfService: '#424242'
            };
            workstation.businessRules = {
                minBookingDuration: 30,
                maxBookingDuration: 180,
                bufferTime: 15,
                allowSimultaneousServices: false,
                requiresStylистSpecialization: true,
                priority: 8
            };
            
            // Tipo 2: Washstation (Lavabo)
            const washstation = new SiteType();
            washstation.id = 'sitetype-002';
            washstation.name = 'Lavabo';
            washstation.description = 'Estación para lavado y tratamientos capilares';
            washstation.category = 'washstation';
            washstation.subCategory = 'lavado-tratamiento';
            washstation.maxCapacity = 1;
            washstation.requiresSpecialEquipment = true;
            washstation.equipmentList = ['lavabo-reclinable', 'sistema-agua', 'dispensadores'];
            washstation.defaultDimensions = { width: 1.2, height: 1.5, depth: 2.0 };
            washstation.visualConfig.defaultColor = '#4169E1'; // Azul real
            washstation.visualConfig.stateColors = {
                available: '#87CEEB',
                occupied: '#FF6347',
                reserved: '#FFD700',
                maintenance: '#A9A9A9',
                outOfService: '#696969'
            };
            washstation.businessRules = {
                minBookingDuration: 15,
                maxBookingDuration: 60,
                bufferTime: 10,
                allowSimultaneousServices: false,
                requiresStylистSpecialization: true,
                priority: 7
            };
            
            // Tipo 3: Reception (Recepción)
            const reception = new SiteType();
            reception.id = 'sitetype-003';
            reception.name = 'Recepción';
            reception.description = 'Área de recepción y consulta inicial';
            reception.category = 'reception';
            reception.subCategory = 'atencion-cliente';
            reception.maxCapacity = 2;
            reception.requiresSpecialEquipment = false;
            reception.equipmentList = ['escritorio', 'sillas-espera', 'computador'];
            reception.defaultDimensions = { width: 2.0, height: 0.8, depth: 1.0 };
            reception.visualConfig.defaultColor = '#FF1493'; // Rosa intenso
            reception.visualConfig.stateColors = {
                available: '#98FB98',
                occupied: '#FF4500',
                reserved: '#FFA500',
                maintenance: '#D3D3D3',
                outOfService: '#808080'
            };
            reception.businessRules = {
                minBookingDuration: 10,
                maxBookingDuration: 30,
                bufferTime: 5,
                allowSimultaneousServices: true,
                requiresStylистSpecialization: false,
                priority: 10
            };
            
            // Tipo 4: Waiting (Área de espera)
            const waiting = new SiteType();
            waiting.id = 'sitetype-004';
            waiting.name = 'Área de Espera';
            waiting.description = 'Sillas para clientes en espera';
            waiting.category = 'waiting';
            waiting.subCategory = 'espera-cliente';
            waiting.maxCapacity = 1;
            waiting.requiresSpecialEquipment = false;
            waiting.equipmentList = ['silla-espera', 'mesa-centro'];
            waiting.defaultDimensions = { width: 0.8, height: 0.9, depth: 0.8 };
            waiting.visualConfig.defaultColor = '#32CD32'; // Verde lima
            waiting.visualConfig.stateColors = {
                available: '#90EE90',
                occupied: '#DC143C',
                reserved: '#DAA520',
                maintenance: '#C0C0C0',
                outOfService: '#778899'
            };
            waiting.businessRules = {
                minBookingDuration: 5,
                maxBookingDuration: 60,
                bufferTime: 0,
                allowSimultaneousServices: false,
                requiresStylистSpecialization: false,
                priority: 3
            };
            
            // Tipo 5: Storage (Almacenamiento)
            const storage = new SiteType();
            storage.id = 'sitetype-005';
            storage.name = 'Almacenamiento';
            storage.description = 'Área de almacenamiento de productos y equipos';
            storage.category = 'storage';
            storage.subCategory = 'almacen-productos';
            storage.maxCapacity = 0;
            storage.requiresSpecialEquipment = false;
            storage.equipmentList = ['estanteria', 'gabinetes', 'organizadores'];
            storage.defaultDimensions = { width: 1.0, height: 2.0, depth: 0.5 };
            storage.visualConfig.defaultColor = '#696969'; // Gris tenue
            storage.visualConfig.stateColors = {
                available: '#D3D3D3',
                occupied: '#B22222',
                reserved: '#DAA520',
                maintenance: '#A9A9A9',
                outOfService: '#2F4F4F'
            };
            storage.businessRules = {
                minBookingDuration: 0,
                maxBookingDuration: 0,
                bufferTime: 0,
                allowSimultaneousServices: true,
                requiresStylистSpecialization: false,
                priority: 1
            };
            
            // Configurar disponibilidad estándar para todos los tipos de trabajo
            [workstation, washstation, reception, waiting].forEach(siteType => {
                siteType.availability = {
                    workingHours: { start: '08:00', end: '18:00' },
                    workingDays: [1, 2, 3, 4, 5, 6], // Lunes a sábado
                    specialSchedules: []
                };
            });
            
            // El storage está disponible 24/7
            storage.availability = {
                workingHours: { start: '00:00', end: '23:59' },
                workingDays: [0, 1, 2, 3, 4, 5, 6], // Todos los días
                specialSchedules: []
            };
            
            mockSiteTypes.push(workstation, washstation, reception, waiting, storage);
            this.storageService.set(this.STORAGE_KEY, mockSiteTypes);
        }
    }

    private getSiteTypesFromStorage(): SiteType[] {
        const rawSiteTypes = this.storageService.get<any[]>(this.STORAGE_KEY) || [];
        return rawSiteTypes.map(rawSiteType => this.convertToSiteTypeInstance(rawSiteType));
    }

    private convertToSiteTypeInstance(rawSiteType: any): SiteType {
        const siteType = new SiteType();
        // Copiar todas las propiedades del objeto plano a la instancia de SiteType
        Object.assign(siteType, rawSiteType);
        return siteType;
    }

    getSiteTypes(pagination: Pagination): Observable<{ data: SiteType[], count: number }> {
        let filteredSiteTypes = [...this.getSiteTypesFromStorage()];
        
        if (pagination.filters) {
            const filters = pagination.filters.split('&');
            filters.forEach((filter: string) => {
                const [key, value] = filter.split('=');
                if (key && value) {
                    filteredSiteTypes = filteredSiteTypes.filter(siteType => {
                        const fieldValue = siteType[key as keyof SiteType];
                        return fieldValue?.toString() === value;
                    });
                }
            });
        }

        if (pagination.sort) {
            const [field, direction] = pagination.sort.split(',');
            filteredSiteTypes.sort((a, b) => {
                const aValue = a[field as keyof SiteType];
                const bValue = b[field as keyof SiteType];
                
                if (aValue == null || bValue == null) return 0;
                
                return direction === 'desc' 
                    ? bValue > aValue ? 1 : -1 
                    : aValue > bValue ? 1 : -1;
            });
        }

        const start = pagination.offset * pagination.limit;
        const end = start + pagination.limit;
        const paginatedSiteTypes = filteredSiteTypes.slice(start, end);

        return of({
            data: paginatedSiteTypes,
            count: filteredSiteTypes.length
        }).pipe(delay(this.DELAY_MS));
    }

    get(id: string): Observable<SiteType> {
        const siteTypes = this.getSiteTypesFromStorage();
        const siteType = siteTypes.find(st => st.id === id);
        return of(siteType ? siteType : new SiteType()).pipe(delay(this.DELAY_MS));
    }

    post(entity: SiteType): Observable<SiteType> {
        const siteTypes = this.getSiteTypesFromStorage();
        const newId = `sitetype-${(siteTypes.length + 1).toString().padStart(3, '0')}`;
        const newSiteType = new SiteType();
        
        Object.assign(newSiteType, entity);
        newSiteType.id = newId;
        
        siteTypes.push(newSiteType);
        this.storageService.set(this.STORAGE_KEY, siteTypes);
        return of(newSiteType).pipe(delay(this.DELAY_MS));
    }

    put(entity: SiteType, id: string): Observable<SiteType> {
        const siteTypes = this.getSiteTypesFromStorage();
        const index = siteTypes.findIndex(st => st.id === id);
        if (index !== -1) {
            const updatedSiteType = new SiteType();
            Object.assign(updatedSiteType, entity);
            updatedSiteType.id = id;
            
            siteTypes[index] = updatedSiteType;
            this.storageService.set(this.STORAGE_KEY, siteTypes);
            return of(siteTypes[index]).pipe(delay(this.DELAY_MS));
        }
        return of(entity).pipe(delay(this.DELAY_MS));
    }

    patch(entity: Partial<SiteType>, id: string): Observable<SiteType> {
        const siteTypes = this.getSiteTypesFromStorage();
        const index = siteTypes.findIndex(st => st.id === id);
        if (index !== -1) {
            Object.assign(siteTypes[index], entity);
            this.storageService.set(this.STORAGE_KEY, siteTypes);
            return of(siteTypes[index]).pipe(delay(this.DELAY_MS));
        }
        return of(entity as SiteType).pipe(delay(this.DELAY_MS));
    }

    delete(id: string): Observable<any> {
        const siteTypes = this.getSiteTypesFromStorage();
        const index = siteTypes.findIndex(st => st.id === id);
        if (index !== -1) {
            siteTypes.splice(index, 1);
            this.storageService.set(this.STORAGE_KEY, siteTypes);
        }
        return of({ success: true }).pipe(delay(this.DELAY_MS));
    }

    // Métodos específicos
    getByCategory(category: string): Observable<SiteType[]> {
        const siteTypes = this.getSiteTypesFromStorage();
        const filteredTypes = siteTypes.filter(st => st.category === category);
        return of(filteredTypes).pipe(delay(this.DELAY_MS));
    }

    getActiveSiteTypes(): Observable<SiteType[]> {
        const siteTypes = this.getSiteTypesFromStorage();
        const activeTypes = siteTypes.filter(st => st.isActive && !st.isDeleted);
        return of(activeTypes).pipe(delay(this.DELAY_MS));
    }
} 