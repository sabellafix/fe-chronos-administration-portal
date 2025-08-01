export class Site {
    // Propiedades básicas existentes
    Id: string;
    Name: string;
    Description: string;
    CreatedAt: Date;
    UpdatedAt: Date;
    IsActive: boolean;
    IsDeleted: boolean;
    IsSystem: boolean;
    IsDefault: boolean;
    IsPublic: boolean;
    IsPrivate: boolean;

    // Propiedades espaciales
    positionX: number;           // Coordenada X en el plano del salón
    positionY: number;           // Coordenada Y en el plano del salón
    floorId: string;             // ID del piso donde se encuentra
    rotation: number;            // Rotación en grados (0-360)
    width: number;               // Ancho del sitio en metros
    height: number;              // Alto del sitio en metros
    depth: number;               // Profundidad del sitio en metros

    // Estados operativos
    isOccupied: boolean;         // Si está actualmente ocupado
    isReserved: boolean;         // Si está reservado para una cita próxima
    isOutOfService: boolean;     // Si está fuera de servicio
    occupancyStatus: 'available' | 'occupied' | 'reserved' | 'maintenance' | 'blocked';

    // Tipo y configuración del sitio
    siteTypeId: string;          // ID del tipo de sitio (silla, lavabo, etc.)
    capacity: number;            // Número de personas que puede atender
    priority: number;            // Prioridad de asignación (1-10)

    // Servicios que se pueden ejecutar
    allowedServiceIds: string[]; // IDs de servicios permitidos en este sitio
    currentBookingId?: string;   // ID de la reserva actual (si está ocupado)

    // Configuración para Three.js
    threeJsConfig: {
        modelPath?: string;      // Ruta al modelo 3D personalizado
        color: string;           // Color principal del sitio
        materialType: 'basic' | 'lambert' | 'phong' | 'standard'; // Tipo de material
        opacity: number;         // Opacidad (0-1)
        castShadow: boolean;     // Si proyecta sombras
        receiveShadow: boolean;  // Si recibe sombras
        highlightColor: string;  // Color cuando está seleccionado
        occupiedColor: string;   // Color cuando está ocupado
        reservedColor: string;   // Color cuando está reservado
        scale: {                 // Escala del objeto 3D
            x: number;
            y: number;
            z: number;
        };
        offset: {                // Offset para ajuste fino de posición
            x: number;
            y: number;
            z: number;
        };
    };

    // Metadatos adicionales
    tags: string[];              // Etiquetas para categorización
    notes: string;               // Notas adicionales

    constructor() {
        this.Id = '';
        this.Name = '';
        this.Description = '';
        this.CreatedAt = new Date();
        this.UpdatedAt = new Date();
        this.IsActive = true;
        this.IsDeleted = false;
        this.IsSystem = false;
        this.IsDefault = false;
        this.IsPublic = false;
        this.IsPrivate = false;

        // Inicialización de propiedades espaciales
        this.positionX = 0;
        this.positionY = 0;
        this.floorId = '';
        this.rotation = 0;
        this.width = 1;
        this.height = 1;
        this.depth = 1;

        // Inicialización de estados
        this.isOccupied = false;
        this.isReserved = false;
        this.isOutOfService = false;
        this.occupancyStatus = 'available';

        // Inicialización de configuración
        this.siteTypeId = '';
        this.capacity = 1;
        this.priority = 5;
        this.allowedServiceIds = [];

        // Configuración Three.js por defecto
        this.threeJsConfig = {
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

        this.tags = [];
        this.notes = '';
    }

    // Métodos de utilidad
    isAvailable(): boolean {
        return this.IsActive && 
               !this.IsDeleted && 
               !this.isOccupied && 
               !this.isReserved && 
               !this.isOutOfService &&
               this.occupancyStatus === 'available';
    }

    getCurrentColor(): string {
        if (this.isOccupied) return this.threeJsConfig.occupiedColor;
        if (this.isReserved) return this.threeJsConfig.reservedColor;
        if (this.isOutOfService) return '#808080';
        return this.threeJsConfig.color;
    }

    getPosition3D(): { x: number, y: number, z: number } {
        return {
            x: this.positionX + this.threeJsConfig.offset.x,
            y: this.threeJsConfig.offset.y,
            z: this.positionY + this.threeJsConfig.offset.z
        };
    }
}