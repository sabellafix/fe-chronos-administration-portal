import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Floor } from '@app/core/models/bussiness/floor/floor';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { StorageService } from '../shared/storage.service';

@Injectable({
    providedIn: 'root'
})
export class MockFloorService {
    private readonly STORAGE_KEY = 'MOCK_FLOORS';
    private readonly DELAY_MS = 500;

    constructor(private storageService: StorageService) {
        this.initializeMockData();
    }

    private initializeMockData(): void {
        const existingFloors = this.storageService.get<Floor[]>(this.STORAGE_KEY);
        if (!existingFloors || existingFloors.length === 0) {
            const mockFloors: Floor[] = [];
            
            // Crear 2 pisos estándar
            for (let i = 1; i <= 2; i++) {
                const floor = new Floor();
                floor.id = `floor-${i.toString().padStart(3, '0')}`;
                floor.name = `Piso ${i}`;
                floor.description = `${i === 1 ? 'Planta baja' : 'Primer piso'} del salón de belleza`;
                floor.floorNumber = i - 1; // 0 = planta baja, 1 = primer piso
                floor.buildingId = 'building-001';
                
                // Configuración estándar del piso
                floor.width = 12; // 12 metros de ancho
                floor.depth = 10; // 10 metros de profundidad
                floor.height = 3.5; // 3.5 metros de altura
                floor.gridSize = 1; // Cuadrícula de 1x1 metro
                floor.gridWidth = 12; // 12 celdas de ancho
                floor.gridDepth = 10; // 10 celdas de profundidad
                
                // Configuración visual específica por piso
                if (i === 1) {
                    // Planta baja - tonos cálidos
                    floor.floorConfig.floorColor = '#D2B48C'; // Beige
                    floor.floorConfig.gridColor = '#A0A0A0';
                    floor.floorConfig.wallColor = '#F5F5DC'; // Beige claro
                } else {
                    // Primer piso - tonos frescos
                    floor.floorConfig.floorColor = '#E6E6FA'; // Lavanda claro
                    floor.floorConfig.gridColor = '#A0A0A0';
                    floor.floorConfig.wallColor = '#F0F8FF'; // Azul alice
                }
                
                floor.floorConfig.showGrid = true;
                floor.floorConfig.showWalls = true;
                
                // Iluminación específica por piso
                floor.floorConfig.ambientLight = {
                    color: '#FFFFFF',
                    intensity: i === 1 ? 0.7 : 0.6 // Más luz en planta baja
                };
                
                floor.floorConfig.directionalLight = {
                    color: '#FFFFFF',
                    intensity: 0.8,
                    position: { x: 6, y: 8, z: 5 }
                };
                
                // Áreas bloqueadas estándar (paredes perimetrales)
                floor.addBlockedArea(0, 0, 12, 1, 'wall', 'Pared norte');
                floor.addBlockedArea(0, 9, 12, 1, 'wall', 'Pared sur');
                floor.addBlockedArea(0, 0, 1, 10, 'wall', 'Pared oeste');
                floor.addBlockedArea(11, 0, 1, 10, 'wall', 'Pared este');
                
                // Columnas estructurales en posiciones estratégicas
                floor.addBlockedArea(4, 4, 1, 1, 'column', 'Columna central izquierda');
                floor.addBlockedArea(7, 4, 1, 1, 'column', 'Columna central derecha');
                
                // Área de equipamiento técnico
                floor.addBlockedArea(1, 8, 2, 1, 'equipment', 'Área de equipamiento técnico');
                
                floor.createdAt = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
                floor.updatedAt = new Date();
                floor.isActive = true;
                floor.isDeleted = false;
                floor.isDefault = i === 1; // Primer piso como default
                
                mockFloors.push(floor);
            }
            
            this.storageService.set(this.STORAGE_KEY, mockFloors);
        }
    }

    private getFloorsFromStorage(): Floor[] {
        const rawFloors = this.storageService.get<any[]>(this.STORAGE_KEY) || [];
        return rawFloors.map(rawFloor => this.convertToFloorInstance(rawFloor));
    }

    private convertToFloorInstance(rawFloor: any): Floor {
        const floor = new Floor();
        // Copiar todas las propiedades del objeto plano a la instancia de Floor
        Object.assign(floor, rawFloor);
        return floor;
    }

    getFloors(pagination: Pagination): Observable<{ data: Floor[], count: number }> {
        let filteredFloors = [...this.getFloorsFromStorage()];
        
        if (pagination.filters) {
            const filters = pagination.filters.split('&');
            filters.forEach((filter: string) => {
                const [key, value] = filter.split('=');
                if (key && value) {
                    filteredFloors = filteredFloors.filter(floor => {
                        const fieldValue = floor[key as keyof Floor];
                        return fieldValue?.toString() === value;
                    });
                }
            });
        }

        if (pagination.sort) {
            const [field, direction] = pagination.sort.split(',');
            filteredFloors.sort((a, b) => {
                const aValue = a[field as keyof Floor];
                const bValue = b[field as keyof Floor];
                
                if (aValue == null || bValue == null) return 0;
                
                return direction === 'desc' 
                    ? bValue > aValue ? 1 : -1 
                    : aValue > bValue ? 1 : -1;
            });
        }

        const start = pagination.offset * pagination.limit;
        const end = start + pagination.limit;
        const paginatedFloors = filteredFloors.slice(start, end);

        return of({
            data: paginatedFloors,
            count: filteredFloors.length
        }).pipe(delay(this.DELAY_MS));
    }

    get(id: string): Observable<Floor> {
        const floors = this.getFloorsFromStorage();
        const floor = floors.find(f => f.id === id);
        return of(floor ? floor : new Floor()).pipe(delay(this.DELAY_MS));
    }

    post(entity: Floor): Observable<Floor> {
        const floors = this.getFloorsFromStorage();
        const newId = `floor-${(floors.length + 1).toString().padStart(3, '0')}`;
        const newFloor = new Floor();
        
        // Copiar propiedades de la entidad recibida
        Object.assign(newFloor, entity);
        newFloor.id = newId;
        
        floors.push(newFloor);
        this.storageService.set(this.STORAGE_KEY, floors);
        return of(newFloor).pipe(delay(this.DELAY_MS));
    }

    put(entity: Floor, id: string): Observable<Floor> {
        const floors = this.getFloorsFromStorage();
        const index = floors.findIndex(f => f.id === id);
        if (index !== -1) {
            const updatedFloor = new Floor();
            Object.assign(updatedFloor, entity);
            updatedFloor.id = id;
            
            floors[index] = updatedFloor;
            this.storageService.set(this.STORAGE_KEY, floors);
            return of(floors[index]).pipe(delay(this.DELAY_MS));
        }
        return of(entity).pipe(delay(this.DELAY_MS));
    }

    patch(entity: Partial<Floor>, id: string): Observable<Floor> {
        const floors = this.getFloorsFromStorage();
        const index = floors.findIndex(f => f.id === id);
        if (index !== -1) {
            // Actualizar solo las propiedades proporcionadas
            Object.assign(floors[index], entity);
            this.storageService.set(this.STORAGE_KEY, floors);
            return of(floors[index]).pipe(delay(this.DELAY_MS));
        }
        return of(entity as Floor).pipe(delay(this.DELAY_MS));
    }

    delete(id: string): Observable<any> {
        const floors = this.getFloorsFromStorage();
        const index = floors.findIndex(f => f.id === id);
        if (index !== -1) {
            floors.splice(index, 1);
            this.storageService.set(this.STORAGE_KEY, floors);
        }
        return of({ success: true }).pipe(delay(this.DELAY_MS));
    }

    // Método específico para obtener el piso por defecto
    getDefaultFloor(): Observable<Floor> {
        const floors = this.getFloorsFromStorage();
        const defaultFloor = floors.find(f => f.isDefault) || floors[0] || new Floor();
        return of(defaultFloor).pipe(delay(this.DELAY_MS));
    }

    // Método para obtener pisos activos
    getActiveFloors(): Observable<Floor[]> {
        const floors = this.getFloorsFromStorage();
        const activeFloors = floors.filter(f => f.isActive && !f.isDeleted);
        return of(activeFloors).pipe(delay(this.DELAY_MS));
    }
} 