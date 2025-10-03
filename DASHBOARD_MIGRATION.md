# Migración del Dashboard - React a Angular 17

## 📋 Resumen

Este documento describe la migración de los componentes del dashboard de Figma (React) a componentes Angular 17 con Bootstrap 5.

## ✅ Componentes Migrados

### 1. **KpiCardComponent** (`kpi-card/`)
Tarjeta de indicadores clave de rendimiento (KPI).

**Props migrados a @Input():**
- `title: string` - Título del KPI
- `value: string` - Valor principal
- `change: string` - Cambio porcentual
- `trend: 'up' | 'down'` - Tendencia
- `icon: 'gauge' | 'revenue' | 'sessions' | 'stylists'` - Tipo de icono

**Características:**
- Iconos Bootstrap Icons en lugar de Lucide React
- Estilos Bootstrap 5 en lugar de Tailwind CSS
- Animación hover con transiciones CSS

### 2. **DashboardHeaderComponent** (`dashboard-header/`)
Cabecera del dashboard con selector de salón, filtro de fecha y tarjetas KPI.

**Props migrados a @Input():**
- `selectedSalon: string` - Salón seleccionado
- `dateFilter: Date` - Fecha de filtro
- `notifications: number` - Número de notificaciones

**Props migrados a @Output():**
- `salonChange: EventEmitter<string>` - Evento de cambio de salón
- `dateChange: EventEmitter<Date>` - Evento de cambio de fecha

**Características:**
- Select nativo de Bootstrap en lugar de Radix UI
- Avatar con iniciales del usuario
- Grid responsivo de tarjetas KPI

### 3. **WeeklyCalendarComponent** (`weekly-calendar/`)
Calendario semanal con vista de citas por día y hora.

**Props migrados a @Input():**
- `dateFilter: Date` - Fecha base para el calendario

**Características:**
- Grid CSS para layout del calendario (8 columnas: hora + 7 días)
- Navegación por semanas (anterior/siguiente/hoy)
- Slots de tiempo de 6:00 a 22:00
- Cards de citas con código de colores por estado
- Scroll vertical para visualización de múltiples horas

**Estado local (en lugar de useState):**
- `currentWeek: Date` - Semana actual
- `weekDays: Date[]` - Array de 7 días de la semana
- `timeSlots: string[]` - Slots de tiempo generados

### 4. **TodayAppointmentsComponent** (`today-appointments/`)
Lista de citas del día con detalles y menú de acciones.

**Características:**
- Lista scrollable de citas
- Dropdown de Bootstrap para menú de acciones
- Footer con totales del día
- Actualización automática de hora actual cada minuto
- Badges de estado con variantes de Bootstrap

**Estado local:**
- `appointments: DailyAppointment[]` - Lista de citas
- `currentTime: string` - Hora actual (actualizada cada minuto)

### 5. **StylistsStatusComponent** (`stylists-status/`)
Grid de tarjetas con información y estado de cada estilista.

**Características:**
- Grid responsivo (1-3 columnas según viewport)
- Avatar con iniciales
- Badges de estado (disponible, ocupado, descanso, offline)
- Barra de progreso para eficiencia
- Lista de especialidades con badges

**Estado local:**
- `stylists: StylistInfo[]` - Lista de estilistas

## 📁 Modelos TypeScript Creados

**Archivo:** `src/app/core/models/bussiness/dashboard.ts`

### Interfaces:
- `KpiData` - Datos de tarjeta KPI
- `CalendarBooking` - Cita en el calendario
- `DailyAppointment` - Cita del día
- `StylistInfo` - Información de estilista
- `BookingStatusConfig` - Configuración de estado de cita
- `StylistStatusConfig` - Configuración de estado de estilista
- `QuickMetric` - Métrica rápida del sidebar
- `RealtimeAlert` - Alerta en tiempo real
- `RevenueData` - Datos de ingresos
- `ServiceDistributionData` - Distribución de servicios
- `StylistPerformanceData` - Rendimiento de estilista

### Tipos:
- `KpiIconType` - Tipos de iconos para KPI
- `KpiTrend` - Tendencia (up/down)
- `BookingStatus` - Estados de cita
- `StylistStatus` - Estados de estilista

## 🔄 Conversiones Realizadas

### React → Angular

| React | Angular | Notas |
|-------|---------|-------|
| `useState()` | Propiedades de clase | No se usaron signals para mantener compatibilidad |
| `useEffect()` | `ngOnInit()`, `setInterval()` | Lifecycle hooks de Angular |
| `props` | `@Input()` | Props de entrada |
| `callback props` | `@Output() + EventEmitter` | Eventos personalizados |
| Tailwind CSS | Bootstrap 5 | Clases de utilidad equivalentes |
| Lucide Icons | Bootstrap Icons | Biblioteca de iconos |
| `className` | `class`, `[class]`, `[class.xxx]` | Binding de clases |
| Radix UI components | Bootstrap components | Componentes nativos de Bootstrap |

### Estilos CSS

| Tailwind | Bootstrap 5 |
|----------|-------------|
| `className="flex"` | `class="d-flex"` |
| `className="items-center"` | `class="align-items-center"` |
| `className="justify-between"` | `class="justify-content-between"` |
| `className="space-x-4"` | `class="gap-4"` |
| `className="text-muted-foreground"` | `class="text-muted"` |
| `className="rounded-lg"` | `class="rounded"` |
| `className="border"` | `class="border"` |
| `className="shadow-md"` | `class="shadow-sm"` |
| `className="grid grid-cols-4"` | `class="row"` + `class="col-*"` |

## 🎨 Sistema de Colores

Los colores de Tailwind se mapearon a variantes de Bootstrap:

- `bg-blue-100` → `bg-primary-subtle` (usando clases custom en SCSS)
- `bg-green-100` → `bg-success-subtle`
- `bg-yellow-100` → `bg-warning-subtle`
- `bg-red-100` → `bg-danger-subtle`
- `bg-gray-100` → `bg-secondary-subtle`

## 📦 Estructura de Archivos

Cada componente sigue la estructura estándar de Angular:

```
component-name/
├── component-name.component.ts      # Lógica del componente
├── component-name.component.html    # Template
├── component-name.component.scss    # Estilos
└── component-name.component.spec.ts # Tests
```

## 🚀 Integración en el Módulo

Todos los componentes fueron declarados en `dashboard.module.ts`:

```typescript
declarations: [
  // ... otros componentes
  DashboardComponent,
  KpiCardComponent,
  DashboardHeaderComponent,
  WeeklyCalendarComponent,
  TodayAppointmentsComponent,
  StylistsStatusComponent,
]
```

## 📝 Componente Principal

**DashboardComponent** (`dashboard/`)

Integra todos los subcomponentes y maneja:
- Estado del salón seleccionado
- Filtro de fecha
- Comunicación entre componentes vía @Input/@Output

## 🔧 Próximos Pasos

### Componentes Pendientes:
- [ ] **AnalyticsSidebar** - Barra lateral con analíticas
- [ ] **RevenueChart** - Gráfico de ingresos
- [ ] **ServiceDistribution** - Distribución de servicios
- [ ] **StylistPerformance** - Rendimiento de estilistas

### Mejoras Sugeridas:
- [ ] Integrar con servicios reales en lugar de datos mock
- [ ] Implementar gestión de estado centralizada (NgRx o signals)
- [ ] Añadir animaciones con Angular Animations
- [ ] Implementar lazy loading de componentes
- [ ] Añadir internacionalización (i18n)
- [ ] Implementar SSR (Server-Side Rendering)

## 🧪 Testing

Cada componente incluye un archivo `.spec.ts` con tests básicos:
- Creación del componente
- Inputs y Outputs
- Métodos principales
- Renderizado de datos

Para ejecutar los tests:
```bash
npm test
```

## 🏃 Ejecución

Para ejecutar el proyecto en modo desarrollo:

```bash
cd fe-chronos-administration-portal
npm install
npm start
```

El dashboard estará disponible en:
```
http://localhost:4200/dashboard
```

## 📚 Recursos

- [Angular 17 Docs](https://angular.io/docs)
- [Bootstrap 5 Docs](https://getbootstrap.com/docs/5.3/)
- [Bootstrap Icons](https://icons.getbootstrap.com/)
- [Angular Material](https://material.angular.io/) (ya integrado en el proyecto)

## 🐛 Troubleshooting

### Error: Cannot find module '@app/core/models'
Asegúrate de que el alias `@app` está configurado en `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@app/*": ["src/app/*"]
    }
  }
}
```

### Componentes no se muestran
1. Verifica que todos los componentes estén declarados en `dashboard.module.ts`
2. Revisa que los selectores coincidan (`app-kpi-card`, etc.)
3. Ejecuta `ng serve` de nuevo para recompilar

### Estilos de Bootstrap no se aplican
1. Verifica que Bootstrap esté importado en `styles.scss`
2. Asegúrate de que Bootstrap Icons está configurado
3. Revisa que no haya conflictos con Angular Material

## 👥 Autor

Migración realizada para el proyecto Chronos - Portal de Administración

---

**Fecha de migración:** Septiembre 2025
**Versión Angular:** 17.3.0
**Versión Bootstrap:** 5.x (vía ngx-bootstrap 12.0.0)
