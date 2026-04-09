import { Injectable } from '@angular/core';
import { AuthService } from '../http/auth.service';
import { RoutePermissionsConst } from '../../models/constants/route-permissions.const';
import { Permission } from '../../models/bussiness/permission';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor(private authService: AuthService) {}

  hasPermission(permissionName: string): boolean {
    const permissions = this.getPermissions();
    
    if (!permissions || permissions.length === 0) {
      return false;
    }

    return permissions.some(
      permission => permission.name === permissionName && permission.isActive
    );
  }

  hasAnyPermission(permissionNames: string[]): boolean {
    return permissionNames.some(name => this.hasPermission(name));
  }

  hasAllPermissions(permissionNames: string[]): boolean {
    return permissionNames.every(name => this.hasPermission(name));
  }

  hasPermissionForRoute(route: string): boolean {
    const routePath = this.extractRoutePath(route);
    
    if (!routePath) {
      return true;
    }

    const permissionName = RoutePermissionsConst.getPermissionNameByRoute(routePath);
    
    if (!permissionName) {
      return true;
    }

    return this.hasPermission(permissionName);
  }

  getPermissions(): Permission[] {
    return this.authService.getPermissionsLogged();
  }

  private extractRoutePath(url: string): string {
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    const segments = cleanUrl.split('/').filter(segment => segment !== '');
    return segments.length > 0 ? segments[0] : '';
  }
}
