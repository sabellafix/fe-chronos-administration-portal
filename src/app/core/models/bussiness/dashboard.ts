/**
 * Interfaces para el Dashboard de Chronos
 * Migradas desde el diseño de Figma React
 */

/**
 * Tipo de icono para KPI
 */
export type KpiIconType = 'gauge' | 'revenue' | 'sessions' | 'stylists';

/**
 * Tendencia de KPI
 */
export type KpiTrend = 'up' | 'down';

/**
 * Estado de una cita/booking (dashboard)
 * Nota: Usa el BookingStatus del enum principal si están sincronizados
 */
export type DashboardBookingStatus = 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';

/**
 * Estado de un estilista
 */
export type StylistStatus = 'available' | 'busy' | 'break' | 'offline';

/**
 * Interfaz para tarjeta KPI
 */
export interface KpiData {
  title: string;
  value: string;
  change: string;
  trend: KpiTrend;
  icon: KpiIconType;
}

/**
 * Interfaz para una cita/booking en el calendario
 */
export interface CalendarBooking {
  id: string;
  time: string;
  endTime: string;
  customerName: string;
  service: string;
  stylist: string;
  status: DashboardBookingStatus;
  color: string;
}

/**
 * Interfaz para una cita del día
 */
export interface DailyAppointment {
  id: string;
  time: string;
  customerName: string;
  customerPhone: string;
  service: string;
  stylist: string;
  duration: string;
  price: number;
  status: DashboardBookingStatus;
}

/**
 * Interfaz para el estado de un estilista
 */
export interface StylistInfo {
  id: string;
  name: string;
  avatar?: string;
  status: StylistStatus;
  currentClient?: string;
  nextAppointment?: string;
  todayBookings: number;
  todayRevenue: number;
  completionRate: number;
  specialties: string[];
}

/**
 * Configuración de estado de booking
 */
export interface BookingStatusConfig {
  label: string;
  variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  color: string;
}

/**
 * Configuración de estado de estilista
 */
export interface StylistStatusConfig {
  label: string;
  variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  color: string;
}

/**
 * Interfaz para métricas rápidas del sidebar
 */
export interface QuickMetric {
  label: string;
  value: string | number;
  type?: 'text' | 'badge';
}

/**
 * Interfaz para alertas en tiempo real
 */
export interface RealtimeAlert {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  description: string;
  color: string;
}

/**
 * Interfaz para datos de ingresos por día
 */
export interface RevenueData {
  day: string;
  amount: number;
}

/**
 * Interfaz para distribución de servicios
 */
export interface ServiceDistributionData {
  service: string;
  count: number;
  percentage: number;
  color: string;
}

/**
 * Interfaz para rendimiento de estilista
 */
export interface StylistPerformanceData {
  name: string;
  revenue: number;
  bookings: number;
  rating: number;
}
