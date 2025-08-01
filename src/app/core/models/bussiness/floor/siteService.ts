export class SiteService {
    // Propiedades básicas
    id: string;
    siteId: string;              // ID del sitio específico
    serviceTypeId: string;       // ID del tipo de servicio
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    isDeleted: boolean;

    // Configuración específica para esta combinación sitio-servicio
    configuration: {
        isPreferred: boolean;    // Si es el sitio preferido para este servicio
        efficiency: number;      // Nivel de eficiencia (0-100) para este servicio en este sitio
        quality: number;         // Nivel de calidad (0-100) para este servicio en este sitio
        
        // Modificadores de tiempo específicos
        timeModifiers: {
            setupTime: number;   // Tiempo adicional de preparación en minutos
            executionMultiplier: number; // Multiplicador de tiempo de ejecución (0.5-2.0)
            cleanupTime: number; // Tiempo adicional de limpieza en minutos
        };

        // Modificadores de precio específicos
        priceModifiers: {
            surcharge: number;   // Recargo específico para este sitio
            discount: number;    // Descuento específico para este sitio
            reason: string;      // Razón del modificador de precio
        };
    };

    // Restricciones específicas
    restrictions: {
        maxDailyExecutions: number;    // Máximo ejecutable por día en este sitio
        maxWeeklyExecutions: number;   // Máximo ejecutable por semana en este sitio
        restrictedHours: {             // Horas restringidas para este servicio
            start: string;
            end: string;
            reason: string;
        }[];
        restrictedDays: {              // Días restringidos
            dayOfWeek: number;
            reason: string;
        }[];
        seasonalRestrictions: {        // Restricciones estacionales
            season: 'spring' | 'summer' | 'autumn' | 'winter';
            isRestricted: boolean;
            reason: string;
        }[];
    };

    // Equipamiento específico requerido
    specificEquipment: {
        equipmentId: string;
        isRequired: boolean;
        alternativeIds: string[];    // Equipamiento alternativo
        notes: string;
    }[];

    // Configuración de notificaciones específicas
    notificationConfig: {
        preServiceReminder: number;  // Minutos antes del servicio
        postServiceFollow: number;   // Minutos después del servicio
        specialInstructions: string[];
        customerNotes: string;
        staffNotes: string;
    };

    // Métricas de rendimiento
    performanceMetrics: {
        totalExecutions: number;     // Total de veces ejecutado
        averageRating: number;       // Calificación promedio para esta combinación
        averageDuration: number;     // Duración promedio real
        complaintRate: number;       // Tasa de quejas (0-100)
        repeatCustomerRate: number;  // Tasa de clientes que repiten (0-100)
        revenue: number;             // Ingresos generados
        lastExecutionDate?: Date;    // Última vez que se ejecutó
        successRate: number;         // Tasa de éxito (0-100)
    };

    // Configuración visual específica para Three.js
    visualConfig: {
        serviceActiveColor: string;   // Color cuando se está ejecutando el servicio
        preparationColor: string;     // Color durante preparación
        completionColor: string;      // Color al completar el servicio
        
        // Efectos específicos
        effects: {
            showServiceIcon: boolean; // Mostrar ícono del servicio
            iconPosition: 'top' | 'center' | 'front' | 'custom';
            customIconOffset: { x: number, y: number, z: number };
            animationDuration: number; // Duración de animaciones en segundos
            
            // Efectos de estado
            stateTransitions: {
                preparing: {
                    color: string;
                    animation: 'fade' | 'pulse' | 'glow' | 'none';
                };
                executing: {
                    color: string;
                    animation: 'fade' | 'pulse' | 'glow' | 'none';
                };
                completing: {
                    color: string;
                    animation: 'fade' | 'pulse' | 'glow' | 'none';
                };
            };
        };
    };

    // Horarios específicos de disponibilidad
    specificAvailability: {
        overrideDefault: boolean;    // Si sobrescribe la disponibilidad por defecto
        customSchedule: {
            dayOfWeek: number;
            timeSlots: {
                start: string;
                end: string;
                maxConcurrent: number;
            }[];
        }[];
        exceptions: {                // Excepciones específicas
            date: Date;
            isAvailable: boolean;
            customSlots?: {
                start: string;
                end: string;
            }[];
            reason: string;
        }[];
    };

    constructor() {
        this.id = '';
        this.siteId = '';
        this.serviceTypeId = '';
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.isActive = true;
        this.isDeleted = false;

        this.configuration = {
            isPreferred: false,
            efficiency: 100,
            quality: 100,
            timeModifiers: {
                setupTime: 0,
                executionMultiplier: 1.0,
                cleanupTime: 0
            },
            priceModifiers: {
                surcharge: 0,
                discount: 0,
                reason: ''
            }
        };

        this.restrictions = {
            maxDailyExecutions: 0, // 0 = sin límite
            maxWeeklyExecutions: 0,
            restrictedHours: [],
            restrictedDays: [],
            seasonalRestrictions: []
        };

        this.specificEquipment = [];

        this.notificationConfig = {
            preServiceReminder: 15,
            postServiceFollow: 30,
            specialInstructions: [],
            customerNotes: '',
            staffNotes: ''
        };

        this.performanceMetrics = {
            totalExecutions: 0,
            averageRating: 0,
            averageDuration: 0,
            complaintRate: 0,
            repeatCustomerRate: 0,
            revenue: 0,
            successRate: 100
        };

        this.visualConfig = {
            serviceActiveColor: '#4CAF50',
            preparationColor: '#FF9800',
            completionColor: '#2196F3',
            effects: {
                showServiceIcon: true,
                iconPosition: 'top',
                customIconOffset: { x: 0, y: 0, z: 0 },
                animationDuration: 1.0,
                stateTransitions: {
                    preparing: {
                        color: '#FF9800',
                        animation: 'pulse'
                    },
                    executing: {
                        color: '#4CAF50',
                        animation: 'glow'
                    },
                    completing: {
                        color: '#2196F3',
                        animation: 'fade'
                    }
                }
            }
        };

        this.specificAvailability = {
            overrideDefault: false,
            customSchedule: [],
            exceptions: []
        };
    }

    // Métodos de utilidad
    getTotalExecutionTime(baseServiceDuration: number): number {
        const modifiedDuration = baseServiceDuration * this.configuration.timeModifiers.executionMultiplier;
        return this.configuration.timeModifiers.setupTime + 
               modifiedDuration + 
               this.configuration.timeModifiers.cleanupTime;
    }

    getFinalPrice(basePrice: number): number {
        let finalPrice = basePrice + this.configuration.priceModifiers.surcharge;
        finalPrice -= (finalPrice * this.configuration.priceModifiers.discount / 100);
        return Math.max(0, finalPrice);
    }

    isAvailableAt(dayOfWeek: number, time: string): boolean {
        // Verificar restricciones de días
        if (this.restrictions.restrictedDays.some(rd => rd.dayOfWeek === dayOfWeek)) {
            return false;
        }

        // Verificar restricciones de horas
        const isRestrictedHour = this.restrictions.restrictedHours.some(rh => 
            time >= rh.start && time <= rh.end
        );
        if (isRestrictedHour) {
            return false;
        }

        // Si tiene horario personalizado
        if (this.specificAvailability.overrideDefault) {
            const daySchedule = this.specificAvailability.customSchedule.find(cs => 
                cs.dayOfWeek === dayOfWeek
            );
            if (!daySchedule) return false;
            
            return daySchedule.timeSlots.some(slot => 
                time >= slot.start && time <= slot.end
            );
        }

        return true;
    }

    updatePerformanceMetrics(rating: number, duration: number, revenue: number, wasSuccessful: boolean): void {
        const previousTotal = this.performanceMetrics.totalExecutions;
        this.performanceMetrics.totalExecutions++;

        // Actualizar calificación promedio
        if (previousTotal > 0) {
            const totalRating = (this.performanceMetrics.averageRating * previousTotal) + rating;
            this.performanceMetrics.averageRating = totalRating / this.performanceMetrics.totalExecutions;
        } else {
            this.performanceMetrics.averageRating = rating;
        }

        // Actualizar duración promedio
        if (previousTotal > 0) {
            const totalDuration = (this.performanceMetrics.averageDuration * previousTotal) + duration;
            this.performanceMetrics.averageDuration = totalDuration / this.performanceMetrics.totalExecutions;
        } else {
            this.performanceMetrics.averageDuration = duration;
        }

        // Actualizar ingresos
        this.performanceMetrics.revenue += revenue;

        // Actualizar tasa de éxito
        const previousSuccessful = (this.performanceMetrics.successRate / 100) * previousTotal;
        const newSuccessful = previousSuccessful + (wasSuccessful ? 1 : 0);
        this.performanceMetrics.successRate = (newSuccessful / this.performanceMetrics.totalExecutions) * 100;

        // Actualizar fecha de última ejecución
        this.performanceMetrics.lastExecutionDate = new Date();
    }

    addException(date: Date, isAvailable: boolean, reason: string, customSlots?: { start: string, end: string }[]): void {
        this.specificAvailability.exceptions.push({
            date,
            isAvailable,
            customSlots,
            reason
        });
    }

    getEfficiencyScore(): number {
        // Combina eficiencia configurada con métricas de rendimiento
        const configEfficiency = this.configuration.efficiency;
        const performanceBonus = Math.min(20, this.performanceMetrics.successRate / 5);
        const ratingBonus = Math.min(15, (this.performanceMetrics.averageRating - 3) * 5);
        
        return Math.min(100, configEfficiency + performanceBonus + ratingBonus);
    }
} 