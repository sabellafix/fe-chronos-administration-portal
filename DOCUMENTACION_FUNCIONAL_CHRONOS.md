# Documentación Funcional - Portal de Administración Chronos

## Resumen Ejecutivo

El Portal de Administración Chronos es una aplicación web tipo back office desarrollada en Angular que permite gestionar la operación completa de múltiples salones de belleza. La plataforma facilita la administración centralizada de estilistas, servicios, clientes y agendamientos a través de un dashboard intuitivo que optimiza la experiencia operacional.

## 1. Arquitectura del Negocio

### 1.1 Modelo de Negocio
El sistema opera bajo un modelo de plataforma multi-salon donde:
- **Empresas (Companies)** gestionan múltiples **Salones (Salons)** como puntos físicos
- **Estilistas (Users/ServiceProviders)** se suscriben a salones específicos
- **Clientes (Customers)** reservan servicios estáticos con estilistas mediante **Bookings**
- **Servicios (Services)** son prestaciones categorizadas ofrecidas por proveedores

### 1.2 Entidades Principales y Relaciones

#### **Company (Empresa)**
```typescript
export class Company {
    id: number;
    companyName: string;
    legalName: string;
    industry: string;
    subscriptionPlan: string;
    subscriptionStartDate: string;
    subscriptionEndDate: string;
    isActive: boolean;
}
```
**Responsabilidad:** Entidad raíz que agrupa múltiples salones bajo una misma administración

#### **Salon (Salón)**
```typescript
export class salon {
    id: string;
    companyId: string;
    name: string;
    description: string;
    capacity: number;
    address: string;
    city: string;
    country: string;
    isActive: boolean;
    company: Company;
    bookings: Booking[];
    services: Service[];
}
```
**Responsabilidad:** Punto físico donde se realizan los servicios, contenedor de operaciones

#### **User (Usuario/Estilista)**
```typescript
export class User {
    id: string;
    roleId: number;
    email: string;
    userRole: string; // 'client' | 'serviceProvider'
    firstName: string;
    lastName: string;
    phone: string;
    isActive: boolean;
    role: Rol;
}
```
**Roles del Sistema:**
- **Admin**: Administración completa
- **ServiceProvider/Stylist**: Estilistas proveedores de servicios
- **Manager**: Gestión de salón específico
- **Customer**: Clientes que reservan
- **Receptionist**: Gestión de citas

#### **Service (Servicio)**
```typescript
export class Service {
    id: string;
    providerId: string;
    categoryId: number;
    serviceName: string;
    serviceDescription: string;
    durationMinutes: number;
    processingTime: number;
    price: number;
    color: string; // Identificación visual
    currency: string;
    type: string;
    isActive: boolean;
    category: Category;
    provider: Supplier;
}
```
**Responsabilidad:** Servicios estáticos ofrecidos con duración, precio y categorización definidos

#### **Booking (Agendamiento)**
```typescript
export class Booking {
    id: string;
    customerId: string;
    supplierId: string; // ID del estilista
    serviceId: string;
    bookingDate: DateOnly;
    startTime: TimeOnly;
    endTime: TimeOnly;
    durationMinutes: number;
    totalPrice: number;
    status: BookingStatus;
    services: Service[];
    customer: Customer;
    user: User; // Estilista asignado
}
```

**Estados del Booking:**
- **Pending (0)**: Reserva pendiente
- **Confirmed (1)**: Cita confirmada
- **InProgress (2)**: Servicio en curso
- **Completed (3)**: Completado exitosamente
- **Cancelled (4)**: Cancelado
- **NoShow (5)**: Cliente no se presentó

#### **Customer (Cliente)**
```typescript
export class Customer {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    notes: string;
    preferredLanguage: string;
    isActive: boolean;
}
```

## 2. Procesos de Negocio Principales

### 2.1 Gestión de Agendamientos (Core Business)

**Flujo Principal:**
1. **Creación de Cita**
   - Cliente o recepcionista inicia reserva
   - Selección de fecha y hora disponible
   - Asignación de estilista específico
   - Elección de servicio(s) del catálogo
   - Cálculo automático de duración y precio

2. **Confirmación y Validación**
   - Verificación de disponibilidad del estilista
   - Validación contra tiempos bloqueados
   - Confirmación de capacidad del salón
   - Notificación a todas las partes

3. **Ejecución del Servicio**
   - Cambio de estado a "InProgress"
   - Seguimiento en tiempo real
   - Gestión de tiempos y recursos

4. **Finalización**
   - Marcado como "Completed"
   - Registro de métricas de performance
   - Facturación y cobro

### 2.2 Gestión de Disponibilidad

**Componentes del Sistema:**
- **Availability**: Horarios regulares por día de semana
- **BlockedTime**: Bloqueos específicos con motivo
- **DateOnly/TimeOnly**: Manejo granular de fechas y horas

**Funcionalidades:**
- Configuración de horarios de trabajo
- Gestión de excepciones y días especiales
- Bloqueo de tiempo por motivos específicos
- Sincronización en tiempo real

### 2.3 Gestión de Servicios y Catálogo

**Proceso de Configuración:**
1. **Definición de Servicio**
   - Nombre y descripción detallada
   - Duración estándar en minutos
   - Precio base y moneda
   - Color para identificación visual
   - Categorización por tipo

2. **Asignación a Proveedores**
   - Estilistas pueden ofrecer servicios específicos
   - Especialización por tipo de servicio
   - Control de competencias y certificaciones

3. **Activación y Control**
   - Estado activo/inactivo por servicio
   - Disponibilidad temporal
   - Gestión de precios dinámicos

## 3. Análisis de Componentes Principales

### 3.1 CalendarWeeklyComponent - Motor Operacional

**Funcionalidad Principal:**
El componente CalendarWeeklyComponent es el núcleo operacional del sistema, proporcionando una vista semanal completa de la operación del salón.

**Características Técnicas:**
- **Rango Temporal**: Vista de 7 días (Lunes a Domingo)
- **Horario Operacional**: 6:00 AM - 10:00 PM (16 horas)
- **Granularidad**: Por hora con soporte para minutos específicos
- **Filtros Dinámicos**: Por servicios y estilistas
- **Actualización en Tiempo Real**: Suscripción a eventos de booking

**Métricas Extraíbles:**
```typescript
// Métricas por fecha
getDailyTotal(date: Date): number // Ingresos diarios
hasBookingsForDate(date: Date): boolean // Ocupación diaria
getBookingsForDate(date: Date): Booking[] // Citas por día

// Métricas por hora
getBookingsForDateTime(date: Date, hour: number): Booking[] // Citas por slot
hasBookings(date: Date, hour: number): boolean // Ocupación por hora

// Métricas de disponibilidad
hasBlockedTime(date: Date, hour: number): boolean // Tiempo bloqueado
getBlockedTimesForDate(date: Date): BlockedTime[] // Bloqueos del día
```

**Información Crítica para Dashboard:**
1. **Tasa de Ocupación**: % de slots reservados vs disponibles
2. **Distribución Horaria**: Patrones de demanda por hora
3. **Ingresos en Tiempo Real**: Acumulado diario y semanal
4. **Eficiencia Operacional**: Tiempo utilizado vs tiempo disponible
5. **Gestión de Conflictos**: Superposiciones y cancelaciones

### 3.2 UsersDetailComponent - Analytics de Performance

**Funcionalidad Principal:**
Componente especializado en análisis detallado de performance individual de estilistas con métricas financieras y operacionales.

**Métricas Principales Calculadas:**
```typescript
// Métricas financieras
totalRevenue: number = 0; // Ingresos totales del período
calculateMetrics(bookings: Booking[]): void {
    this.totalRevenue = bookings.reduce((total, booking) => 
        total + (booking.totalPrice || 0), 0);
}

// Métricas operacionales
totalBookingsCount: number = 0; // Cantidad de citas
uniqueCustomersCount: number = 0; // Clientes únicos atendidos

// Métricas de servicios
getServiceColor(serviceId: string): string // Identificación visual
getServiceDuration(serviceId: string): number // Duración por servicio
getServicePrice(serviceId: string): number // Precio por servicio
```

**Filtros Avanzados:**
- **Rango de Fechas**: Análisis temporal flexible
- **Filtro por Servicios**: Performance por tipo de servicio
- **Estados de Booking**: Análisis de completados vs cancelados

**Información Crítica para Dashboard:**
1. **Revenue per Stylist**: Comparativa de ingresos
2. **Customer Retention**: Clientes únicos vs recurrentes
3. **Service Mix**: Distribución de servicios ofrecidos
4. **Productivity Metrics**: Citas por día/semana
5. **Average Ticket**: Valor promedio por servicio

## 4. Servicios HTTP y APIs Consumidas

### 4.1 BookingService - API Principal
```typescript
// Consultas temporales
getByWeek(dateToSearch: Date): Observable<Booking[]>
getByMonth(dateToSearch: Date): Observable<Booking[]>
getByDay(dateToSearch: Date): Observable<Booking[]>
getByUserDateRange(userId: string, start: Date, end: Date): Observable<Booking[]>

// Operaciones CRUD
createBooking(entity: CreateBookingDto): Observable<Booking>
updateBooking(id: string, entity: UpdateBookingDto): Observable<Booking>
deleteBooking(id: string): Observable<void>

// Consultas específicas
getBookingsBySupplier(): Observable<Booking[]>
getBookingsByCustomer(customerId: string): Observable<Booking[]>
getBookingsByService(serviceId: string): Observable<Booking[]>
```

### 4.2 UserService - Gestión de Personal
```typescript
getUsers(): Observable<any[]>
getUsersByRole(role: string): Observable<any[]>
getUserByEmail(email: string): Observable<any>
post(entity: any): Observable<any> // Crear usuario
put(entity: any, id: string): Observable<any> // Actualizar usuario
```

### 4.3 ServiceService - Catálogo de Servicios
```typescript
getServices(): Observable<Service[]>
getServicesByProvider(providerId: string): Observable<Service[]>
createService(entity: CreateServiceDto): Observable<Service>
createUserServices(userId: string): Observable<Service[]>
```

## 5. Información Relevante para Diseño de Dashboard

### 5.1 KPIs Operacionales Críticos

**Métricas en Tiempo Real:**
1. **Ocupación Actual**: % de estilistas activos en este momento
2. **Ingresos del Día**: Acumulado desde apertura
3. **Citas Pendientes**: Bookings confirmados para el día
4. **Cancelaciones del Día**: Impacto en ingresos proyectados

**Métricas de Performance:**
1. **Revenue per Stylist**: Ranking de productividad
2. **Average Service Duration**: vs tiempo estimado
3. **Customer Satisfaction**: basado en completions vs no-shows
4. **Resource Utilization**: % de tiempo productivo

**Métricas de Tendencia:**
1. **Weekly Revenue Trend**: Comparativa semanal
2. **Popular Services**: Ranking de demanda
3. **Peak Hours**: Análisis de distribución horaria
4. **Customer Retention**: Nuevos vs recurrentes

### 5.2 Dimensiones de Análisis

**Dimensiones Temporales:**
- Hora del día (6 AM - 10 PM)
- Día de la semana
- Semana del mes
- Mes del año
- Período personalizado

**Dimensiones Geográficas:**
- Por salón específico
- Por ciudad
- Por región/país

**Dimensiones de Personal:**
- Por estilista individual
- Por rol/nivel
- Por especialización

**Dimensiones de Servicio:**
- Por categoría de servicio
- Por rango de precio
- Por duración
- Por popularidad

### 5.3 Casos de Uso por Tipo de Usuario

**Dashboard para Administradores:**
- Vista consolidada de todos los salones
- Comparativas de performance entre ubicaciones
- Análisis de rentabilidad por salón
- Métricas de crecimiento y expansión
- Control de suscripciones y facturación

**Dashboard para Managers de Salón:**
- Operación diaria en tiempo real
- Performance del equipo de estilistas
- Análisis de capacidad y optimización
- Gestión de inventario y recursos
- Métricas de satisfacción del cliente

**Dashboard para Estilistas:**
- Agenda personal y disponibilidad
- Métricas individuales de performance
- Historial de clientes atendidos
- Ingresos generados
- Objetivos y metas personales

### 5.4 Visualizaciones Recomendadas

**Panel Principal:**
1. **Gauge Charts**: Ocupación en tiempo real
2. **Line Charts**: Tendencias de ingresos
3. **Bar Charts**: Comparativas entre estilistas
4. **Heatmaps**: Distribución de ocupación por hora/día
5. **Donut Charts**: Distribución de servicios y estados

**Panel Operacional:**
1. **Calendar View**: Integración del CalendarWeeklyComponent
2. **Real-time Status**: Estilistas activos/disponibles
3. **Alert System**: Cancelaciones, no-shows, retrasos
4. **Quick Actions**: Creación rápida de citas

**Panel Analítico:**
1. **Performance Tables**: Rankings y métricas detalladas
2. **Trend Analysis**: Comparativas período anterior
3. **Forecast Charts**: Proyecciones basadas en históricos
4. **Custom Filters**: Análisis por múltiples dimensiones

## 6. Integración de Datos y Métricas

### 6.1 Fuentes de Datos Primarias

**CalendarWeeklyComponent:**
- Bookings por semana, día y hora
- Estados de booking en tiempo real
- Disponibilidad y bloqueos
- Filtros dinámicos por servicios/estilistas

**UsersDetailComponent:**
- Performance individual detallada
- Métricas financieras por período
- Historial de servicios prestados
- Análisis de clientes únicos

**Servicios HTTP:**
- APIs RESTful para todas las entidades
- Consultas optimizadas por período
- Operaciones CRUD completas
- Filtros y búsquedas avanzadas

### 6.2 Cálculos y Agregaciones Sugeridas

**Métricas Derivadas:**
```typescript
// Eficiencia operacional
const occupancyRate = (bookedSlots / totalAvailableSlots) * 100;
const revenuePerHour = totalRevenue / operationalHours;
const averageServiceValue = totalRevenue / completedBookings;

// Análisis de clientes
const customerRetentionRate = (returningCustomers / totalCustomers) * 100;
const noShowRate = (noShowBookings / totalBookings) * 100;
const cancellationRate = (cancelledBookings / totalBookings) * 100;

// Performance de estilistas
const stylistUtilization = (workingHours / availableHours) * 100;
const servicesPerDay = completedBookings / workingDays;
const averageServiceDuration = totalServiceTime / completedServices;
```

## 7. Recomendaciones de Implementación

### 7.1 Arquitectura del Dashboard

**Estructura Modular:**
1. **Header**: KPIs principales y estado general
2. **Main Panel**: Vista operacional con calendario integrado
3. **Side Panel**: Métricas en tiempo real y alertas
4. **Footer**: Acciones rápidas y navegación

**Actualización de Datos:**
- WebSockets para actualizaciones en tiempo real
- Polling optimizado cada 30 segundos
- Cache inteligente para métricas históricas
- Lazy loading para datos detallados

### 7.2 Priorización de Métricas

**Nivel 1 - Críticas (Tiempo Real):**
- Ocupación actual del salón
- Ingresos del día
- Citas en curso
- Alertas operacionales

**Nivel 2 - Importantes (Actualizaciones frecuentes):**
- Performance de estilistas
- Tendencias semanales
- Métricas de satisfacción
- Análisis de servicios

**Nivel 3 - Analíticas (Actualizaciones periódicas):**
- Comparativas históricas
- Proyecciones y forecasting
- Análisis de segmentación
- Reportes personalizados

## 8. Conclusiones y Valor de Negocio

El Portal de Administración Chronos proporciona una base sólida para extraer insights accionables que pueden:

1. **Optimizar la Operación**: Mediante análisis de ocupación y distribución de recursos
2. **Maximizar Ingresos**: A través de pricing dinámico y optimización de servicios
3. **Mejorar la Experiencia**: Reduciendo tiempos de espera y mejorando la satisfacción
4. **Facilitar la Expansión**: Con métricas claras para replicar modelos exitosos

La información más relevante para el dashboard se centra en métricas operacionales en tiempo real, indicadores financieros por período, y análisis de performance tanto individual como agregado, todo esto soportado por una arquitectura robusta de componentes especializados como CalendarWeeklyComponent y UsersDetailComponent.

## 9. Instrucciones para Diseño UX/UI del Dashboard

### 9.1 Directrices Generales para el Agente UX/UI

**Estimado Diseñador UX/UI:**

Basándose en la documentación funcional presentada y la imagen de referencia del dashboard que se adjuntará, por favor genere un diseño de dashboard que incorpore las siguientes especificaciones:

### 9.2 Requisitos de Diseño Específicos

#### **Estructura Layout Principal**
- **Diseño Responsive**: Adaptable a desktop, tablet y móvil
- **Navegación Intuitiva**: Menú lateral o superior con acceso rápido a módulos
- **Jerarquía Visual Clara**: Distinguir entre métricas críticas, importantes y analíticas
- **Tema Coherente**: Paleta de colores profesional para salón de belleza (tonos elegantes y modernos)

#### **Componentes Obligatorios a Integrar**

**1. Panel de KPIs Principales (Header/Top Section)**
```
- Ocupación Actual del Salón (Gauge Chart)
- Ingresos del Día (Contador dinámico)
- Citas en Curso (Indicador en tiempo real)
- Alertas Operacionales (Notificaciones destacadas)
```

**2. Sección Operacional Central**
```
- Vista de Calendario Semanal (basada en CalendarWeeklyComponent)
- Estado de Estilistas (Cards con disponibilidad)
- Lista de Citas del Día (Timeline vertical)
- Acciones Rápidas (Botones CTA para nueva cita)
```

**3. Panel Lateral de Analytics**
```
- Revenue per Stylist (Bar Chart horizontal)
- Servicios Populares (Donut Chart)
- Tendencias Semanales (Line Chart)
- Métricas de Satisfacción (Progress bars)
```

#### **Especificaciones de Visualización de Datos**

**Métricas en Tiempo Real:**
- **Colores**: Verde (#28a745) para positivo, Rojo (#dc3545) para alertas, Azul (#007bff) para neutral
- **Animaciones**: Transiciones suaves para cambios de estado
- **Actualización Visual**: Indicadores parpadeantes para datos en vivo

**Gráficos y Charts:**
- **Heatmap de Ocupación**: Usar gradiente de colores fríos a cálidos
- **Gauge Charts**: Semicírculo con escala 0-100%
- **Line Charts**: Líneas suaves con puntos de datos interactivos
- **Bar Charts**: Barras horizontales para mejor legibilidad de nombres

#### **Experiencia de Usuario (UX)**

**Flujo de Interacción:**
1. **Vista Rápida**: Dashboard principal con overview en 5 segundos
2. **Drill-down**: Click en métricas para detalles específicos
3. **Filtros Dinámicos**: Controles para rango de fechas, estilistas, servicios
4. **Acciones Contextuales**: Botones de acción según el rol del usuario

**Responsive Design:**
- **Desktop (1200px+)**: Layout completo con 3 columnas
- **Tablet (768-1199px)**: Layout de 2 columnas con menú colapsable
- **Mobile (< 768px)**: Layout vertical con cards apiladas

#### **Elementos Específicos por Rol de Usuario**

**Para Administradores:**
- Vista multi-salon con switcher
- Métricas consolidadas prominentes
- Acceso a configuración avanzada

**Para Managers:**
- Foco en operación diaria
- Team performance destacado
- Alertas de capacidad y recursos

**Para Estilistas:**
- Agenda personal centrada
- Métricas individuales
- Objetivos y progreso personal

### 9.3 Implementación Técnica Sugerida

#### **Framework y Tecnología**
- **Compatible con Angular Material**: Para mantener consistencia con el proyecto
- **Chart Library**: Recomendado Chart.js o D3.js para visualizaciones
- **CSS Grid/Flexbox**: Para layout responsive
- **CSS Variables**: Para theming dinámico

#### **Datos de Ejemplo para Mockup**
```typescript
// Datos de muestra para el diseño
const sampleData = {
    occupancyRate: 78,
    dailyRevenue: 2450,
    activeSessions: 12,
    weeklyTrend: [1200, 1450, 1300, 1800, 2100, 2450, 1900],
    topStylists: [
        { name: "María García", revenue: 850, bookings: 8 },
        { name: "Ana López", revenue: 720, bookings: 6 },
        { name: "Carmen Silva", revenue: 680, bookings: 7 }
    ],
    popularServices: [
        { name: "Corte y Peinado", percentage: 35 },
        { name: "Coloración", percentage: 28 },
        { name: "Manicure", percentage: 22 },
        { name: "Tratamientos", percentage: 15 }
    ]
};
```

### 9.4 Entregables Esperados

**Documentación de Diseño:**
1. **Wireframes**: Estructura básica del layout
2. **Mockups de Alta Fidelidad**: Diseño visual completo
3. **Prototipo Interactivo**: Flujos de navegación principales
4. **Design System**: Componentes, colores, tipografías
5. **Especificaciones Técnicas**: Guía de implementación para desarrolladores

**Formatos de Entrega:**
- Figma/Sketch files con componentes organizados
- Export de assets (iconos, imágenes)
- Especificaciones CSS para desarrolladores
- Documentación de patrones de interacción

### 9.5 Criterios de Éxito

**Usabilidad:**
- Usuario puede identificar métricas clave en < 3 segundos
- Acceso a funciones principales en máximo 2 clicks
- Comprensión intuitiva sin necesidad de training

**Performance Visual:**
- Carga inicial < 2 segundos
- Transiciones fluidas < 300ms
- Responsive en todos los dispositivos

**Accesibilidad:**
- Contraste WCAG AA compliant
- Navegación por teclado
- Textos alt para gráficos

---

**Nota Importante:** Utilice la imagen de referencia adjunta como inspiración para el layout general, pero adapte el diseño específicamente para las métricas y funcionalidades del negocio de salones de belleza documentadas en este archivo. Priorice la claridad de la información y la facilidad de uso sobre elementos decorativos.
