export class ServiceType {
    // Propiedades básicas
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    isDeleted: boolean;
    isDefault: boolean;

    // Categorización del servicio
    category: 'hair' | 'beauty' | 'nails' | 'spa' | 'massage' | 'aesthetic' | 'consultation' | 'other';
    subCategory: string;

    // Características del servicio
    duration: {
        min: number;                 // Duración mínima en minutos
        max: number;                 // Duración máxima en minutos
        default: number;             // Duración por defecto en minutos
        increment: number;           // Incrementos de tiempo permitidos
    };

    // Requerimientos de recursos
    requirements: {
        siteTypes: string[];         // Tipos de sitios donde se puede realizar
        equipment: string[];         // Equipamiento necesario
        products: string[];          // Productos necesarios
        stylistSkills: string[];     // Habilidades requeridas del estilista
        certifications: string[];    // Certificaciones requeridas
    };

    // Precios y costos
    pricing: {
        basePrice: number;           // Precio base del servicio
        currency: string;            // Moneda
        priceVariations: {           // Variaciones de precio por características
            seniorStylist: number;   // Recargo por estilista senior
            peakHours: number;       // Recargo en horas pico
            weekend: number;         // Recargo de fin de semana
            holiday: number;         // Recargo de días festivos
        };
        discounts: {                 // Descuentos disponibles
            loyalty: number;         // Descuento por lealtad
            bulk: number;            // Descuento por servicios múltiples
            firstTime: number;       // Descuento primera vez
        };
    };

    // Configuración de disponibilidad
    availability: {
        daysOfWeek: number[];        // Días en que está disponible
        timeSlots: {                 // Franjas horarias disponibles
            start: string;           // Hora inicio (HH:mm)
            end: string;             // Hora fin (HH:mm)
        }[];
        seasonalAvailability: {      // Disponibilidad estacional
            season: 'spring' | 'summer' | 'autumn' | 'winter';
            isAvailable: boolean;
        }[];
        blackoutDates: Date[];       // Fechas no disponibles
    };

    // Configuración visual para representación 3D
    visualRepresentation: {
        color: string;               // Color asociado al servicio
        icon: string;                // Ícono del servicio
        effectsConfig: {             // Efectos visuales cuando se realiza
            particleEffect: boolean; // Si mostrar efectos de partículas
            colorOverlay: string;    // Color overlay durante el servicio
            animationType: 'glow' | 'pulse' | 'rotate' | 'none';
            intensity: number;       // Intensidad del efecto (0-1)
        };
    };

    // Reglas de negocio
    businessRules: {
        maxConcurrent: number;       // Máximo servicios concurrentes del mismo tipo
        bufferTime: number;          // Tiempo de preparación/limpieza en minutos
        cancellationPolicy: {
            allowCancellation: boolean;
            freeWithinHours: number; // Horas antes para cancelación gratuita
            penaltyPercentage: number; // % de penalidad por cancelación tardía
        };
        reschedulePolicy: {
            allowReschedule: boolean;
            freeWithinHours: number;
            maxReschedules: number;
        };
        noShowPolicy: {
            waitingTime: number;     // Tiempo de espera en minutos
            penaltyPercentage: number;
        };
    };

    // Servicios relacionados
    relationships: {
        prerequisites: string[];     // Servicios que deben hacerse antes
        followUps: string[];        // Servicios recomendados después
        incompatible: string[];     // Servicios incompatibles
        combos: {                   // Combos disponibles
            serviceIds: string[];
            discountPercentage: number;
            name: string;
        }[];
    };

    // Métricas y estadísticas
    statistics: {
        popularity: number;          // Índice de popularidad (0-100)
        averageRating: number;       // Calificación promedio (1-5)
        totalBookings: number;       // Total de reservas históricas
        averageDuration: number;     // Duración promedio real
        revenue: number;             // Ingresos generados
    };

    // Configuración de notificaciones
    notifications: {
        reminderTime: number;        // Tiempo de recordatorio en horas
        confirmationRequired: boolean;
        specialInstructions: string;
    };

    constructor() {
        this.id = '';
        this.name = '';
        this.description = '';
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.isActive = true;
        this.isDeleted = false;
        this.isDefault = false;

        this.category = 'hair';
        this.subCategory = '';

        this.duration = {
            min: 30,
            max: 180,
            default: 60,
            increment: 15
        };

        this.requirements = {
            siteTypes: [],
            equipment: [],
            products: [],
            stylistSkills: [],
            certifications: []
        };

        this.pricing = {
            basePrice: 0,
            currency: 'USD',
            priceVariations: {
                seniorStylist: 0,
                peakHours: 0,
                weekend: 0,
                holiday: 0
            },
            discounts: {
                loyalty: 0,
                bulk: 0,
                firstTime: 0
            }
        };

        this.availability = {
            daysOfWeek: [1, 2, 3, 4, 5, 6], // Lunes a sábado
            timeSlots: [{
                start: '08:00',
                end: '18:00'
            }],
            seasonalAvailability: [
                { season: 'spring', isAvailable: true },
                { season: 'summer', isAvailable: true },
                { season: 'autumn', isAvailable: true },
                { season: 'winter', isAvailable: true }
            ],
            blackoutDates: []
        };

        this.visualRepresentation = {
            color: '#2196F3',
            icon: 'service-default',
            effectsConfig: {
                particleEffect: false,
                colorOverlay: '#FFFFFF',
                animationType: 'none',
                intensity: 0.5
            }
        };

        this.businessRules = {
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

        this.relationships = {
            prerequisites: [],
            followUps: [],
            incompatible: [],
            combos: []
        };

        this.statistics = {
            popularity: 50,
            averageRating: 0,
            totalBookings: 0,
            averageDuration: 60,
            revenue: 0
        };

        this.notifications = {
            reminderTime: 24,
            confirmationRequired: false,
            specialInstructions: ''
        };
    }

    // Métodos de utilidad
    canBePerformedAt(siteTypeId: string): boolean {
        return this.requirements.siteTypes.length === 0 || 
               this.requirements.siteTypes.includes(siteTypeId);
    }

    isAvailableOnDay(dayOfWeek: number): boolean {
        return this.availability.daysOfWeek.includes(dayOfWeek);
    }

    isAvailableAtTime(time: string): boolean {
        return this.availability.timeSlots.some(slot => 
            time >= slot.start && time <= slot.end
        );
    }

    getTotalPrice(options: {
        isSeniorStylist?: boolean;
        isPeakHours?: boolean;
        isWeekend?: boolean;
        isHoliday?: boolean;
        loyaltyDiscount?: boolean;
        bulkDiscount?: boolean;
        firstTimeDiscount?: boolean;
    } = {}): number {
        let price = this.pricing.basePrice;

        // Aplicar recargos
        if (options.isSeniorStylist) price += this.pricing.priceVariations.seniorStylist;
        if (options.isPeakHours) price += this.pricing.priceVariations.peakHours;
        if (options.isWeekend) price += this.pricing.priceVariations.weekend;
        if (options.isHoliday) price += this.pricing.priceVariations.holiday;

        // Aplicar descuentos
        if (options.loyaltyDiscount) price -= (price * this.pricing.discounts.loyalty / 100);
        if (options.bulkDiscount) price -= (price * this.pricing.discounts.bulk / 100);
        if (options.firstTimeDiscount) price -= (price * this.pricing.discounts.firstTime / 100);

        return Math.max(0, price);
    }

    isCompatibleWith(serviceId: string): boolean {
        return !this.relationships.incompatible.includes(serviceId);
    }

    addToCombo(serviceIds: string[], discountPercentage: number, name: string): void {
        this.relationships.combos.push({
            serviceIds,
            discountPercentage,
            name
        });
    }

    updateStatistics(rating: number, actualDuration: number, revenue: number): void {
        this.statistics.totalBookings++;
        
        // Actualizar calificación promedio
        const totalRating = (this.statistics.averageRating * (this.statistics.totalBookings - 1)) + rating;
        this.statistics.averageRating = totalRating / this.statistics.totalBookings;
        
        // Actualizar duración promedio
        const totalDuration = (this.statistics.averageDuration * (this.statistics.totalBookings - 1)) + actualDuration;
        this.statistics.averageDuration = totalDuration / this.statistics.totalBookings;
        
        // Actualizar ingresos
        this.statistics.revenue += revenue;
    }
} 