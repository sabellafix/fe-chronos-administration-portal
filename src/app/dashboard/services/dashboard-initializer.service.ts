import { Injectable } from '@angular/core';
import { BookingService } from '@app/core/services/http/booking.service';
import { CustomerService } from '@app/core/services/http/customer.service';
import { ServiceService } from '@app/core/services/http/platform-service.service';
import { UserService } from '@app/core/services/http/user.service';
import { TokenRefreshService } from '@app/core/services/shared/token-refresh.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardInitializerService {

  constructor(
    private bookingService: BookingService,
    private customerService: CustomerService,
    private serviceService: ServiceService,
    private userService: UserService,
    private tokenRefreshService: TokenRefreshService
  ) {
    // Suscribirse a las actualizaciones de token
    this.tokenRefreshService.tokenUpdated$.subscribe(() => {
      this.refreshAllServices();
    });
  }

  /**
   * Inicializa todos los servicios refrescando sus tokens
   * Este método debe ser llamado cuando se carga el dashboard module
   */
  initializeServices(): Promise<void> {
    return new Promise((resolve) => {
      this.refreshAllServices();
      console.log('🚀 Dashboard inicializado con servicios actualizados');
      resolve();
    });
  }

  /**
   * Refresca tokens en todos los servicios
   */
  private refreshAllServices(): void {
    this.bookingService.refreshToken();
    this.customerService.refreshToken();
    this.serviceService.refreshToken();
    this.userService.refreshToken();
    console.log('🔄 Tokens actualizados en todos los servicios');
  }

  /**
   * Método estático para ser usado con APP_INITIALIZER
   */
  static initializeFactory(dashboardInitializer: DashboardInitializerService) {
    return () => dashboardInitializer.initializeServices();
  }
}
