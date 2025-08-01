# Servicios Mock - Sistema de Pisos y Sitios

Este documento describe los servicios mock creados para gestionar las entidades del sistema de pisos y sitios del salón de belleza.

## 📋 Servicios Disponibles

### 1. **MockFloorService**
Gestiona los pisos del salón de belleza.

**Datos inicializados:**
- **2 pisos estándar** con configuración completa
- **Piso 1**: Planta baja con tonos cálidos (beige)
- **Piso 2**: Primer piso con tonos frescos (lavanda)
- **Dimensiones**: 12x10 metros con cuadrícula de 1m
- **Áreas bloqueadas**: Paredes perimetrales, columnas, equipamiento

```typescript
import { MockFloorService } from '@core/services/mock/floor-services.index';

// Obtener pisos activos
mockFloorService.getActiveFloors().subscribe(floors => {
    console.log('Pisos disponibles:', floors);
});

// Obtener piso por defecto
mockFloorService.getDefaultFloor().subscribe(floor => {
    console.log('Piso principal:', floor);
});
```

### 2. **MockSiteTypeService**
Gestiona los tipos de sitios disponibles.

**Tipos inicializados:**
- **Workstation** (sitetype-001): Estaciones de trabajo principales
- **Washstation** (sitetype-002): Lavabos especializados  
- **Reception** (sitetype-003): Área de recepción
- **Waiting** (sitetype-004): Sillas de espera
- **Storage** (sitetype-005): Áreas de almacenamiento

```typescript
import { MockSiteTypeService } from '@core/services/mock/floor-services.index';

// Obtener tipos por categoría
mockSiteTypeService.getByCategory('workstation').subscribe(types => {
    console.log('Tipos de estaciones de trabajo:', types);
});

// Obtener todos los tipos activos
mockSiteTypeService.getActiveSiteTypes().subscribe(types => {
    console.log('Tipos de sitios activos:', types);
});
```

### 3. **MockServiceTypeService**
Gestiona los tipos de servicios disponibles.

**Servicios inicializados:**
- **Corte de Cabello** (servicetype-001): 25,000 COP
- **Lavado y Secado** (servicetype-002): 15,000 COP
- **Peinado y Styling** (servicetype-003): 35,000 COP
- **Tratamiento Capilar** (servicetype-004): 45,000 COP
- **Manicure** (servicetype-005): 30,000 COP
- **Consulta Inicial** (servicetype-006): 10,000 COP

```typescript
import { MockServiceTypeService } from '@core/services/mock/floor-services.index';

// Obtener servicios por categoría
mockServiceTypeService.getByCategory('hair').subscribe(services => {
    console.log('Servicios de cabello:', services);
});

// Obtener servicios compatibles con un tipo de sitio
mockServiceTypeService.getServiceTypesForSiteType('sitetype-001').subscribe(services => {
    console.log('Servicios para workstations:', services);
});
```

### 4. **MockSiteService**
Gestiona los sitios individuales del salón.

**Distribución estándar por piso:**
- **10 Workstations**: Centro del salón (2 filas de 5)
- **5 Washstations**: Lado izquierdo (columna vertical)
- **1 Reception**: Esquina superior derecha (solo piso 1)
- **5 Waiting**: Área frontal (fila horizontal)
- **3 Storage**: Área posterior (distribución espaciada)

```typescript
import { MockSiteService } from '@core/services/mock/floor-services.index';

// Obtener layout completo de un piso
mockSiteService.getFloorLayout('floor-001').subscribe(layout => {
    console.log('Workstations:', layout.workstations);
    console.log('Washstations:', layout.washstations);
    console.log('Reception:', layout.reception);
    console.log('Waiting:', layout.waiting);
    console.log('Storage:', layout.storage);
});

// Obtener sitios disponibles
mockSiteService.getAvailableSites('floor-001').subscribe(sites => {
    console.log('Sitios disponibles en piso 1:', sites);
});

// Actualizar estado de un sitio
mockSiteService.updateSiteStatus('site-001', 'occupied').subscribe(site => {
    console.log('Sitio actualizado:', site);
});
```

### 5. **MockSiteServiceService**
Gestiona las relaciones entre sitios específicos y servicios específicos.

**Relaciones configuradas:**
- **Workstations**: Corte, Peinado, Manicure
- **Washstations**: Lavado, Tratamientos
- **Reception**: Solo consultas
- **Waiting/Storage**: Sin servicios activos

```typescript
import { MockSiteServiceService } from '@core/services/mock/floor-services.index';

// Obtener mejor sitio para un servicio
mockSiteServiceService.getBestSiteForService('servicetype-001').subscribe(siteService => {
    console.log('Mejor sitio para corte:', siteService);
});

// Obtener métricas de un servicio
mockSiteServiceService.getServiceMetrics('servicetype-001').subscribe(metrics => {
    console.log('Métricas del servicio:', metrics);
});

// Actualizar métricas de rendimiento
mockSiteServiceService.updatePerformanceMetrics('siteservice-001', 4.5, 45, 25000, true)
    .subscribe(updated => {
        console.log('Métricas actualizadas:', updated);
    });
```

## 🎯 Uso Conjunto de los Servicios

### Ejemplo: Obtener información completa de un piso

```typescript
import { 
    MockFloorService, 
    MockSiteService, 
    MockSiteTypeService,
    MockServiceTypeService,
    MockSiteServiceService 
} from '@core/services/mock/floor-services.index';

export class FloorDataService {
    constructor(
        private mockFloorService: MockFloorService,
        private mockSiteService: MockSiteService,
        private mockSiteTypeService: MockSiteTypeService,
        private mockServiceTypeService: MockServiceTypeService,
        private mockSiteServiceService: MockSiteServiceService
    ) {}

    async getCompleteFloorData(floorId: string) {
        const [floor, layout, siteTypes, serviceTypes] = await Promise.all([
            this.mockFloorService.get(floorId).toPromise(),
            this.mockSiteService.getFloorLayout(floorId).toPromise(),
            this.mockSiteTypeService.getActiveSiteTypes().toPromise(),
            this.mockServiceTypeService.getActiveServiceTypes().toPromise()
        ]);

        return {
            floor,
            layout,
            siteTypes,
            serviceTypes,
            totalSites: layout.sites.length,
            availableSites: layout.sites.filter(s => s.isAvailable()).length
        };
    }
}
```

### Ejemplo: Crear una nueva reserva

```typescript
async createBooking(siteId: string, serviceTypeId: string) {
    // 1. Verificar disponibilidad del sitio
    const site = await this.mockSiteService.get(siteId).toPromise();
    if (!site.isAvailable()) {
        throw new Error('Sitio no disponible');
    }

    // 2. Verificar compatibilidad sitio-servicio
    const siteServices = await this.mockSiteServiceService.getBySite(siteId).toPromise();
    const compatibleService = siteServices.find(ss => ss.serviceTypeId === serviceTypeId);
    if (!compatibleService) {
        throw new Error('Servicio no compatible con este sitio');
    }

    // 3. Actualizar estado del sitio
    await this.mockSiteService.updateSiteStatus(siteId, 'occupied').toPromise();

    // 4. Obtener información del servicio
    const serviceType = await this.mockServiceTypeService.get(serviceTypeId).toPromise();
    const finalPrice = compatibleService.getFinalPrice(serviceType.pricing.basePrice);
    const totalTime = compatibleService.getTotalExecutionTime(serviceType.duration.default);

    return {
        site,
        serviceType,
        siteService: compatibleService,
        estimatedDuration: totalTime,
        finalPrice
    };
}
```

## 🛠️ Configuración en Angular

### Agregar a providers en un módulo:

```typescript
import { FLOOR_MOCK_SERVICES } from '@core/services/mock/floor-services.index';

@NgModule({
    providers: [
        ...FLOOR_MOCK_SERVICES,
        // otros providers
    ]
})
export class YourModule { }
```

### Uso en componentes:

```typescript
import { MockSiteService } from '@core/services/mock/floor-services.index';

@Component({
    selector: 'app-floor-view',
    templateUrl: './floor-view.component.html'
})
export class FloorViewComponent implements OnInit {
    sites: Site[] = [];
    
    constructor(private mockSiteService: MockSiteService) {}
    
    ngOnInit() {
        this.loadFloorData();
    }
    
    loadFloorData() {
        this.mockSiteService.getSitesByFloor('floor-001').subscribe(sites => {
            this.sites = sites;
        });
    }
}
```

## 📊 Datos Simulados

### Estados de sitios (distribuidos aleatoriamente):
- **70%** Available (Verde)
- **15%** Occupied (Rojo)  
- **10%** Reserved (Naranja)
- **5%** Maintenance (Gris)

### Métricas de rendimiento simuladas:
- **Calificaciones**: 3.0 - 5.0 estrellas
- **Ejecuciones**: 10 - 60 por sitio-servicio
- **Eficiencia**: Basada en compatibilidad sitio-servicio
- **Ingresos**: Calculados según ejecuciones y precios

## 🔄 Persistencia

Todos los servicios utilizan **localStorage** para persistencia, con las siguientes claves:
- `MOCK_FLOORS`
- `MOCK_SITE_TYPES`
- `MOCK_SERVICE_TYPES`
- `MOCK_SITES`
- `MOCK_SITE_SERVICES`

Los datos se mantienen entre sesiones del navegador y se reinicializan automáticamente si se borran.

## 🚀 Próximos Pasos

1. **Integrar con CalendarFloorComponent** para visualización 3D
2. **Crear interfaces de gestión** para modificar configuraciones
3. **Añadir validaciones** de negocio más complejas
4. **Implementar WebSockets** para actualizaciones en tiempo real
5. **Conectar con APIs** reales cuando estén disponibles

---

**Nota**: Estos servicios están diseñados para desarrollo y testing. En producción, deberían reemplazarse por servicios que consuman APIs reales. 