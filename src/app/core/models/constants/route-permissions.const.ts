export interface RoutePermissionConfig {
  route: string;
  resource: string;
}

export const ROUTE_PERMISSION_MAPPINGS: RoutePermissionConfig[] = [
  { route: 'dashboard', resource: 'dashboard' },
  { route: 'users', resource: 'users' },
  { route: 'services', resource: 'services' },
  { route: 'categories', resource: 'categories' },
  { route: 'companies', resource: 'companies' },
  { route: 'calendar', resource: 'calendar' },
  { route: 'bookings', resource: 'bookings' },
  { route: 'customers', resource: 'customers' },
  { route: 'roles', resource: 'roles' },
  { route: 'salons', resource: 'salon' },
  { route: 'chat', resource: 'chat' }
];

export class RoutePermissionsConst {
  static getResourceByRoute(route: string): string | null {
    const cleanRoute = route.split('/')[0];
    const config = ROUTE_PERMISSION_MAPPINGS.find(m => m.route === cleanRoute);
    return config?.resource || null;
  }

  static getRouteByResource(resource: string): string | null {
    const config = ROUTE_PERMISSION_MAPPINGS.find(m => m.resource === resource);
    return config?.route || null;
  }
}
