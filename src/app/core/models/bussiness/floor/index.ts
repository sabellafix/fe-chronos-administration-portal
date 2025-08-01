// Entidades principales del sistema de pisos y sitios
export * from './site';
export * from './siteBooking';
export * from './floor';
export * from './siteType';
export * from './serviceType';
export * from './siteService';

// Interfaces auxiliares para tipado
export interface GridPosition {
    x: number;
    y: number;
    isAvailable: boolean;
    isBlocked: boolean;
}

export interface SalonLayout {
    floorId: string;
    width: number;
    depth: number;
    gridSize: number;
    sites: Site[];
    blockedAreas: BlockedArea[];
}

export interface BlockedArea {
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'wall' | 'column' | 'decoration' | 'equipment' | 'other';
    description?: string;
}

export interface WorkstationData {
    site: Site;
    siteType: SiteType;
    currentBooking?: SiteBooking;
    availableServices: ServiceType[];
    performanceMetrics: {
        efficiency: number;
        occupancyRate: number;
        revenue: number;
    };
}

export interface ServiceExecutionContext {
    siteService: SiteService;
    site: Site;
    serviceType: ServiceType;
    booking: SiteBooking;
    estimatedDuration: number;
    finalPrice: number;
}

// Tipos de utilidad para Three.js
export interface ThreeJsPosition {
    x: number;
    y: number;
    z: number;
}

export interface ThreeJsColor {
    hex: string;
    name: string;
    opacity?: number;
}

export interface MaterialConfig {
    type: 'basic' | 'lambert' | 'phong' | 'standard';
    color: string;
    opacity: number;
    castShadow: boolean;
    receiveShadow: boolean;
}

// Enums para mejor tipado
export enum SiteStatus {
    AVAILABLE = 'available',
    OCCUPIED = 'occupied', 
    RESERVED = 'reserved',
    MAINTENANCE = 'maintenance',
    BLOCKED = 'blocked'
}

export enum ServiceCategory {
    HAIR = 'hair',
    BEAUTY = 'beauty',
    NAILS = 'nails',
    SPA = 'spa',
    MASSAGE = 'massage',
    AESTHETIC = 'aesthetic',
    CONSULTATION = 'consultation',
    OTHER = 'other'
}

export enum SiteTypeCategory {
    WORKSTATION = 'workstation',
    WASHSTATION = 'washstation',
    TREATMENT = 'treatment',
    RECEPTION = 'reception',
    WAITING = 'waiting',
    STORAGE = 'storage',
    OTHER = 'other'
}

// Re-exportación de clases para importación limpia
import { Site } from './site';
import { SiteBooking } from './siteBooking';
import { Floor } from './floor';
import { SiteType } from './siteType';
import { ServiceType } from './serviceType';
import { SiteService } from './siteService';

export {
    Site,
    SiteBooking,
    Floor,
    SiteType,
    ServiceType,
    SiteService
}; 