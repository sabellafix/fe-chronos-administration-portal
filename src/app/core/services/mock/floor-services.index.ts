// Servicios Mock para entidades del Floor
export * from './mock-floor.service';
export * from './mock-site-type.service';
export * from './mock-service-type.service';
export * from './mock-site.service';
export * from './mock-site-service.service';

// Re-exportación de clases para importación limpia
import { MockFloorService } from './mock-floor.service';
import { MockSiteTypeService } from './mock-site-type.service';
import { MockServiceTypeService } from './mock-service-type.service';
import { MockSiteService } from './mock-site.service';
import { MockSiteServiceService } from './mock-site-service.service';

export {
    MockFloorService,
    MockSiteTypeService,
    MockServiceTypeService,
    MockSiteService,
    MockSiteServiceService
};

// Configuración de servicios para inyección
export const FLOOR_MOCK_SERVICES = [
    MockFloorService,
    MockSiteTypeService,
    MockServiceTypeService,
    MockSiteService,
    MockSiteServiceService
]; 