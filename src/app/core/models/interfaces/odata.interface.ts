/**
 * Parámetros de consulta OData
 */
export interface ODataQueryParams {
  /** Filtrar resultados por condiciones */
  filter?: string;
  /** Ordenar resultados */
  orderby?: string;
  /** Limitar cantidad de resultados */
  top?: number;
  /** Saltar N resultados (paginación) */
  skip?: number;
  /** Seleccionar campos específicos */
  select?: string;
  /** Incluir conteo total */
  count?: boolean;
  /** Expandir relaciones */
  expand?: string;
}

/**
 * Resultado paginado del backend
 */
export interface PagedResult<T> {
  /** Array de elementos de la página actual */
  items: T[];
  /** Total de elementos sin paginación */
  totalCount: number;
  /** Número de página actual (1-based) */
  page: number;
  /** Tamaño de página */
  pageSize: number;
  /** Número total de páginas (calculado) */
  totalPages: number;
  /** Indica si hay página siguiente */
  hasNextPage: boolean;
  /** Indica si hay página anterior */
  hasPreviousPage: boolean;
}

/**
 * Estado de paginación para componentes
 */
export interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Valores de BookingStatus para OData (camelCase como espera el backend)
 */
export const BookingStatusOData = {
  Pending: 'pending',
  Confirmed: 'confirmed',
  InProgress: 'inProgress',
  Completed: 'completed',
  Cancelled: 'cancelled',
  NoShow: 'noShow',
  Rescheduled: 'rescheduled',
  InBasket: 'inBasket'
} as const;

export type BookingStatusODataType = typeof BookingStatusOData[keyof typeof BookingStatusOData];
