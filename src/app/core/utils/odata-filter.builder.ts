/**
 * Builder para construir filtros OData de manera fluida
 * 
 * @example
 * const filter = ODataFilterBuilder.create()
 *   .eq('status', 'pending')
 *   .contains('bookingReference', 'BK2025')
 *   .dateBetween('bookingDate', startDate, endDate)
 *   .build();
 */
export class ODataFilterBuilder {
  private filters: string[] = [];

  /**
   * Igual a (eq)
   */
  eq(field: string, value: string | number | boolean): this {
    if (value === null || value === undefined || value === '') return this;
    const formattedValue = typeof value === 'string' ? `'${value}'` : value;
    this.filters.push(`${field} eq ${formattedValue}`);
    return this;
  }

  /**
   * Diferente de (ne)
   */
  ne(field: string, value: string | number | boolean): this {
    if (value === null || value === undefined || value === '') return this;
    const formattedValue = typeof value === 'string' ? `'${value}'` : value;
    this.filters.push(`${field} ne ${formattedValue}`);
    return this;
  }

  /**
   * Mayor que (gt)
   */
  gt(field: string, value: number | string): this {
    if (value === null || value === undefined) return this;
    this.filters.push(`${field} gt ${value}`);
    return this;
  }

  /**
   * Mayor o igual que (ge)
   */
  ge(field: string, value: number | string): this {
    if (value === null || value === undefined) return this;
    this.filters.push(`${field} ge ${value}`);
    return this;
  }

  /**
   * Menor que (lt)
   */
  lt(field: string, value: number | string): this {
    if (value === null || value === undefined) return this;
    this.filters.push(`${field} lt ${value}`);
    return this;
  }

  /**
   * Menor o igual que (le)
   */
  le(field: string, value: number | string): this {
    if (value === null || value === undefined) return this;
    this.filters.push(`${field} le ${value}`);
    return this;
  }

  /**
   * Contiene texto (contains)
   */
  contains(field: string, value: string): this {
    if (!value || !value.trim()) return this;
    this.filters.push(`contains(${field}, '${value.trim()}')`);
    return this;
  }

  /**
   * Contiene texto ignorando mayúsculas/minúsculas
   */
  containsIgnoreCase(field: string, value: string): this {
    if (!value || !value.trim()) return this;
    this.filters.push(`contains(tolower(${field}), '${value.trim().toLowerCase()}')`);
    return this;
  }

  /**
   * Empieza con (startswith)
   */
  startsWith(field: string, value: string): this {
    if (!value || !value.trim()) return this;
    this.filters.push(`startswith(${field}, '${value.trim()}')`);
    return this;
  }

  /**
   * Termina con (endswith)
   */
  endsWith(field: string, value: string): this {
    if (!value || !value.trim()) return this;
    this.filters.push(`endswith(${field}, '${value.trim()}')`);
    return this;
  }

  /**
   * Fecha igual a
   */
  dateEquals(field: string, date: Date | null): this {
    if (!date) return this;
    const dateStr = this.formatDate(date);
    this.filters.push(`${field} eq ${dateStr}`);
    return this;
  }

  /**
   * Fecha mayor o igual (desde)
   */
  dateFrom(field: string, date: Date | null): this {
    if (!date) return this;
    const dateStr = this.formatDate(date);
    this.filters.push(`${field} ge ${dateStr}`);
    return this;
  }

  /**
   * Fecha menor o igual (hasta)
   */
  dateTo(field: string, date: Date | null): this {
    if (!date) return this;
    const dateStr = this.formatDate(date);
    this.filters.push(`${field} le ${dateStr}`);
    return this;
  }

  /**
   * Fecha entre dos valores
   */
  dateBetween(field: string, startDate: Date | null, endDate: Date | null): this {
    if (startDate) {
      this.dateFrom(field, startDate);
    }
    if (endDate) {
      this.dateTo(field, endDate);
    }
    return this;
  }

  /**
   * Agrega un grupo OR
   */
  or(orBuilder: ODataFilterBuilder): this {
    if (orBuilder.filters.length > 0) {
      const orExpression = orBuilder.filters.join(' or ');
      this.filters.push(`(${orExpression})`);
    }
    return this;
  }

  /**
   * Agrega un filtro raw (sin procesar)
   */
  raw(filter: string): this {
    if (filter && filter.trim()) {
      this.filters.push(filter.trim());
    }
    return this;
  }

  /**
   * Verifica si hay filtros
   */
  hasFilters(): boolean {
    return this.filters.length > 0;
  }

  /**
   * Construye el string de filtro final (unidos con AND)
   */
  build(): string {
    return this.filters.join(' and ');
  }

  /**
   * Construye el filtro o retorna undefined si está vacío
   */
  buildOrUndefined(): string | undefined {
    return this.hasFilters() ? this.build() : undefined;
  }

  /**
   * Formatea una fecha a formato ISO (YYYY-MM-DD)
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Crea una nueva instancia del builder
   */
  static create(): ODataFilterBuilder {
    return new ODataFilterBuilder();
  }
}
