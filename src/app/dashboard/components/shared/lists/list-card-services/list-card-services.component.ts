import { Component, Input } from '@angular/core';
import { Service } from '@app/core/models/bussiness/service';
import { ServiceService } from '@app/core/services/http/platform-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '@env/environment';
import { CreateServiceDto } from '@app/core/models/bussiness/create-dtos';
import { FormControl } from '@angular/forms';
import { FormGroup, Validators } from '@angular/forms';
import { User } from '@app/core/models/bussiness/user';
import { ServiceTypeConst } from '@app/core/models/constants/serviceType.const';
import { UpdateServiceDto } from '@app/core/models/bussiness/update-dtos';

@Component({
  selector: 'app-list-card-services',
  templateUrl: './list-card-services.component.html',
  styleUrl: './list-card-services.component.scss'
})
export class ListCardServicesComponent {

  @Input() id?: string | null = null;
  @Input() services?: Service[] | null = null;
  @Input() user?: User | null = null;
  @Input() mode: string = 'update';

  loading: boolean = false;
  loadingSalon: boolean = false;
  salonServices: Service[] = [];
  salonId: string = environment.salonId;

  formCreate: FormGroup;
  formUpdate: FormGroup;

  showCreateForm: boolean = false;
  showUpdateForm: boolean = false;

  service: Service | null = null;
  salonService: Service = new Service();

  constructor(private serviceService: ServiceService,
    private snackBar: MatSnackBar
  ){

    this.formCreate = new FormGroup({
      serviceId : new FormControl("", Validators.required),
      durationMinutes : new FormControl(60, [Validators.required, Validators.min(1)]),
      processingTime : new FormControl(0, [Validators.min(0)]),
      price : new FormControl(0, [Validators.required, Validators.min(0)]),
    });

    this.formUpdate = new FormGroup({
      serviceName : new FormControl("", Validators.required),
      durationMinutes : new FormControl(60, [Validators.required, Validators.min(1)]),
      processingTime : new FormControl(0, [Validators.min(0)]),
      price : new FormControl(0, [Validators.required, Validators.min(0)]),
    });

  }

  ngOnInit(): void {
    if(this.id){
      this.loadByIdProvider();
    }

    if(this.mode === 'update'){
      this.loadSalonServices();
    }
  }

  loadByIdProvider(): void {
    this.loading = true;
    this.serviceService.getServicesByProvider(this.id!).subscribe({
      next: (data: Service[]) => {
        this.services = data;
        this.loading = false;
      },
      error: (error: any) => {
        this.loading = false;
        this.snackBar.open('Error loading services', 'Cerrar', {duration: 4000});
      }
    });
  }

  loadSalonServices(): void {
    this.loadingSalon = true;
    this.serviceService.getServicesBySalon(this.salonId).subscribe({
      next: (data: Service[]) => {
        this.salonServices = data;
        this.loadingSalon = false;
      },
      error: (error: any) => {
        this.loadingSalon = false;
        this.snackBar.open('Error loading salon services', 'Cerrar', {duration: 4000});
      }
    });
  }

  updateSalonServices(): void {
    this.salonServices = this.salonServices.filter(s => !this.services!.some(s2 => s2.serviceName === s.serviceName));
  }

  getServiceColor(serviceId: string): string {
    const service = this.services!.find(s => s.id === serviceId);
    return service ? service.color + ' !important' : '#e9ecef';
  }

  getSalonServiceColor(serviceId: string): string {
    const service = this.salonServices.find(s => s.id === serviceId);
    return service ? service.color + ' !important' : '#e9ecef';
  }

  getServiceName(serviceId: string): string {
    const service = this.services!.find(s => s.id === serviceId);
    return service?.serviceName || 'Unknown Service';
  }

  getServiceDuration(serviceId: string): number {
    const service = this.services!.find(s => s.id === serviceId);
    return service?.durationMinutes || 0;
  }

  getServicePrice(serviceId: string): number {
    const service = this.services!.find(s => s.id === serviceId);
    return service?.price || 0;
  }

  getServiceStatus(service: Service): string {
    return service.isActive ? 'Active' : 'Inactive';
  }

  getServiceStatusClass(service: Service): string {
    return service.isActive ? 'badge-success' : 'badge-secondary';
  }


  setCreateServiceForm(): void {
    this.showCreateForm = !this.showCreateForm;
    this.showUpdateForm = false;
    
    if (this.showCreateForm) {
      this.formCreate.reset({
        serviceName: "",
        serviceDescription: "",
        categoryId: "",
        durationMinutes: 60,
        processingTime: 0,
        price: 0,
        color: "#007bff"
      });
    }
  }

  setUpdateServiceForm(service: Service): void {
    this.showUpdateForm = !this.showUpdateForm;
    this.showCreateForm = false;
    
    if (this.showUpdateForm) {
      this.service = service;
      this.formUpdate.patchValue({
        serviceName: service.serviceName,
        durationMinutes: service.durationMinutes,
        processingTime: service.processingTime,
        price: service.price,
        color: service.color || "#007bff"
      });
    } else {
      this.service = null;
    }
  }

  createService(): void {
    this.formCreate.markAllAsTouched();
    
    if (this.formCreate.valid) {
      const formData = this.formCreate.value;
      const createDto = new CreateServiceDto();
      
      createDto.providerId = this.user!.id;
      createDto.salonId = null
      createDto.categoryId = this.salonService.categoryId;
      createDto.serviceName = this.salonService.serviceName || "";
      createDto.serviceDescription = this.salonService.serviceDescription || undefined;
      createDto.durationMinutes = formData.durationMinutes;
      createDto.processingTime = formData.processingTime;
      createDto.price = formData.price;
      createDto.color = this.salonService.color || undefined;
      createDto.type = ServiceTypeConst._SERVICE;
      createDto.currency = this.salonService.currency || undefined;

      this.serviceService.create(createDto).subscribe({
        next: (data: Service) => {
          this.services!.push(data);
          this.snackBar.open('Service created successfully', 'Cerrar', {duration: 4000});
          this.showCreateForm = false;
          this.formCreate.reset();
        },
        error: (error: any) => {
          let message = 'Error creating service';
          if (error.error?.message) {
            message = error.error.message;
          }
          this.snackBar.open(message, 'Cerrar', {duration: 4000});
        }
      });
    }
  }


  updateService(): void {
    this.formUpdate.markAllAsTouched();
    
    if (this.formUpdate.valid && this.service) {
      const formData = this.formUpdate.value;
      const updateDto = new UpdateServiceDto();
      
      updateDto.categoryId = this.service.categoryId;
      updateDto.serviceName = this.service.serviceName || undefined;
      updateDto.serviceDescription = this.service.serviceDescription || undefined;
      updateDto.durationMinutes =formData.durationMinutes;
      updateDto.processingTime = formData.processingTime;
      updateDto.price = formData.price;
      updateDto.color = this.service.color || undefined;
      updateDto.currency = this.service.currency || undefined;
      updateDto.isActive = this.service.isActive;

      this.serviceService.updateService(this.service.id, updateDto).subscribe({
        next: (data: Service) => {
          const index = this.services!.findIndex(s => s.id === this.service!.id);
          if (index !== -1) {
            this.services![index] = data;
          }
          
          this.snackBar.open('Service updated successfully', 'Cerrar', {duration: 4000});
          this.showUpdateForm = false;
          this.formUpdate.reset();
          this.service = null;
        },
        error: (error: any) => {
          let message = 'Error updating service';
          if (error.error?.message) {
            message = error.error.message;
          }
          this.snackBar.open(message, 'Cerrar', {duration: 4000});
        }
      });
    }
  }

  deleteService(serviceId: string): void {
    if (confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      this.serviceService.deleteService(serviceId).subscribe({
        next: () => {
          this.services = this.services!.filter(s => s.id !== serviceId);
          this.snackBar.open('Service deleted successfully', 'Cerrar', {duration: 4000});
        },
        error: (error: any) => {
          let message = 'Error deleting service';
          if (error.error?.message) {
            message = error.error.message;
          }
          this.snackBar.open(message, 'Cerrar', {duration: 4000});
        }
      });
    }
  }

  cancelServiceForm(): void {
    this.showCreateForm = false;
    this.showUpdateForm = false;
    this.formCreate.reset();
    this.formUpdate.reset();
    this.service = null;
  }

  onServiceChange(event: Event): void {
    const selectedServiceId = (event.target as HTMLSelectElement).value;
    this.salonService = this.salonServices.find(s => s.id === selectedServiceId) || new Service();
    if (this.salonService) {
      this.formCreate.patchValue({ serviceId: this.salonService.id,
        durationMinutes: this.salonService.durationMinutes,
        processingTime: this.salonService.processingTime,
        price: this.salonService.price
      });
    }
  }

}
