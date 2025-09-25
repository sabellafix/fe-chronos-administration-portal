import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Service } from '@app/core/models/bussiness/service';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { Response } from '@app/core/models/dtos/response';
import { Validation } from '@app/core/models/dtos/validation';
import { StorageService } from '@app/core/services/shared/storage.service';
import { Category } from '@app/core/models/bussiness/category';
import { CategoryService } from '@app/core/services/http/category.service';
import { ServiceService as PlatformServiceService } from '@app/core/services/http/platform-service.service';
import { CreateServiceDto } from '@app/core/models/bussiness';
import { ServiceTypeConst } from '@app/core/models/constants/serviceType.const';
import { Option } from '@app/core/models/interfaces/option.interface';
import { environment } from '@env/environment';

@Component({
  selector: 'app-services-create',
  templateUrl: './services-create.component.html',
  styleUrl: './services-create.component.scss'
})
export class ServicesCreateComponent {
  titleComponent: string = "Create service";
  loading: boolean = false;
  charge: boolean = false;
  pagination: Pagination = { offset: 0, limit: 100, items: 0, filters: ``, sort: 'id,desc' };
  send: boolean = false;
  response? : Response;
  form: FormGroup; 
  now : Date = new Date();
  salonId = environment.salonId;
  categories: Category[] = [];
  types: Option[] = [
    { name: ServiceTypeConst._CONFIG, code: "Config" },
    { name: ServiceTypeConst._DEFAULT, code: "Default" },
  ];

  constructor(private serviceService: PlatformServiceService,
              private router: Router,
              private snackBar: MatSnackBar,
              private storageService: StorageService,
              private categoryService: CategoryService
  ){
    this.form = new FormGroup({
      serviceName : new FormControl("", Validators.required),
      serviceDescription : new FormControl(""),
      categoryId : new FormControl(1, [Validators.required, Validators.min(1)]),
      durationMinutes : new FormControl(60, [Validators.required, Validators.min(1)]),
      processingTime : new FormControl(0, [Validators.min(0)]),
      price : new FormControl(0, [Validators.required, Validators.min(0)]),
      color : new FormControl("#23324d", Validators.required),
      type : new FormControl(ServiceTypeConst._CONFIG, Validators.required),
    });
  }

  ngOnInit(): void {
    this.getCategories();
    this.form.patchValue({
      categoryId: 1,
      durationMinutes: 60,
      processingTime: 0,
      price: 0,
      isActive: true,
      type: ServiceTypeConst._CONFIG
    });
  }

  post(){
    this.form.markAllAsTouched();
    if( this.form.valid){
      let createDto: CreateServiceDto = new CreateServiceDto();
      createDto.serviceName = this.form.get('serviceName')?.value;
      createDto.serviceDescription = this.form.get('serviceDescription')?.value;
      createDto.providerId = null;
      createDto.categoryId = this.form.get('categoryId')?.value;
      createDto.durationMinutes = this.form.get('durationMinutes')?.value;
      createDto.processingTime = this.form.get('processingTime')?.value;
      createDto.price = this.form.get('price')?.value;
      createDto.color = this.form.get('color')?.value;
      createDto.type = this.form.get('type')?.value;
      createDto.currency = "USD";
      createDto.salonId = this.salonId;
      this.charge = true;
      this.send = false;
      this.response = new Response();
      this.serviceService.create(createDto).subscribe({
        next: (data: any) => {
          let service = <Service>data;          
          this.charge = false;
          this.snackBar.open('Service created successfully.', 'Close', {duration: 4000});
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
          this.snackBar.open('Error executing the creation ' + message, 'Close', {duration: 4000});
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

  return(){
    this.router.navigate([`/services`]);
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

  toggleStatus(): void {
    const control = this.form.get('isActive');
    if (control) {
      control.setValue(!control.value);
      this.form.markAsDirty();
    }
  }

  getCategories(): void {
    this.loading = true;
    this.categoryService.getCategories().subscribe({
      next: (response: Category[]) => {
        this.categories = response;
        this.loading = false;
      },error: (response) =>{
        this.snackBar.open('Error getting categories', 'Close', {duration: 4000});
        this.loading = false;
      }
    });
  }

  resetForm(): void {
    this.form.reset();
    this.form.patchValue({
      currency: "USD",
      categoryId: 1,
      durationMinutes: 60,
      processingTime: 0,
      isActive: true,
      type: ServiceTypeConst._CONFIG
    });
  }

  getDurationFormatted(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  }

}
