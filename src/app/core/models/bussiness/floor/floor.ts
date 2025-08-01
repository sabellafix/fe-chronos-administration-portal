export class Floor {
    // Propiedades básicas
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    isDeleted: boolean;
    isDefault: boolean;

    // Propiedades específicas del piso
    floorNumber: number;         // Número del piso (0=planta baja, 1=primer piso, etc.)
    buildingId: string;          // ID del edificio al que pertenece
    
    // Dimensiones físicas
    width: number;               // Ancho en metros
    depth: number;               // Profundidad en metros
    height: number;              // Altura del techo en metros
    
    // Configuración de la cuadrícula
    gridSize: number;            // Tamaño de cada celda de la cuadrícula en metros
    gridWidth: number;           // Número de celdas en el ancho
    gridDepth: number;           // Número de celdas en la profundidad

    // Configuración visual para Three.js
    floorConfig: {
        floorColor: string;      // Color del piso
        gridColor: string;       // Color de las líneas de la cuadrícula
        wallColor: string;       // Color de las paredes
        showGrid: boolean;       // Si mostrar la cuadrícula
        showWalls: boolean;      // Si mostrar las paredes
        floorTexture?: string;   // Ruta a textura del piso
        wallTexture?: string;    // Ruta a textura de las paredes
        ambientLight: {          // Configuración de luz ambiental
            color: string;
            intensity: number;
        };
        directionalLight: {      // Configuración de luz direccional
            color: string;
            intensity: number;
            position: {
                x: number;
                y: number;
                z: number;
            };
        };
    };

    // Áreas bloqueadas (obstáculos)
    blockedAreas: {
        x: number;
        y: number;
        width: number;
        height: number;
        type: 'wall' | 'column' | 'decoration' | 'equipment' | 'other';
        description?: string;
    }[];

    // Estadísticas del piso
    totalSites: number;          // Total de sitios en este piso
    availableSites: number;      // Sitios disponibles
    occupiedSites: number;       // Sitios ocupados

    constructor() {
        this.id = '';
        this.name = '';
        this.description = '';
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.isActive = true;
        this.isDeleted = false;
        this.isDefault = false;

        this.floorNumber = 0;
        this.buildingId = '';
        
        this.width = 10;
        this.depth = 8;
        this.height = 3;
        
        this.gridSize = 1;
        this.gridWidth = 10;
        this.gridDepth = 8;

        this.floorConfig = {
            floorColor: '#FFFFFF',
            gridColor: '#1a293c',
            wallColor: '#F5F5DC',
            showGrid: true,
            showWalls: true,
            ambientLight: {
                color: '#FFFFFF',
                intensity: 0.6
            },
            directionalLight: {
                color: '#FFFFFF',
                intensity: 0.8,
                position: { x: 5, y: 10, z: 5 }
            }
        };

        this.blockedAreas = [];
        this.totalSites = 0;
        this.availableSites = 0;
        this.occupiedSites = 0;
    }

    // Métodos de utilidad
    isPositionBlocked(x: number, y: number): boolean {
        return this.blockedAreas.some(area => 
            x >= area.x && 
            x < area.x + area.width && 
            y >= area.y && 
            y < area.y + area.height
        );
    }

    isPositionValid(x: number, y: number): boolean {
        return x >= 0 && 
               x < this.gridWidth && 
               y >= 0 && 
               y < this.gridDepth && 
               !this.isPositionBlocked(x, y);
    }

    getOccupancyRate(): number {
        return this.totalSites > 0 ? (this.occupiedSites / this.totalSites) * 100 : 0;
    }

    addBlockedArea(x: number, y: number, width: number, height: number, type: string, description?: string): void {
        this.blockedAreas.push({
            x, y, width, height,
            type: type as any,
            description
        });
    }
} 