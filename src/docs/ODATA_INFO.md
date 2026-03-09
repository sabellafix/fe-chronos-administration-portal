# OData API - Documentación de Endpoints de Bookings

## Descripción General

Esta documentación describe los endpoints REST con soporte OData implementados en `BookingsController` para consultas dinámicas, filtrado y paginación de bookings. Estos endpoints están diseñados para ser consumidos por aplicaciones frontend (Angular) que requieran flexibilidad en las consultas.

---

## Endpoints Disponibles

| Endpoint | Método | Autenticación | Descripción |
|----------|--------|---------------|-------------|
| `/api/bookings/odata` | GET | Requerida | Consulta OData completa (todos los bookings) |
| `/api/bookings/odata/my-bookings` | GET | Requerida | Consulta OData filtrada por proveedor autenticado |
| `/api/bookings/paged` | GET | Requerida | Paginación estructurada con metadatos |

---

## 1. GET `/api/bookings/odata`

### Descripción
Endpoint que expone todos los bookings con soporte completo de consultas OData. Permite filtrado, ordenamiento, selección de campos y paginación dinámica.

### Headers Requeridos
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Parámetros OData Soportados

| Parámetro | Descripción | Ejemplo |
|-----------|-------------|---------|
| `$filter` | Filtrar resultados por condiciones | `$filter=status eq 'Pending'` |
| `$orderby` | Ordenar resultados | `$orderby=bookingDate desc` |
| `$top` | Limitar cantidad de resultados | `$top=10` |
| `$skip` | Saltar N resultados (paginación) | `$skip=20` |
| `$select` | Seleccionar campos específicos | `$select=id,bookingDate,status` |
| `$count` | Incluir conteo total | `$count=true` |
| `$expand` | Expandir relaciones | `$expand=customer` |

### Ejemplos de Uso

#### Filtrar por Status
```http
GET /api/bookings/odata?$filter=status eq 'Confirmed'
```

#### Filtrar por Precio
```http
GET /api/bookings/odata?$filter=totalPrice gt 100
GET /api/bookings/odata?$filter=totalPrice ge 50 and totalPrice le 200
```

#### Filtrar por Fecha
```http
GET /api/bookings/odata?$filter=bookingDate ge 2025-01-01
GET /api/bookings/odata?$filter=bookingDate ge 2025-01-01 and bookingDate le 2025-12-31
```

#### Filtrar por Cliente
```http
GET /api/bookings/odata?$filter=customerId eq 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
```

#### Combinar Filtros (AND)
```http
GET /api/bookings/odata?$filter=status eq 'Pending' and totalPrice gt 50
```

#### Combinar Filtros (OR)
```http
GET /api/bookings/odata?$filter=status eq 'Pending' or status eq 'Confirmed'
```

#### Ordenar Resultados
```http
GET /api/bookings/odata?$orderby=bookingDate desc
GET /api/bookings/odata?$orderby=bookingDate desc,startTime asc
GET /api/bookings/odata?$orderby=totalPrice desc
```

#### Paginación
```http
# Primera página (10 elementos)
GET /api/bookings/odata?$top=10&$skip=0

# Segunda página
GET /api/bookings/odata?$top=10&$skip=10

# Tercera página
GET /api/bookings/odata?$top=10&$skip=20
```

#### Seleccionar Campos Específicos
```http
GET /api/bookings/odata?$select=id,bookingDate,status,totalPrice
```

#### Obtener Conteo Total
```http
GET /api/bookings/odata?$count=true
```

#### Consulta Completa Combinada
```http
GET /api/bookings/odata?$filter=status eq 'Pending'&$orderby=bookingDate desc&$top=10&$skip=0&$count=true&$select=id,bookingDate,status,totalPrice
```

### Respuesta
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "customerId": "...",
    "customer": {
      "id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phoneNumber": "+1234567890"
    },
    "supplierId": "...",
    "bookingDate": "2025-01-15",
    "startTime": "10:00:00",
    "endTime": "11:00:00",
    "durationMinutes": 60,
    "totalPrice": 150.00,
    "currency": "USD",
    "status": "pending",
    "clientNotes": "...",
    "bookingReference": "BK202501151234",
    "createdAt": "2025-01-10T14:30:00Z",
    "updatedAt": "2025-01-10T14:30:00Z",
    "services": [...],
    "bookingServices": [...],
    "serviceModifiers": [...]
  }
]
```

---

## 2. GET `/api/bookings/odata/my-bookings`

### Descripción
Endpoint OData que retorna únicamente los bookings del proveedor (supplier) autenticado. El filtro por `supplierId` se aplica automáticamente basándose en el JWT token.

### Headers Requeridos
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Parámetros OData
Soporta los mismos parámetros que `/api/bookings/odata` (`$filter`, `$orderby`, `$top`, `$skip`, `$select`, `$count`).

### Ejemplos de Uso

#### Mis bookings pendientes
```http
GET /api/bookings/odata/my-bookings?$filter=status eq 'Pending'
```

#### Mis bookings de hoy ordenados por hora
```http
GET /api/bookings/odata/my-bookings?$filter=bookingDate eq 2025-01-15&$orderby=startTime asc
```

#### Mis bookings paginados
```http
GET /api/bookings/odata/my-bookings?$top=10&$skip=0&$orderby=bookingDate desc
```

---

## 3. GET `/api/bookings/paged`

### Descripción
Endpoint de paginación estructurada que retorna una respuesta con metadatos completos de paginación. Ideal para implementar tablas paginadas en Angular.

### Headers Requeridos
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Parámetros de Query

| Parámetro | Tipo | Default | Rango | Descripción |
|-----------|------|---------|-------|-------------|
| `page` | int | 1 | 1+ | Número de página (1-based) |
| `pageSize` | int | 10 | 1-100 | Cantidad de elementos por página |

### Ejemplos de Uso

```http
# Primera página con 10 elementos
GET /api/bookings/paged?page=1&pageSize=10

# Segunda página con 20 elementos
GET /api/bookings/paged?page=2&pageSize=20

# Con valores por defecto
GET /api/bookings/paged
```

### Respuesta (PagedResultDto)

```json
{
  "items": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "customerId": "...",
      "customer": {...},
      "bookingDate": "2025-01-15",
      "startTime": "10:00:00",
      "endTime": "11:00:00",
      "status": "pending",
      "totalPrice": 150.00,
      ...
    }
  ],
  "totalCount": 150,
  "page": 1,
  "pageSize": 10,
  "totalPages": 15,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

### Estructura de PagedResultDto

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `items` | `T[]` | Array de elementos de la página actual |
| `totalCount` | `number` | Total de elementos sin paginación |
| `page` | `number` | Número de página actual (1-based) |
| `pageSize` | `number` | Tamaño de página |
| `totalPages` | `number` | Número total de páginas (calculado) |
| `hasNextPage` | `boolean` | Indica si hay página siguiente |
| `hasPreviousPage` | `boolean` | Indica si hay página anterior |

---

## Operadores OData Disponibles

### Operadores de Comparación

| Operador | Descripción | Ejemplo |
|----------|-------------|---------|
| `eq` | Igual a | `status eq 'Pending'` |
| `ne` | Diferente de | `status ne 'Cancelled'` |
| `gt` | Mayor que | `totalPrice gt 100` |
| `ge` | Mayor o igual que | `totalPrice ge 100` |
| `lt` | Menor que | `totalPrice lt 50` |
| `le` | Menor o igual que | `totalPrice le 50` |

### Operadores Lógicos

| Operador | Descripción | Ejemplo |
|----------|-------------|---------|
| `and` | Y lógico | `status eq 'Pending' and totalPrice gt 50` |
| `or` | O lógico | `status eq 'Pending' or status eq 'Confirmed'` |
| `not` | Negación | `not status eq 'Cancelled'` |

### Funciones de String

| Función | Descripción | Ejemplo |
|---------|-------------|---------|
| `contains` | Contiene texto | `contains(clientNotes, 'urgente')` |
| `startswith` | Empieza con | `startswith(bookingReference, 'BK2025')` |
| `endswith` | Termina con | `endswith(bookingReference, '1234')` |
| `tolower` | Convertir a minúsculas | `tolower(clientNotes) eq 'test'` |
| `toupper` | Convertir a mayúsculas | `toupper(currency) eq 'USD'` |

---

## Valores de Enums

### BookingStatus
```typescript
type BookingStatus = 
  | 'pending'
  | 'confirmed'
  | 'inProgress'
  | 'completed'
  | 'cancelled'
  | 'noShow'
  | 'rescheduled'
  | 'inBasket';
```

### PaymentStatus
```typescript
type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'refunded';
```

---

## Implementación Angular

### Interfaces TypeScript

```typescript
// booking.model.ts
export interface BookingDto {
  id: string;
  customerId: string;
  customer: CustomerDto;
  supplierId: string;
  serviceId: string;
  bookingDate: string; // Format: "YYYY-MM-DD"
  startTime: string;   // Format: "HH:mm:ss"
  endTime: string;
  durationMinutes: number;
  totalPrice: number;
  currency: string;
  status: BookingStatus;
  clientNotes?: string;
  providerNotes?: string;
  bookingReference: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  services: ServiceDto[];
  bookingServices: BookingServiceDto[];
  serviceModifiers?: ServiceModifierDto[];
}

export interface CustomerDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export type BookingStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'inProgress' 
  | 'completed' 
  | 'cancelled' 
  | 'noShow' 
  | 'rescheduled' 
  | 'inBasket';
```

### Servicio Angular

```typescript
// booking.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BookingDto, PagedResult } from './booking.model';

export interface ODataQueryParams {
  filter?: string;
  orderby?: string;
  top?: number;
  skip?: number;
  select?: string;
  count?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly baseUrl = '/api/bookings';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene bookings con filtros OData
   */
  getBookingsOData(params: ODataQueryParams): Observable<BookingDto[]> {
    const httpParams = this.buildODataParams(params);
    return this.http.get<BookingDto[]>(`${this.baseUrl}/odata`, { params: httpParams });
  }

  /**
   * Obtiene mis bookings (del proveedor autenticado) con filtros OData
   */
  getMyBookingsOData(params: ODataQueryParams): Observable<BookingDto[]> {
    const httpParams = this.buildODataParams(params);
    return this.http.get<BookingDto[]>(`${this.baseUrl}/odata/my-bookings`, { params: httpParams });
  }

  /**
   * Obtiene bookings paginados con metadatos
   */
  getBookingsPaged(page: number = 1, pageSize: number = 10): Observable<PagedResult<BookingDto>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    return this.http.get<PagedResult<BookingDto>>(`${this.baseUrl}/paged`, { params });
  }

  /**
   * Construye los parámetros HTTP para consultas OData
   */
  private buildODataParams(params: ODataQueryParams): HttpParams {
    let httpParams = new HttpParams();

    if (params.filter) {
      httpParams = httpParams.set('$filter', params.filter);
    }
    if (params.orderby) {
      httpParams = httpParams.set('$orderby', params.orderby);
    }
    if (params.top !== undefined) {
      httpParams = httpParams.set('$top', params.top.toString());
    }
    if (params.skip !== undefined) {
      httpParams = httpParams.set('$skip', params.skip.toString());
    }
    if (params.select) {
      httpParams = httpParams.set('$select', params.select);
    }
    if (params.count) {
      httpParams = httpParams.set('$count', 'true');
    }

    return httpParams;
  }
}
```

### Builder de Filtros OData

```typescript
// odata-filter.builder.ts
export class ODataFilterBuilder {
  private filters: string[] = [];

  eq(field: string, value: string | number | boolean): this {
    const formattedValue = typeof value === 'string' ? `'${value}'` : value;
    this.filters.push(`${field} eq ${formattedValue}`);
    return this;
  }

  ne(field: string, value: string | number | boolean): this {
    const formattedValue = typeof value === 'string' ? `'${value}'` : value;
    this.filters.push(`${field} ne ${formattedValue}`);
    return this;
  }

  gt(field: string, value: number | string): this {
    this.filters.push(`${field} gt ${value}`);
    return this;
  }

  ge(field: string, value: number | string): this {
    this.filters.push(`${field} ge ${value}`);
    return this;
  }

  lt(field: string, value: number | string): this {
    this.filters.push(`${field} lt ${value}`);
    return this;
  }

  le(field: string, value: number | string): this {
    this.filters.push(`${field} le ${value}`);
    return this;
  }

  contains(field: string, value: string): this {
    this.filters.push(`contains(${field}, '${value}')`);
    return this;
  }

  startsWith(field: string, value: string): this {
    this.filters.push(`startswith(${field}, '${value}')`);
    return this;
  }

  dateEquals(field: string, date: Date): this {
    const dateStr = date.toISOString().split('T')[0];
    this.filters.push(`${field} eq ${dateStr}`);
    return this;
  }

  dateBetween(field: string, startDate: Date, endDate: Date): this {
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];
    this.filters.push(`${field} ge ${start} and ${field} le ${end}`);
    return this;
  }

  and(): this {
    // Los filtros se unen con AND por defecto
    return this;
  }

  or(orFilter: ODataFilterBuilder): this {
    if (orFilter.filters.length > 0) {
      const orExpression = orFilter.filters.join(' or ');
      this.filters.push(`(${orExpression})`);
    }
    return this;
  }

  build(): string {
    return this.filters.join(' and ');
  }

  static create(): ODataFilterBuilder {
    return new ODataFilterBuilder();
  }
}
```

### Ejemplo de Uso en Componente Angular

```typescript
// bookings-list.component.ts
import { Component, OnInit } from '@angular/core';
import { BookingService, ODataQueryParams } from './booking.service';
import { ODataFilterBuilder } from './odata-filter.builder';
import { BookingDto, PagedResult } from './booking.model';

@Component({
  selector: 'app-bookings-list',
  templateUrl: './bookings-list.component.html'
})
export class BookingsListComponent implements OnInit {
  bookings: BookingDto[] = [];
  pagedResult: PagedResult<BookingDto> | null = null;
  
  // Paginación
  currentPage = 1;
  pageSize = 10;
  
  // Filtros
  statusFilter: string = '';
  dateFilter: Date | null = null;

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    // Usando endpoint paginado estructurado
    this.bookingService.getBookingsPaged(this.currentPage, this.pageSize)
      .subscribe(result => {
        this.pagedResult = result;
        this.bookings = result.items;
      });
  }

  loadBookingsWithOData(): void {
    // Construir filtros dinámicamente
    const filterBuilder = ODataFilterBuilder.create();
    
    if (this.statusFilter) {
      filterBuilder.eq('status', this.statusFilter);
    }
    
    if (this.dateFilter) {
      filterBuilder.dateEquals('bookingDate', this.dateFilter);
    }

    const params: ODataQueryParams = {
      filter: filterBuilder.build() || undefined,
      orderby: 'bookingDate desc,startTime asc',
      top: this.pageSize,
      skip: (this.currentPage - 1) * this.pageSize,
      count: true
    };

    this.bookingService.getMyBookingsOData(params)
      .subscribe(bookings => {
        this.bookings = bookings;
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadBookings();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadBookingsWithOData();
  }

  // Ejemplos de consultas comunes
  loadPendingBookings(): void {
    const params: ODataQueryParams = {
      filter: "status eq 'pending'",
      orderby: 'bookingDate asc'
    };
    this.bookingService.getMyBookingsOData(params).subscribe(b => this.bookings = b);
  }

  loadTodayBookings(): void {
    const today = new Date().toISOString().split('T')[0];
    const params: ODataQueryParams = {
      filter: `bookingDate eq ${today}`,
      orderby: 'startTime asc'
    };
    this.bookingService.getMyBookingsOData(params).subscribe(b => this.bookings = b);
  }

  loadHighValueBookings(): void {
    const params: ODataQueryParams = {
      filter: 'totalPrice gt 100',
      orderby: 'totalPrice desc',
      top: 10
    };
    this.bookingService.getMyBookingsOData(params).subscribe(b => this.bookings = b);
  }
}
```

### Template HTML con Paginación

```html
<!-- bookings-list.component.html -->
<div class="bookings-container">
  <!-- Filtros -->
  <div class="filters">
    <select [(ngModel)]="statusFilter" (change)="onFilterChange()">
      <option value="">Todos los estados</option>
      <option value="pending">Pendiente</option>
      <option value="confirmed">Confirmado</option>
      <option value="completed">Completado</option>
      <option value="cancelled">Cancelado</option>
    </select>
    
    <input type="date" [(ngModel)]="dateFilter" (change)="onFilterChange()">
  </div>

  <!-- Tabla de Bookings -->
  <table class="bookings-table">
    <thead>
      <tr>
        <th>Referencia</th>
        <th>Cliente</th>
        <th>Fecha</th>
        <th>Hora</th>
        <th>Estado</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let booking of bookings">
        <td>{{ booking.bookingReference }}</td>
        <td>{{ booking.customer?.firstName }} {{ booking.customer?.lastName }}</td>
        <td>{{ booking.bookingDate }}</td>
        <td>{{ booking.startTime }} - {{ booking.endTime }}</td>
        <td>{{ booking.status }}</td>
        <td>{{ booking.totalPrice | currency:booking.currency }}</td>
      </tr>
    </tbody>
  </table>

  <!-- Paginación -->
  <div class="pagination" *ngIf="pagedResult">
    <button 
      [disabled]="!pagedResult.hasPreviousPage" 
      (click)="onPageChange(currentPage - 1)">
      Anterior
    </button>
    
    <span>
      Página {{ pagedResult.page }} de {{ pagedResult.totalPages }}
      ({{ pagedResult.totalCount }} resultados)
    </span>
    
    <button 
      [disabled]="!pagedResult.hasNextPage" 
      (click)="onPageChange(currentPage + 1)">
      Siguiente
    </button>
  </div>
</div>
```

---

## Notas Importantes

1. **Autenticación**: Todos los endpoints requieren un JWT token válido en el header `Authorization`.

2. **Límite de Resultados**: El parámetro `$top` tiene un límite máximo de 100 elementos por consulta.

3. **Formato de Fechas**: Las fechas en filtros deben usar formato ISO 8601 (`YYYY-MM-DD`).

4. **Case Sensitivity**: Los valores de status usan camelCase (`pending`, `confirmed`, etc.) debido a la configuración de serialización JSON.

5. **Encoding**: Los caracteres especiales en URLs deben estar codificados. En Angular, `HttpParams` hace esto automáticamente.

6. **Performance**: Para consultas frecuentes, considera cachear resultados en el frontend.

---

## Changelog

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0.0 | 2025-01-16 | Implementación inicial de endpoints OData |
