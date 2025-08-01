export class SiteType {
    // Propiedades básicas
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    isDeleted: boolean;
    isDefault: boolean;

    // Categorización del tipo de sitio
    category: 'workstation' | 'washstation' | 'treatment' | 'reception' | 'waiting' | 'storage' | 'other';
    subCategory: string;         // Subcategoría específica

    // Capacidades y limitaciones
    maxCapacity: number;         // Máximo número de personas que puede atender
    requiresSpecialEquipment: boolean;
    equipmentList: string[];     // Lista de equipamiento necesario

    // Servicios compatibles
    compatibleServiceIds: string[];   // IDs de servicios que se pueden realizar
    incompatibleServiceIds: string[]; // IDs de servicios que NO se pueden realizar

    // Dimensiones estándar
    defaultDimensions: {
        width: number;
        height: number;
        depth: number;
    };

    // Configuración visual para Three.js
    visualConfig: {
        defaultModelPath?: string;   // Modelo 3D por defecto para este tipo
        defaultColor: string;        // Color por defecto
        iconPath?: string;           // Ícono para representar en vista 2D
        materialType: 'basic' | 'lambert' | 'phong' | 'standard';
        
        // Configuración de estados visuales
        stateColors: {
            available: string;
            occupied: string;
            reserved: string;
            maintenance: string;
            outOfService: string;
        };

        // Animaciones disponibles
        animations: {
            onSelect: boolean;       // Animación al seleccionar
            onHover: boolean;        // Animación al hacer hover
            onStateChange: boolean;  // Animación al cambiar estado
        };
    };

    // Reglas de negocio
    businessRules: {
        minBookingDuration: number;    // Duración mínima de reserva en minutos
        maxBookingDuration: number;    // Duración máxima de reserva en minutos
        bufferTime: number;            // Tiempo de limpieza entre citas en minutos
        allowSimultaneousServices: boolean;
        requiresStylистSpecialization: boolean;
        priority: number;              // Prioridad para asignación automática (1-10)
    };

    // Configuración de disponibilidad
    availability: {
        workingHours: {
            start: string;           // Hora de inicio (HH:mm)
            end: string;             // Hora de fin (HH:mm)
        };
        workingDays: number[];       // Días de la semana (0=domingo, 6=sábado)
        specialSchedules: {          // Horarios especiales para fechas específicas
            date: Date;
            isAvailable: boolean;
            customHours?: {
                start: string;
                end: string;
            };
        }[];
    };

    // Metadatos
    tags: string[];              // Etiquetas para búsqueda y filtrado
    cost: number;                // Costo de mantenimiento/uso
    installationDate?: Date;     // Fecha de instalación
    lastMaintenanceDate?: Date;  // Última fecha de mantenimiento

    constructor() {
        this.id = '';
        this.name = '';
        this.description = '';
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.isActive = true;
        this.isDeleted = false;
        this.isDefault = false;

        this.category = 'workstation';
        this.subCategory = '';
        this.maxCapacity = 1;
        this.requiresSpecialEquipment = false;
        this.equipmentList = [];
        this.compatibleServiceIds = [];
        this.incompatibleServiceIds = [];

        this.defaultDimensions = {
            width: 1,
            height: 1,
            depth: 1
        };

        this.visualConfig = {
            defaultColor: '#8B4513',
            materialType: 'lambert',
            stateColors: {
                available: '#4CAF50',    // Verde
                occupied: '#F44336',     // Rojo
                reserved: '#FF9800',     // Naranja
                maintenance: '#9E9E9E',  // Gris
                outOfService: '#424242'  // Gris oscuro
            },
            animations: {
                onSelect: true,
                onHover: true,
                onStateChange: true
            }
        };

        this.businessRules = {
            minBookingDuration: 30,
            maxBookingDuration: 240,
            bufferTime: 15,
            allowSimultaneousServices: false,
            requiresStylистSpecialization: false,
            priority: 5
        };

        this.availability = {
            workingHours: {
                start: '08:00',
                end: '18:00'
            },
            workingDays: [1, 2, 3, 4, 5, 6], // Lunes a sábado
            specialSchedules: []
        };

        this.tags = [];
        this.cost = 0;
    }

    // Métodos de utilidad
    canPerformService(serviceId: string): boolean {
        if (this.incompatibleServiceIds.includes(serviceId)) {
            return false;
        }
        
        if (this.compatibleServiceIds.length === 0) {
            return true; // Si no hay restricciones, permite todos los servicios
        }
        
        return this.compatibleServiceIds.includes(serviceId);
    }

    isAvailableOnDay(dayOfWeek: number): boolean {
        return this.availability.workingDays.includes(dayOfWeek);
    }

    isAvailableAtTime(time: string): boolean {
        return time >= this.availability.workingHours.start && 
               time <= this.availability.workingHours.end;
    }

    getColorForState(state: string): string {
        return this.visualConfig.stateColors[state as keyof typeof this.visualConfig.stateColors] || 
               this.visualConfig.defaultColor;
    }

    addCompatibleService(serviceId: string): void {
        if (!this.compatibleServiceIds.includes(serviceId)) {
            this.compatibleServiceIds.push(serviceId);
        }
    }

    removeCompatibleService(serviceId: string): void {
        const index = this.compatibleServiceIds.indexOf(serviceId);
        if (index > -1) {
            this.compatibleServiceIds.splice(index, 1);
        }
    }
} 