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
    this.tokenRefreshService.tokenUpdated$.subscribe(() => {
      this.refreshAllServices();
    });
  }


  initializeServices(): Promise<void> {
    return new Promise((resolve) => {
      this.refreshAllServices();
      resolve();
    });
  }

  
  private refreshAllServices(): void {
    this.bookingService.refreshToken();
    this.customerService.refreshToken();
    this.serviceService.refreshToken();
    this.userService.refreshToken();
  }

  static initializeFactory(dashboardInitializer: DashboardInitializerService) {
    return () => dashboardInitializer.initializeServices();
  }
}
