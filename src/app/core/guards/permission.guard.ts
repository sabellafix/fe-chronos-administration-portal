import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/http/auth.service';
import { RoutePermissionsConst } from '../models/constants/route-permissions.const';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('canActivate-permission', route, state);
    const routePath = this.extractRoutePath(state.url);
    
    if (!routePath) {
      return true;
    }

    const resource = RoutePermissionsConst.getResourceByRoute(routePath);
    
    if (!resource) {
      return true;
    }

    const hasPermission = this.checkPermission(resource, 'read');

    if (!hasPermission) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }

  private extractRoutePath(url: string): string {
    const segments = url.split('/').filter(segment => segment !== '');
    return segments.length > 0 ? segments[0] : '';
  }

  private checkPermission(resource: string, action: string): boolean {
    const permissions = this.authService.getPermissionsLogged();
    
    if (!permissions || permissions.length === 0) {
      return false;
    }

    return permissions.some(
      permission => 
        permission.resource === resource && 
        permission.action === action && 
        permission.isActive
    );
  }
}
