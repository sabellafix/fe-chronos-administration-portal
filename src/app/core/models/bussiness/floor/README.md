# Modelo de Datos - Sistema de Pisos y Sitios del Salón

Este directorio contiene las entidades principales para la gestión espacial y operativa de salones de belleza, con soporte completo para representación 3D usando Three.js.

## 📋 Entidades Principales

### 1. **Site** - Sitio/Puesto de Trabajo
Representa un puesto de trabajo individual dentro del salón (silla, lavabo, etc.).

**Características principales:**
- **Ubicación espacial**: Coordenadas X,Y en el plano, referencia al piso
- **Estados operativos**: Disponible, ocupado, reservado, mantenimiento
- **Configuración 3D**: Colores, materiales, efectos para Three.js
- **Dimensiones físicas**: Ancho, alto, profundidad
- **Relaciones**: Tipo de sitio, servicios permitidos

### 2. **Floor** - Piso del Salón
Representa un piso completo del edificio con su configuración espacial.

**Características principales:**
- **Dimensiones**: Ancho, profundidad, altura del piso
- **Cuadrícula**: Sistema de coordenadas para posicionamiento
- **Áreas bloqueadas**: Obstáculos como paredes, columnas
- **Configuración visual**: Colores, texturas, iluminación para 3D

### 3. **SiteType** - Tipo de Sitio
Define categorías y configuraciones estándar para diferentes tipos de puestos.

**Categorías disponibles:**
- `workstation`: Estaciones de trabajo general
- `washstation`: Lavabos para lavado de cabello
- `treatment`: Salas de tratamiento
- `reception`: Área de recepción
- `waiting`: Área de espera
- `storage`: Almacenamiento
- `other`: Otros tipos personalizados

### 4. **ServiceType** - Tipo de Servicio
Define los servicios que se pueden realizar en el salón.

**Categorías de servicios:**
- `hair`: Servicios de cabello
- `beauty`: Servicios de belleza
- `nails`: Servicios de uñas
- `spa`: Servicios de spa
- `massage`: Masajes
- `aesthetic`: Estética
- `consultation`: Consultas
- `other`: Otros servicios

### 5. **SiteService** - Relación Sitio-Servicio
Gestiona qué servicios específicos se pueden realizar en cada sitio específico.

**Funcionalidades:**
- **Configuración específica**: Eficiencia y calidad por combinación
- **Modificadores**: Tiempo y precio específicos
- **Restricciones**: Horarios y limitaciones particulares
- **Métricas**: Rendimiento histórico de la combinación

### 6. **SiteBooking** - Reserva de Sitio
Relaciona las reservas con los sitios específicos y períodos de tiempo.

## 🎯 Casos de Uso

### Representación Espacial 3D
```typescript
// Ejemplo de uso para crear un sitio con configuración 3D
const site = new Site();
site.positionX = 5;
site.positionY = 3;
site.floorId = 'floor-001';
site.threeJsConfig.color = '#8B4513';
site.threeJsConfig.materialType = 'lambert';
```

### Gestión de Estados
```typescript
// Verificar disponibilidad
if (site.isAvailable()) {
    // Asignar reserva
    site.isReserved = true;
    site.currentBookingId = 'booking-123';
}

// Obtener color actual según estado
const currentColor = site.getCurrentColor();
```

### Configuración de Servicios
```typescript
// Verificar si un servicio se puede realizar en un sitio
const siteService = new SiteService();
if (siteService.isAvailableAt(dayOfWeek, time)) {
    // Calcular tiempo total y precio
    const totalTime = siteService.getTotalExecutionTime(baseServiceDuration);
    const finalPrice = siteService.getFinalPrice(basePrice);
}
```

## 🏗️ Arquitectura de Datos

### Relaciones Principales
```
Floor (1) -----> (N) Site
Site (1) -----> (N) SiteBooking
Site (N) -----> (1) SiteType
SiteType (N) -----> (N) ServiceType
Site + ServiceType -----> SiteService (tabla de relación)
```

### Flujo de Datos para Three.js
1. **Floor** proporciona dimensiones y configuración del espacio 3D
2. **Site** proporciona posiciones y configuraciones visuales específicas
3. **SiteType** define modelos 3D y materiales por defecto
4. **SiteService** proporciona efectos y animaciones durante servicios

## 🎨 Configuración Visual

### Colores por Estado
- **Verde** (`#4CAF50`): Disponible
- **Rojo** (`#F44336`): Ocupado  
- **Naranja** (`#FF9800`): Reservado
- **Gris** (`#9E9E9E`): Mantenimiento
- **Gris Oscuro** (`#424242`): Fuera de servicio

### Materiales Three.js
- **Basic**: Sin iluminación, colores planos
- **Lambert**: Iluminación difusa
- **Phong**: Iluminación especular
- **Standard**: PBR (Physically Based Rendering)

## 📦 Instalación y Uso

```typescript
// Importación simple
import { Site, Floor, SiteType, ServiceType, SiteService } from '@core/models/bussiness/floor';

// Importación de interfaces de utilidad
import { GridPosition, SalonLayout, WorkstationData } from '@core/models/bussiness/floor';

// Importación de enums
import { SiteStatus, ServiceCategory, SiteTypeCategory } from '@core/models/bussiness/floor';
```

## 🔧 Próximos Pasos

1. **Implementación en CalendarFloorComponent**: Usar estas entidades en el componente 3D
2. **Servicios de datos**: Crear servicios Angular para gestionar estas entidades
3. **Validaciones**: Implementar validaciones de negocio
4. **API Integration**: Conectar con servicios backend
5. **Animaciones**: Implementar transiciones y efectos 3D

## 📚 Documentación Adicional

- Ver `index.ts` para todas las exportaciones disponibles
- Cada entidad incluye métodos de utilidad para operaciones comunes
- Las configuraciones de Three.js están preparadas para integración directa
- El sistema es extensible para agregar nuevos tipos y configuraciones

---

**Nota**: Este modelo está diseñado específicamente para salones de belleza pero puede adaptarse fácilmente a otros tipos de negocios con espacios de trabajo similares. 