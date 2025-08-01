import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Site } from '@app/core/models/bussiness/floor/site';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { StorageService } from '../shared/storage.service';

@Injectable({
    providedIn: 'root'
})
export class MockSiteService {
    private readonly STORAGE_KEY = 'MOCK_SITES';
    private readonly DELAY_MS = 500;

    constructor(private storageService: StorageService) {
        this.initializeMockData();
    }

    private initializeMockData(): void {
        const existingSites = this.storageService.get<Site[]>(this.STORAGE_KEY);
        if (!existingSites || existingSites.length === 0) {
            const mockSites: Site[] = [];
            
            // Configuración estándar de sitios por piso
            const floorConfigs = [
                {
                    floorId: 'floor-001',
                    floorName: 'Piso 1',
                    workstations: 10,
                    washstations: 5,
                    reception: 1,
                    waiting: 5,
                    storage: 3
                },
                {
                    floorId: 'floor-002', 
                    floorName: 'Piso 2',
                    workstations: 10,
                    washstations: 5,
                    reception: 0, // Solo en piso 1
                    waiting: 5,
                    storage: 3
                }
            ];

            let siteCounter = 1;

            floorConfigs.forEach(config => {
                const sitesForFloor: Site[] = [];

                // WORKSTATIONS - Área principal central (10 sitios)
                // Distribuir en 2 filas de 5 con mayor separación
                for (let i = 0; i < config.workstations; i++) {
                    const site = this.createBaseSite(siteCounter++, config.floorId, 'sitetype-001');
                    site.Name = `Estación ${i + 1} - ${config.floorName}`;
                    site.Description = `Estación de trabajo principal ${i + 1}`;
                    
                    // Posicionamiento: 2 filas de 5 en el centro con más espacio
                    const row = Math.floor(i / 5); // 0 o 1
                    const col = i % 5; // 0-4
                    site.positionX = 3 + col * 2.5; // Empezar en X=3, separación 2.5m (1 unidad más)
                    site.positionY = 3 + row * 3; // Empezar en Y=3, separación 3m (1 unidad más)
                    
                    site.threeJsConfig.color = '#8B4513'; // Marrón para workstations
                    sitesForFloor.push(site);
                }

                // WASHSTATIONS - Lado izquierdo (5 sitios)
                for (let i = 0; i < config.washstations; i++) {
                    const site = this.createBaseSite(siteCounter++, config.floorId, 'sitetype-002');
                    site.Name = `Lavabo ${i + 1} - ${config.floorName}`;
                    site.Description = `Estación de lavado ${i + 1}`;
                    
                    // Posicionamiento: columna vertical en el lado izquierdo
                    site.positionX = 1; // Lado izquierdo
                    site.positionY = 2 + i * 1.2; // Distribución vertical
                    
                    site.threeJsConfig.color = '#4169E1'; // Azul para washstations
                    sitesForFloor.push(site);
                }

                // RECEPTION - Solo en piso 1, esquina superior derecha
                if (config.reception > 0) {
                    const site = this.createBaseSite(siteCounter++, config.floorId, 'sitetype-003');
                    site.Name = `Recepción - ${config.floorName}`;
                    site.Description = 'Área de recepción principal';
                    
                    site.positionX = 9; // Esquina derecha
                    site.positionY = 1; // Parte superior
                    site.width = 2; // Más ancho que otros sitios
                    
                    site.threeJsConfig.color = '#FF1493'; // Rosa para recepción
                    site.threeJsConfig.scale = { x: 2, y: 1, z: 1 }; // Escalado horizontal
                    sitesForFloor.push(site);
                }

                // WAITING - Área de espera frontal (5 sitios)
                for (let i = 0; i < config.waiting; i++) {
                    const site = this.createBaseSite(siteCounter++, config.floorId, 'sitetype-004');
                    site.Name = `Espera ${i + 1} - ${config.floorName}`;
                    site.Description = `Silla de espera ${i + 1}`;
                    
                    // Posicionamiento: fila frontal horizontal
                    site.positionX = 2 + i * 1.5; // Distribución horizontal frontal
                    site.positionY = 1; // Parte frontal
                    
                    site.threeJsConfig.color = '#32CD32'; // Verde para waiting
                    sitesForFloor.push(site);
                }

                // STORAGE - Área posterior (3 sitios)
                for (let i = 0; i < config.storage; i++) {
                    const site = this.createBaseSite(siteCounter++, config.floorId, 'sitetype-005');
                    site.Name = `Almacén ${i + 1} - ${config.floorName}`;
                    site.Description = `Área de almacenamiento ${i + 1}`;
                    
                    // Posicionamiento: área posterior
                    site.positionX = 2 + i * 3; // Distribución espaciada en la parte posterior
                    site.positionY = 8; // Parte posterior
                    
                    site.threeJsConfig.color = '#696969'; // Gris para storage
                    site.threeJsConfig.opacity = 0.7; // Menos prominente
                    sitesForFloor.push(site);
                }

                mockSites.push(...sitesForFloor);
            });

            this.storageService.set(this.STORAGE_KEY, mockSites);
        }
    }

    private createBaseSite(counter: number, floorId: string, siteTypeId: string): Site {
        const site = new Site();
        site.Id = `site-${counter.toString().padStart(3, '0')}`;
        site.floorId = floorId;
        site.siteTypeId = siteTypeId;
        site.CreatedAt = new Date(Date.now() - counter * 60 * 60 * 1000); // Escalonado en horas
        site.UpdatedAt = new Date();
        site.IsActive = true;
        site.IsDeleted = false;
        site.IsSystem = false;
        site.IsDefault = false;
        site.IsPublic = true;
        site.IsPrivate = false;

        // Estados operativos aleatorios para demostración
        const random = Math.random();
        if (random < 0.7) {
            site.occupancyStatus = 'available';
            site.isOccupied = false;
            site.isReserved = false;
        } else if (random < 0.85) {
            site.occupancyStatus = 'occupied';
            site.isOccupied = true;
            site.isReserved = false;
        } else if (random < 0.95) {
            site.occupancyStatus = 'reserved';
            site.isOccupied = false;
            site.isReserved = true;
        } else {
            site.occupancyStatus = 'maintenance';
            site.isOutOfService = true;
        }

        // Configuración física por defecto
        site.rotation = 0;
        site.width = 1.5;
        site.height = 1.2;
        site.depth = 1.5;
        site.capacity = 1;
        site.priority = 5;

        // Servicios permitidos por defecto (se configurará después según tipo)
        site.allowedServiceIds = [];

        // Configuración Three.js por defecto
        site.threeJsConfig = {
            color: '#8B4513',
            materialType: 'lambert',
            opacity: 1.0,
            castShadow: true,
            receiveShadow: true,
            highlightColor: '#FFD700',
            occupiedColor: '#FF6B6B',
            reservedColor: '#4ECDC4',
            scale: { x: 1, y: 1, z: 1 },
            offset: { x: 0, y: 0, z: 0 }
        };

        site.tags = [];
        site.notes = '';

        return site;
    }

    private getSitesFromStorage(): Site[] {
        const rawSites = this.storageService.get<any[]>(this.STORAGE_KEY) || [];
        return rawSites.map(rawSite => this.convertToSiteInstance(rawSite));
    }

    private convertToSiteInstance(rawSite: any): Site {
        const site = new Site();
        // Copiar todas las propiedades del objeto plano a la instancia de Site
        Object.assign(site, rawSite);
        return site;
    }

    getSites(pagination: Pagination): Observable<{ data: Site[], count: number }> {
        let filteredSites = [...this.getSitesFromStorage()];
        
        if (pagination.filters) {
            const filters = pagination.filters.split('&');
            filters.forEach((filter: string) => {
                const [key, value] = filter.split('=');
                if (key && value) {
                    filteredSites = filteredSites.filter(site => {
                        const fieldValue = site[key as keyof Site];
                        return fieldValue?.toString() === value;
                    });
                }
            });
        }

        if (pagination.sort) {
            const [field, direction] = pagination.sort.split(',');
            filteredSites.sort((a, b) => {
                const aValue = a[field as keyof Site];
                const bValue = b[field as keyof Site];
                
                if (aValue == null || bValue == null) return 0;
                
                return direction === 'desc' 
                    ? bValue > aValue ? 1 : -1 
                    : aValue > bValue ? 1 : -1;
            });
        }

        const start = pagination.offset * pagination.limit;
        const end = start + pagination.limit;
        const paginatedSites = filteredSites.slice(start, end);

        return of({
            data: paginatedSites,
            count: filteredSites.length
        }).pipe(delay(this.DELAY_MS));
    }

    get(id: string): Observable<Site> {
        const sites = this.getSitesFromStorage();
        const site = sites.find(s => s.Id === id);
        return of(site ? site : new Site()).pipe(delay(this.DELAY_MS));
    }

    post(entity: Site): Observable<Site> {
        const sites = this.getSitesFromStorage();
        const newId = `site-${(sites.length + 1).toString().padStart(3, '0')}`;
        const newSite = new Site();
        
        Object.assign(newSite, entity);
        newSite.Id = newId;
        
        sites.push(newSite);
        this.storageService.set(this.STORAGE_KEY, sites);
        return of(newSite).pipe(delay(this.DELAY_MS));
    }

    put(entity: Site, id: string): Observable<Site> {
        const sites = this.getSitesFromStorage();
        const index = sites.findIndex(s => s.Id === id);
        if (index !== -1) {
            const updatedSite = new Site();
            Object.assign(updatedSite, entity);
            updatedSite.Id = id;
            
            sites[index] = updatedSite;
            this.storageService.set(this.STORAGE_KEY, sites);
            return of(sites[index]).pipe(delay(this.DELAY_MS));
        }
        return of(entity).pipe(delay(this.DELAY_MS));
    }

    patch(entity: Partial<Site>, id: string): Observable<Site> {
        const sites = this.getSitesFromStorage();
        const index = sites.findIndex(s => s.Id === id);
        if (index !== -1) {
            Object.assign(sites[index], entity);
            this.storageService.set(this.STORAGE_KEY, sites);
            return of(sites[index]).pipe(delay(this.DELAY_MS));
        }
        return of(entity as Site).pipe(delay(this.DELAY_MS));
    }

    delete(id: string): Observable<any> {
        const sites = this.getSitesFromStorage();
        const index = sites.findIndex(s => s.Id === id);
        if (index !== -1) {
            sites.splice(index, 1);
            this.storageService.set(this.STORAGE_KEY, sites);
        }
        return of({ success: true }).pipe(delay(this.DELAY_MS));
    }

    // Métodos específicos
    getSitesByFloor(floorId: string): Observable<Site[]> {
        const sites = this.getSitesFromStorage();
        const floorSites = sites.filter(s => s.floorId === floorId);
        return of(floorSites).pipe(delay(this.DELAY_MS));
    }

    getAvailableSites(floorId?: string): Observable<Site[]> {
        let sites = this.getSitesFromStorage();
        if (floorId) {
            sites = sites.filter(s => s.floorId === floorId);
        }
        const availableSites = sites.filter(s => s.isAvailable());
        return of(availableSites).pipe(delay(this.DELAY_MS));
    }

    getSitesByType(siteTypeId: string, floorId?: string): Observable<Site[]> {
        let sites = this.getSitesFromStorage();
        if (floorId) {
            sites = sites.filter(s => s.floorId === floorId);
        }
        const typedSites = sites.filter(s => s.siteTypeId === siteTypeId);
        return of(typedSites).pipe(delay(this.DELAY_MS));
    }

    updateSiteStatus(id: string, status: 'available' | 'occupied' | 'reserved' | 'maintenance' | 'blocked'): Observable<Site> {
        const sites = this.getSitesFromStorage();
        const index = sites.findIndex(s => s.Id === id);
        if (index !== -1) {
            sites[index].occupancyStatus = status;
            sites[index].isOccupied = status === 'occupied';
            sites[index].isReserved = status === 'reserved';
            sites[index].isOutOfService = status === 'maintenance' || status === 'blocked';
            sites[index].UpdatedAt = new Date();
            
            this.storageService.set(this.STORAGE_KEY, sites);
            return of(sites[index]).pipe(delay(this.DELAY_MS));
        }
        return of(new Site()).pipe(delay(this.DELAY_MS));
    }

    // Método para obtener layout completo de un piso
    getFloorLayout(floorId: string): Observable<{ 
        sites: Site[], 
        workstations: Site[], 
        washstations: Site[], 
        reception: Site[], 
        waiting: Site[], 
        storage: Site[] 
    }> {
        const sites = this.getSitesFromStorage();
        const floorSites = sites.filter(s => s.floorId === floorId);
        
        const layout = {
            sites: floorSites,
            workstations: floorSites.filter(s => s.siteTypeId === 'sitetype-001'),
            washstations: floorSites.filter(s => s.siteTypeId === 'sitetype-002'),
            reception: floorSites.filter(s => s.siteTypeId === 'sitetype-003'),
            waiting: floorSites.filter(s => s.siteTypeId === 'sitetype-004'),
            storage: floorSites.filter(s => s.siteTypeId === 'sitetype-005')
        };
        
        return of(layout).pipe(delay(this.DELAY_MS));
    }
} 