export interface RoutePermissionConfig {
  route: string;
  permissionName: string;
}

export const ROUTE_PERMISSION_MAPPINGS: RoutePermissionConfig[] = [
  { route: 'dashboard', permissionName: 'dashboard.read' },
  { route: 'users', permissionName: 'users.read' },
  { route: 'services', permissionName: 'services.read' },
  { route: 'categories', permissionName: 'categories.read' },
  { route: 'companies', permissionName: 'companies.read' },
  { route: 'calendar', permissionName: 'calendar.read' },
  { route: 'bookings', permissionName: 'bookings.read' },
  { route: 'customers', permissionName: 'customers.read' },
  { route: 'roles', permissionName: 'roles.read' },
  { route: 'salons', permissionName: 'salon.read' },
  { route: 'chat', permissionName: 'chat.access' }
];

export class RoutePermissionsConst {
  static getPermissionNameByRoute(route: string): string | null {
    const cleanRoute = route.split('/')[0];
    const config = ROUTE_PERMISSION_MAPPINGS.find(m => m.route === cleanRoute);
    return config?.permissionName || null;
  }

  static getRouteByPermissionName(permissionName: string): string | null {
    const config = ROUTE_PERMISSION_MAPPINGS.find(m => m.permissionName === permissionName);
    return config?.route || null;
  }
}
