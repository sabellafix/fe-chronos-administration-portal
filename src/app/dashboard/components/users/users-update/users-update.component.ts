import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { UserService } from '@app/core/services/http/user.service';
import { ParametricService } from '@app/core/services/shared/parametric.service';
import { User } from '@app/core/models/bussiness/user';
import { Service } from '@app/core/models/bussiness/service';
import { ServiceService } from '@app/core/services/http/platform-service.service';
import { CreateServiceDto } from '@app/core/models/bussiness/create-dtos';
import { UpdateServiceDto } from '@app/core/models/bussiness/update-dtos';
import { Category } from '@app/core/models/bussiness/category';
import { CategoryService } from '@app/core/services/http/category.service';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { Response } from '@app/core/models/dtos/response';
import { Validation } from '@app/core/models/dtos/validation';
import { Option } from '@app/core/models/interfaces/option.interface';
import { environment } from '@env/environment';
import { ServiceTypeConst } from '@app/core/models/constants/serviceType.const';

@Component({
  selector: 'app-users-update',
  templateUrl: './users-update.component.html',
  styleUrl: './users-update.component.scss'
})
export class UsersUpdateComponent {

  titleComponent: string = "Update Stylist";
  loading: boolean = true;
  charge: boolean = false;
  hasChanged : boolean = false;
  pagination: Pagination = { offset: 0, limit: 100, items: 0, filters: ``, sort: 'id,desc' };
  send: boolean = false;
  response? : Response;
  form: FormGroup; 
  id: string = "";
  user: User = new User();
  validPhoto : boolean = true;
  photoUrl : string = "";
  srcImage : string = "assets/images/user-image.jpg";
  photoBase64 : string = "";
  now : Date = new Date();
  codephones : Option[] = [];
  country? : Option;
  roles: any[] = [];
  showPasswordFields: boolean = false;
  services: Service[] = [];
  loadingServices: boolean = false;

  formCreateService: FormGroup;
  formUpdateService: FormGroup;

  showCreateServiceForm: boolean = false;
  showUpdateServiceForm: boolean = false;
  service: Service = new Service();
  salonServices: Service[] = [];
  salonId: string = environment.salonId;
  selectedService: Service | null = null;
  selectedSalonService: Service = new Service();
  categories: Category[] = [];
  loadingCategories: boolean = false;

  constructor(private userService: UserService,
              private parametricService: ParametricService,
              private router: Router,
              private snackBar: MatSnackBar,
              private route: ActivatedRoute,
              private serviceService: ServiceService,
              private categoryService: CategoryService,
  ){
    this.form = new FormGroup({
      firstName : new FormControl("", Validators.required),
      lastName : new FormControl("", Validators.required),
      email : new FormControl("", [Validators.required, Validators.email]),
      phone : new FormControl("", [Validators.required, Validators.pattern(/^\d{9}$/)]),
      userRole : new FormControl("", Validators.required),
      newPassword : new FormControl(""),
      confirmPassword : new FormControl(""),
    });

    this.formCreateService = new FormGroup({
      serviceId : new FormControl("", Validators.required),
      durationMinutes : new FormControl(60, [Validators.required, Validators.min(1)]),
      processingTime : new FormControl(0, [Validators.min(0)]),
      price : new FormControl(0, [Validators.required, Validators.min(0)]),
    });

    this.formUpdateService = new FormGroup({
      serviceName : new FormControl("", Validators.required),
      durationMinutes : new FormControl(60, [Validators.required, Validators.min(1)]),
      processingTime : new FormControl(0, [Validators.min(0)]),
      price : new FormControl(0, [Validators.required, Validators.min(0)]),
    });

    this.route.params.subscribe(params => { if (params['id']) this.id = params['id'] });

    this.form.valueChanges.subscribe(() => {
      this.hasChanged = Object.values(this.form.controls).some(control => control.dirty);
    });
  }

  ngOnInit(): void {
    this.loading = true;
    this.country = { id : "52", name : "Colombia", code: "+57"}
    this.load();
    this.loadCategories();
    
    this.roles = [
      { id: 1, name: 'Stylist', code: 'stylist' },
      { id: 2, name: 'Admin', code: 'admin' }
    ];
  }

  load(): void{
    if(this.id) {
      this.loading = true;
      this.userService.get(this.id).subscribe({
        next: (data: any) => {      
          this.user = <User>data;
          this.setForm();
          this.loadUserServices();
        },error: (error: any) => {
          this.loading = false;
          this.snackBar.open('Error loading the user', 'Cerrar', {duration: 4000});
        }
      });
    }
  }

  async setForm(){
    if(this.user){
      let object : Object = {
        firstName : this.user.firstName,
        lastName : this.user.lastName,
        email : this.user.email,
        phone : this.user.phone,
        userRole : this.user.userRole,
        newPassword : "",
        confirmPassword : "",
      };
      this.form.setValue(object);
      
      if (this.user.photo && this.user.photo !== "assets/images/user-image.jpg") {
        this.srcImage =  this.user.photo;
      }
    }
    this.loading = false;
  }

  put(){
    this.form.markAllAsTouched();
    
    if (!this.validPhoto) {
      this.snackBar.open('Select a valid image.', 'Cerrar', {duration: 4000});
      return;
    }
    
    if (this.showPasswordFields) {
      const newPassword = this.form.get('newPassword')?.value;
      const confirmPassword = this.form.get('confirmPassword')?.value;
      
      if (newPassword && newPassword.length < 8) {
        this.snackBar.open('The new password must have at least 8 characters', 'Cerrar', {duration: 4000});
        return;
      }
      
      if (newPassword !== confirmPassword) {
        this.snackBar.open('The passwords do not match', 'Cerrar', {duration: 4000});
        return;
      }
    }
    
    if( this.form.valid){
      let put = {
        firstName : this.form.get('firstName')?.value,
        lastName : this.form.get('lastName')?.value,
        email : this.form.get('email')?.value,
        phone : this.form.get('phone')?.value,
        userRole : this.form.get('userRole')?.value,
        photo : this.photoBase64 || this.user.photo,
      }
      
      if (this.showPasswordFields && this.form.get('newPassword')?.value) {
        (put as any).password = this.form.get('newPassword')?.value;
      }
      
      this.charge = true;
      this.send = false;
      this.response = new Response();
      this.userService.put(put, this.id).subscribe({
        next: (data: any) => {
          this.charge = false;
          let user = <User>data;
          this.snackBar.open('User updated correctly.', 'Cerrar', {duration: 4000});
          this.hasChanged = false;
          this.return();
        },
        error: (error: any) =>{
          let message = '';
          if(error.status == 422){
            this.send = true;
            this.response = error.error;
          }
          if(error.error.message && error.status != 422){
            message = error.error.message;
          }
          this.charge = false;
          this.snackBar.open('Error executing the update ' + message, 'Cerrar', {duration: 4000});
        }
      });
    }
  }

  getValidation(controlName: string): Validation | undefined{
    if(this.response?.validation){
      const validation = this.response?.validation.find(val => controlName == val.attribute.split('.').pop()!.toString());
      if(validation){
        return validation;
      }
    }
    return undefined;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      if (!file.type.startsWith('image/')) {
        this.validPhoto = false;
        this.snackBar.open('Select a valid image file.', 'Cerrar', {duration: 4000});
        return;
      }
      
      const maxSizeInBytes = 5 * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        this.validPhoto = false;
        this.snackBar.open('The image must be less than 5MB.', 'Cerrar', {duration: 4000});
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.validPhoto = false;
        this.snackBar.open('Invalid image format. Use: JPEG, PNG, GIF or WebP.', 'Cerrar', {duration: 4000});
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          this.srcImage = result;
          
          // Mantener los metadatos completos del archivo (data:image/tipo;base64,...)
          this.photoBase64 = result;
          
          this.validPhoto = true;
          this.form.markAsDirty();
          this.snackBar.open('Image loaded correctly.', 'Cerrar', {duration: 2000});
        }
      };
      
      reader.onerror = () => {
        this.validPhoto = false;
        this.snackBar.open('Error loading the image.', 'Cerrar', {duration: 4000});
      };
      
      reader.readAsDataURL(file);
    }
  }

  return(){
    this.router.navigate([`/users`]);
  }

  capitalize(formControlName: string): void {
    const control = this.form.get(formControlName);
    if (control) {
      const value = control.value;
      if (value) {
        control.setValue(
          value.charAt(0).toUpperCase() + value.slice(1),
          { emitEvent: false }
        );
      }
    }
  }

  asignAutoComplete(option: Option, controlName: string){
    this.form.get(controlName)?.setValue(option.code!);
  }

  toggleStatus(field: string): void {
    const control = this.form.get(field);
    if (control) {
      control.setValue(!control.value);
      this.form.markAsDirty();
    }
  }

  getUserTypes(): Option[] {
    return [
      { name: 'Comprador', code: 'Buyer' },
      { name: 'Proveedor', code: 'Supplier' },
      { name: 'Administrador', code: 'Admin' }
    ];
  }

  togglePasswordFields(): void {
    this.showPasswordFields = !this.showPasswordFields;
    
    if (this.showPasswordFields) {
      this.form.get('newPassword')?.setValidators([Validators.required, Validators.minLength(8)]);
      this.form.get('confirmPassword')?.setValidators([Validators.required]);
    } else {
      this.form.get('newPassword')?.clearValidators();
      this.form.get('confirmPassword')?.clearValidators();
      this.form.get('newPassword')?.setValue('');
      this.form.get('confirmPassword')?.setValue('');
    }
    
    this.form.get('newPassword')?.updateValueAndValidity();
    this.form.get('confirmPassword')?.updateValueAndValidity();
  }

  resetForm(): void {
    this.setForm();
    this.showPasswordFields = false;
    this.togglePasswordFields();
    this.srcImage = "assets/images/user-image.jpg";
    this.photoBase64 = "";
    this.validPhoto = true;
  }

  loadUserServices(): void {
    if (this.user.id) {
      this.loadingServices = true;
      this.serviceService.getServicesByProvider(this.user.id).subscribe({
        next: (data: Service[]) => {
          this.services = data;
          this.loadSalonServices();
        },
        error: (error: any) => {
          this.loadSalonServices();
          this.snackBar.open('Error loading services', 'Cerrar', {duration: 4000});
        }
      });
    }
  }

  loadSalonServices(): void {
    if (this.salonId) {
      this.loadingServices = true;
      this.serviceService.getServicesBySalon(this.salonId).subscribe({
        next: (data: Service[]) => {
          this.salonServices = data;
          this.updateSalonServices();
          this.loadingServices = false;
        },
        error: (error: any) => {
          this.loadingServices = false;
          this.snackBar.open('Error loading services', 'Cerrar', {duration: 4000});
        }
      });
    }
  }

  updateSalonServices(): void {
    this.salonServices = this.salonServices.filter(s => !this.services.some(s2 => s2.serviceName === s.serviceName));
  }

  getServiceColor(serviceId: string): string {
    const service = this.services.find(s => s.id === serviceId);
    return service ? service.color + ' !important' : '#e9ecef';
  }

  getSalonServiceColor(serviceId: string): string {
    const service = this.salonServices.find(s => s.id === serviceId);
    return service ? service.color + ' !important' : '#e9ecef';
  }

  getServiceName(serviceId: string): string {
    const service = this.services.find(s => s.id === serviceId);
    return service?.serviceName || 'Unknown Service';
  }

  getServiceDuration(serviceId: string): number {
    const service = this.services.find(s => s.id === serviceId);
    return service?.durationMinutes || 0;
  }

  getServicePrice(serviceId: string): number {
    const service = this.services.find(s => s.id === serviceId);
    return service?.price || 0;
  }

  getServiceStatus(service: Service): string {
    return service.isActive ? 'Active' : 'Inactive';
  }

  getServiceStatusClass(service: Service): string {
    return service.isActive ? 'badge-success' : 'badge-secondary';
  }

  loadCategories(): void {
    this.loadingCategories = true;
    this.categoryService.getCategories().subscribe({
      next: (data: Category[]) => {
        this.categories = data;
        this.loadingCategories = false;
      },
      error: (error: any) => {
        this.loadingCategories = false;
        this.snackBar.open('Error loading categories', 'Cerrar', {duration: 4000});
      }
    });
  }

  setCreateServiceForm(): void {
    this.showCreateServiceForm = !this.showCreateServiceForm;
    this.showUpdateServiceForm = false;
    
    if (this.showCreateServiceForm) {
      this.formCreateService.reset({
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
    this.showUpdateServiceForm = !this.showUpdateServiceForm;
    this.showCreateServiceForm = false;
    
    if (this.showUpdateServiceForm) {
      this.selectedService = service;
      this.formUpdateService.patchValue({
        serviceName: service.serviceName,
        durationMinutes: service.durationMinutes,
        processingTime: service.processingTime,
        price: service.price,
        color: service.color || "#007bff"
      });
    } else {
      this.selectedService = null;
    }
  }

  createService(): void {
    this.formCreateService.markAllAsTouched();
    
    if (this.formCreateService.valid) {
      const formData = this.formCreateService.value;
      const createDto = new CreateServiceDto();
      
      createDto.providerId = this.user.id;
      createDto.salonId = null
      createDto.categoryId = this.selectedSalonService.categoryId;
      createDto.serviceName = this.selectedSalonService.serviceName || "";
      createDto.serviceDescription = this.selectedSalonService.serviceDescription || undefined;
      createDto.durationMinutes = formData.durationMinutes;
      createDto.processingTime = formData.processingTime;
      createDto.price = formData.price;
      createDto.color = this.selectedSalonService.color || undefined;
      createDto.type = ServiceTypeConst._SERVICE;
      createDto.currency = this.selectedSalonService.currency || undefined;

      this.serviceService.create(createDto).subscribe({
        next: (data: Service) => {
          this.services.push(data);
          this.snackBar.open('Service created successfully', 'Cerrar', {duration: 4000});
          this.showCreateServiceForm = false;
          this.formCreateService.reset();
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
    this.formUpdateService.markAllAsTouched();
    
    if (this.formUpdateService.valid && this.selectedService) {
      const formData = this.formUpdateService.value;
      const updateDto = new UpdateServiceDto();
      
      updateDto.categoryId = this.selectedService.categoryId;
      updateDto.serviceName = this.selectedService.serviceName || undefined;
      updateDto.serviceDescription = this.selectedService.serviceDescription || undefined;
      updateDto.durationMinutes =formData.durationMinutes;
      updateDto.processingTime = formData.processingTime;
      updateDto.price = formData.price;
      updateDto.color = this.selectedService.color || undefined;
      updateDto.currency = this.selectedService.currency || undefined;
      updateDto.isActive = this.selectedService.isActive;

      this.serviceService.updateService(this.selectedService.id, updateDto).subscribe({
        next: (data: Service) => {
          // Actualizar el servicio en la lista local
          const index = this.services.findIndex(s => s.id === this.selectedService!.id);
          if (index !== -1) {
            this.services[index] = data;
          }
          
          this.snackBar.open('Service updated successfully', 'Cerrar', {duration: 4000});
          this.showUpdateServiceForm = false;
          this.formUpdateService.reset();
          this.selectedService = null;
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
          this.services = this.services.filter(s => s.id !== serviceId);
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
    this.showCreateServiceForm = false;
    this.showUpdateServiceForm = false;
    this.formCreateService.reset();
    this.formUpdateService.reset();
    this.selectedService = null;
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name || 'Unknown Category' : 'Unknown Category';
  }

  onServiceChange(event: Event): void {
    const selectedServiceId = (event.target as HTMLSelectElement).value;
    this.selectedSalonService = this.salonServices.find(s => s.id === selectedServiceId) || new Service();
    if (this.selectedSalonService) {
      this.formCreateService.patchValue({ serviceId: this.selectedSalonService.id,
        durationMinutes: this.selectedSalonService.durationMinutes,
        processingTime: this.selectedSalonService.processingTime,
        price: this.selectedSalonService.price
      });
    }
  }

}
