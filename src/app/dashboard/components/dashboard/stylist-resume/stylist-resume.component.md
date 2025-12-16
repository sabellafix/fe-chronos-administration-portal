# Stylist Resume Component - Servicios y Estructuras de Datos

## Descripción General
El componente `StylistResumeComponent` muestra un resumen completo de la información y métricas de un estilista, incluyendo:
- Información personal del estilista
- Número de reservas (bookings) del mes
- Número de clientes únicos atendidos
- Ganancias del mes actual
- Comparación con el mes anterior (porcentaje de cambio)
- Actividades recientes de la semana actual

### Arquitectura del Componente
Este componente recibe el **salón como @Input** desde el componente padre, lo que proporciona las siguientes ventajas:
- **Separación de responsabilidades**: El componente padre gestiona la selección del salón
- **Reutilización**: El componente puede usarse en diferentes contextos
- **Reactividad**: Detecta automáticamente cambios en el salón mediante `OnChanges`
- **Simplicidad**: No necesita gestionar la lista de salones internamente

---

## Servicios HTTP Requeridos

### 1. UserService - Obtener Estilistas

#### Endpoint: `getUsersByRole(role: string)`
**Descripción:** Obtiene la lista de usuarios filtrados por rol (en este caso 'serviceProvider')

**Request:**
```typescript
// Método: GET
// URL: ${apiUrl}/api/auth/users/get-users-by-role/${role}
// Headers: Authorization: Bearer ${token}

// Parámetros:
role: string = "serviceProvider"
```

**Response:**
```typescript
User[] = [
  {
    id: string,                    // "3fa85f64-5717-4562-b3fc-2c963f66afa6"
    roleId: number,                // 2
    email: string,                 // "jennifer.bennett@chronos.com"
    userRole: string,              // "serviceProvider"
    firstName: string,             // "Jennifer"
    lastName: string,              // "Bennett"
    phone: string,                 // "+1234567890"
    photo: string,                 // "assets/images/users/user-photo-12.jpg"
    isActive: boolean,             // true
    createdAt: string,             // "2024-01-15T10:30:00Z"
    updatedAt: string,             // "2024-12-06T08:20:00Z"
    lastLoginAt: string,           // "2024-12-06T08:00:00Z"
    salonId: string,               // "salon-uuid-123" - ID del salón al que pertenece
    name: string,                  // Nombre completo
    phoneNumber: string,           // Teléfono alternativo
    entraId: string,              
    b2CId: string,
    userType: string,
    department: string,
    employeeId: string,
    companyName: string,
    address: string,
    role: Rol,                     // Objeto de rol
    isVerified: boolean,           // true
    isDeleted: boolean             // false
  }
]
```

---

### 1.1 UserService - Obtener Estilistas por Salón

#### Endpoint: `getUsersBySalon(salonId: string)`
**Descripción:** Obtiene la lista de usuarios filtrados por salón

**Request:**
```typescript
// Método: GET
// URL: ${apiUrl}/api/auth/users/get-users-by-salon/${salonId}
// Headers: Authorization: Bearer ${token}

// Parámetros:
salonId: string = "salon-uuid-123"
```

**Response:** Mismo formato que `getUsersByRole` (User[])

**Nota:** Este endpoint debe ser implementado en el backend.

---

### 1.2 UserService - Obtener Estilistas por Rol y Salón

#### Endpoint: `getUsersByRoleAndSalon(role: string, salonId: string)`
**Descripción:** Obtiene la lista de usuarios filtrados por rol y salón

**Request:**
```typescript
// Método: GET
// URL: ${apiUrl}/api/auth/users/get-users-by-role-and-salon/${role}/${salonId}
// Headers: Authorization: Bearer ${token}

// Parámetros:
role: string = "serviceProvider"
salonId: string = "salon-uuid-123"
```

**Response:** Mismo formato que `getUsersByRole` (User[])

**Nota:** Este endpoint debe ser implementado en el backend.

---

### 2. BookingService - Obtener Reservas por Rango de Fechas

#### Endpoint: `getByUserDateRange(userId: string, start: Date, end: Date)`
**Descripción:** Obtiene todas las reservas de un usuario (estilista) en un rango de fechas específico

**Request:**
```typescript
// Método: GET
// URL: ${apiUrl}/api/chronos/bookings/get-by-user-date-range
// Headers: Authorization: Bearer ${token}
// Query Params:
{
  id: string,           // "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  start: string,        // "2024/12/1"  (formato: YYYY/M/D)
  end: string          // "2024/12/31" (formato: YYYY/M/D)
}
```

**Response:**
```typescript
Booking[] = [
  {
    id: string,                           // "booking-uuid-123"
    customerId: string,                   // "customer-uuid-456"
    customer: Customer,                   // Objeto customer completo
    supplierId: string,                   // "supplier-uuid-789" (ID del estilista)
    serviceId: string,                    // "service-uuid-321"
    bookingDate: DateOnly,                // { year: 2024, month: 12, day: 6 }
    startTime: TimeOnly,                  // { hour: 10, minute: 0, second: 0 }
    endTime: TimeOnly,                    // { hour: 11, minute: 30, second: 0 }
    durationMinutes: number,              // 90
    totalPrice: number,                   // 75.50
    currency: string | null,              // "COP"
    status: BookingStatus,                // 2 (Completed)
    clientNotes: string | null,           // "Por favor usar productos sin amoníaco"
    providerNotes: string | null,         // "Cliente regular, prefiere cortes modernos"
    bookingReference: string | null,      // "BKG-2024-001234"
    createdAt: string,                    // "2024-12-01T08:00:00Z"
    updatedAt: string,                    // "2024-12-06T11:30:00Z"
    confirmedAt: string | null,           // "2024-12-01T09:00:00Z"
    completedAt: string | null,           // "2024-12-06T11:30:00Z"
    cancelledAt: string | null,           // null
    cancellationReason: string | null,    // null
    bookingServices: BookingServiceDTO[] | null,  // Array de servicios asociados
    services: Service[] | null,           // Array completo de servicios
    user: User                            // Información del estilista (supplier)
  }
]
```

**Estructura BookingStatus (Enum):**
```typescript
enum BookingStatus {
  Pending = 0,
  Confirmed = 1,
  InProgress = 2,
  Completed = 3,
  Cancelled = 4
}
```

**Nota Importante:** El enum BookingStatus.Completed tiene el valor `3`, no `2`.

**Estructura DateOnly:**
```typescript
interface DateOnly {
  year: number,     // 2024
  month: number,    // 12 (1-12)
  day: number       // 6 (1-31)
}
```

**Estructura TimeOnly:**
```typescript
interface TimeOnly {
  hour: number,     // 10 (0-23)
  minute: number,   // 30 (0-59)
  second: number    // 0 (0-59)
}
```

---

## Flujo de Datos en el Componente

### 1. Carga Inicial
```typescript
// El componente recibe el salón como @Input desde el componente padre
@Input() salon: Salon | null = null;

ngOnInit() {
  // Cargar lista de estilistas filtrados por el salón del Input
  loadStylists()
}

loadStylists() {
  const salonId = this.salon?.id
  
  // Determinar qué servicio llamar según si hay salón
  const serviceCall = salonId 
    ? userService.getUsersByRoleAndSalon('serviceProvider', salonId)
    : userService.getUsersByRole('serviceProvider')
  
  serviceCall.subscribe(stylists => {
    // Filtrar solo activos
    this.stylists = stylists.filter(u => u.isActive)
    
    // Filtrado adicional en frontend como fallback
    if (salonId) {
      this.stylists = this.stylists.filter(
        u => !u.salonId || u.salonId === salonId
      )
    }
    
    // Seleccionar primer estilista por defecto
    if (this.stylists.length > 0) {
      selectStylist(stylists[0].id)
    }
  })
}
```

### 1.1 Detección de Cambios en el Input
```typescript
ngOnChanges(changes: SimpleChanges) {
  // Detectar cuando el salón cambia desde el componente padre
  if (changes['salon'] && !changes['salon'].firstChange) {
    // Recargar estilistas del nuevo salón
    this.loadStylists()
  }
}
```

### 2. Selección de Estilista
```typescript
selectStylist(userId: string) {
  // Calcular rangos de fechas
  const currentMonth = {
    start: new Date(2024, 11, 1),   // Inicio del mes actual
    end: new Date(2024, 11, 31)     // Fin del mes actual
  }
  
  const previousMonth = {
    start: new Date(2024, 10, 1),   // Inicio del mes anterior
    end: new Date(2024, 10, 30)     // Fin del mes anterior
  }
  
  // Obtener bookings en paralelo usando forkJoin
  forkJoin({
    currentMonthBookings: bookingService.getByUserDateRange(
      userId, 
      currentMonth.start, 
      currentMonth.end
    ),
    previousMonthBookings: bookingService.getByUserDateRange(
      userId, 
      previousMonth.start, 
      previousMonth.end
    )
  }).subscribe(result => {
    processStylistData(
      result.currentMonthBookings,
      result.previousMonthBookings
    )
  })
}
```

### 3. Procesamiento de Métricas
```typescript
processStylistData(currentBookings: Booking[], previousBookings: Booking[]) {
  // Filtrar solo bookings completados
  const completedCurrent = currentBookings.filter(
    b => b.status === BookingStatus.Completed
  )
  
  // 1. Calcular número de bookings
  bookingsCount = completedCurrent.length
  
  // 2. Calcular clientes únicos
  const uniqueCustomers = new Set(completedCurrent.map(b => b.customerId))
  clientsCount = uniqueCustomers.size
  
  // 3. Calcular ganancias mes actual
  currentMonthEarnings = completedCurrent.reduce(
    (total, booking) => total + booking.totalPrice, 
    0
  )
  
  // 4. Calcular ganancias mes anterior
  const completedPrevious = previousBookings.filter(
    b => b.status === BookingStatus.Completed
  )
  const previousMonthEarnings = completedPrevious.reduce(
    (total, booking) => total + booking.totalPrice, 
    0
  )
  
  // 5. Calcular porcentaje de cambio
  if (previousMonthEarnings > 0) {
    earningsPercentageChange = 
      ((currentMonthEarnings - previousMonthEarnings) / previousMonthEarnings) * 100
  }
  
  // 6. Obtener actividades recientes (última semana)
  recentActivities = getRecentActivities(currentBookings)
}
```

### 4. Actividades Recientes
```typescript
getRecentActivities(bookings: Booking[]): RecentActivity[] {
  // 1. Filtrar bookings de la semana actual
  const weekBookings = bookings.filter(booking => {
    const bookingDate = parseBookingDate(booking.bookingDate)
    return bookingDate >= startOfWeek && bookingDate <= endOfWeek
  })
  
  // 2. Ordenar por fecha descendente
  weekBookings.sort((a, b) => dateB - dateA)
  
  // 3. Tomar últimas 5
  return weekBookings.slice(0, 5).map(booking => ({
    date: parseBookingDate(booking.bookingDate),
    day: booking.bookingDate.day,
    month: getMonthShortName(booking.bookingDate),
    serviceName: booking.services[0]?.name || 'Service',
    bookingId: booking.id
  }))
}
```

---

## Interfaces del Componente

### StylistSummary
```typescript
interface StylistSummary {
  user: User;
  bookingsCount: number;              // Total de reservas completadas
  clientsCount: number;               // Clientes únicos atendidos
  currentWeekEarnings: number;        // Ganancias de la semana actual
  previousWeekEarnings: number;       // Ganancias de la semana anterior
  earningsPercentageChange: number;   // Porcentaje de cambio
  recentActivities: RecentActivity[]; // Últimas 5 actividades
}
```

### RecentActivity
```typescript
interface RecentActivity {
  date: Date;           // Fecha completa de la actividad
  day: number;          // Día del mes (1-31)
  month: string;        // Mes corto ("Sep", "Oct", "Dec")
  serviceName: string;  // Nombre del servicio prestado
  bookingId: string;    // ID del booking
}
```

---

## Servicios Adicionales Necesarios (Recomendados)

### 3. Servicio para Obtener Estadísticas Agregadas (Opcional)
Si el backend puede proporcionar estadísticas pre-calculadas, sería más eficiente:

#### Endpoint: `getStylistStats(userId: string, startDate: Date, endDate: Date)`
**Request:**
```typescript
{
  userId: string,
  startDate: string,    // "2024-12-01"
  endDate: string      // "2024-12-31"
}
```

**Response:**
```typescript
{
  totalBookings: number,           // 29
  completedBookings: number,       // 25
  cancelledBookings: number,       // 4
  uniqueClients: number,           // 8
  totalEarnings: number,           // 26256.50
  averageBookingValue: number,     // 1050.26
  topServices: [
    {
      serviceId: string,
      serviceName: string,
      count: number,
      totalEarnings: number
    }
  ]
}
```

---

## Notas de Implementación

1. **Autenticación:** Todos los endpoints requieren el token Bearer en los headers
2. **Manejo de Errores:** Implementar try-catch y mostrar mensajes de error apropiados
3. **Loading States:** Mostrar indicadores de carga mientras se obtienen los datos
4. **Cache:** Considerar implementar cache para evitar peticiones repetidas
5. **Optimización:** Usar `forkJoin` para peticiones paralelas cuando sea posible
6. **Filtros de Estado:** Solo considerar bookings con status `Completed` para cálculos de ganancias
7. **Formato de Moneda:** Usar pipes de Angular para formatear valores monetarios
8. **Internacionalización:** Los nombres de meses y formatos de fecha pueden variar según locale

---

## Uso del Componente

### En el Componente Padre

```html
<!-- Pasar el salón seleccionado como Input -->
<app-stylist-resume [salon]="selectedSalon"></app-stylist-resume>

<!-- Si no hay salón seleccionado, mostrar todos los estilistas -->
<app-stylist-resume [salon]="null"></app-stylist-resume>
```

```typescript
// En el componente padre
export class DashboardComponent {
  selectedSalon: Salon | null = null;
  
  onSalonSelected(salon: Salon) {
    this.selectedSalon = salon;
    // El componente hijo detectará el cambio automáticamente
  }
}
```

---

## Dependencias del Componente

```typescript
import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { UserService } from '@app/core/services/http/user.service';
import { BookingService } from '@app/core/services/http/booking.service';
import { User } from '@app/core/models/bussiness/user';
import { Booking } from '@app/core/models/bussiness/booking';
import { Salon } from '@app/core/models/bussiness/salon';
import { BookingStatus } from '@app/core/models/bussiness/enums';
import { forkJoin } from 'rxjs';
```

### Interfaces del Componente

```typescript
// Input property
@Input() salon: Salon | null = null;

// Implementar OnChanges para detectar cambios en el Input
export class StylistResumeComponent implements OnInit, OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['salon'] && !changes['salon'].firstChange) {
      this.loadStylists();
    }
  }
}
```

---

## Cambios Requeridos en el Backend

### 1. Agregar campo `salonId` al modelo User (UserDto)

El backend debe agregar el campo `salonId` al UserDto para asociar usuarios (especialmente estilistas) con salones específicos:

```csharp
public class UserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; }
    public UserRole UserRole { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Phone { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public string SalonId { get; set; }  // ← NUEVO CAMPO
}
```

### 2. Implementar endpoints de filtrado por salón

#### Endpoint: GET `/api/Users/get-users-by-salon/{salonId}`
Retorna todos los usuarios asociados a un salón específico.

#### Endpoint: GET `/api/Users/get-users-by-role-and-salon/{role}/{salonId}`
Retorna usuarios filtrados por rol y salón (ejemplo: todos los estilistas de un salón específico).

### 3. Actualizar CreateUserDto y UpdateUserDto

Agregar el campo `salonId` a los DTOs de creación y actualización:

```csharp
public class CreateUserDto
{
    // ... campos existentes ...
    public string? SalonId { get; set; }  // ← NUEVO CAMPO (opcional)
}

public class UpdateUserDto
{
    // ... campos existentes ...
    public string? SalonId { get; set; }  // ← NUEVO CAMPO (opcional)
}
```

### 4. Agregar migración de base de datos

```sql
ALTER TABLE Users
ADD SalonId UNIQUEIDENTIFIER NULL
FOREIGN KEY (SalonId) REFERENCES Salons(Id);

-- Crear índice para mejorar performance en consultas
CREATE INDEX IX_Users_SalonId ON Users(SalonId);
```

