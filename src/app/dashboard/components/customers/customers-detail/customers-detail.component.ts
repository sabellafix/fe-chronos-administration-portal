import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Customer } from '../../../../core/models/bussiness/customer';
import { Service } from '../../../../core/models/bussiness/service';
import { CustomerService } from '../../../../core/services/http/customer.service';
import { ServiceService } from '../../../../core/services/http/platform-service.service';

@Component({
  selector: 'app-customers-detail',
  templateUrl: './customers-detail.component.html',
  styleUrl: './customers-detail.component.scss'
})
export class CustomersDetailComponent implements OnInit {
  titleComponent: string = "Customer Details";
  loading: boolean = false;
  customerId: string = '';
  customer?: Customer;
  services: Service[] = [];
  loadingServices: boolean = false;

  languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'pt', label: 'Portuguese' }
  ];

  constructor(
    private customerService: CustomerService,
    private serviceService: ServiceService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.customerId = this.route.snapshot.paramMap.get('id')!;
    this.loadCustomer();
    this.loadServices();
  }

  loadCustomer(): void {
    this.loading = true;
    this.customerService.getCustomer(this.customerId).subscribe({
      next: (customer: Customer) => {
        this.customer = customer;
        this.loading = false;
      },
      error: (error: any) => {
        this.snackBar.open('Error loading customer data', 'Close', {duration: 4000});
        this.loading = false;
      }
    });
  }

  loadServices(): void {
    this.loadingServices = true;
    this.serviceService.getAllServices().subscribe({
      next: (services: Service[]) => {
        this.services = services.filter(service => service.isActive);
        this.loadingServices = false;
      },
      error: (error: any) => {
        this.snackBar.open('Error loading services', 'Close', {duration: 4000});
        this.loadingServices = false;
      }
    });
  }

  return(): void {
    this.router.navigate([`/customers`]);
  }

  edit(): void {
    this.router.navigate([`/customers/update/${this.customerId}`]);
  }

  getLanguageLabel(value: string): string {
    const option = this.languageOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  }

  getServiceName(serviceId: string): string {
    const service = this.services.find(s => s.id === serviceId);
    return service ? service.serviceName || 'Unknown Service' : 'Unknown Service';
  }

  getServiceDuration(serviceId: string): number {
    const service = this.services.find(s => s.id === serviceId);
    return service ? service.durationMinutes : 0;
  }

  getServicePrice(serviceId: string): number {
    const service = this.services.find(s => s.id === serviceId);
    return service ? service.price : 0;
  }

  getServiceColor(serviceId: string): string {
    const service = this.services.find(s => s.id === serviceId);
    return service ? service.color + ' !important' : '#e9ecef';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
