import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Service } from '@app/core/models/bussiness/service';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { Response } from '@app/core/models/dtos/response';
import { Validation } from '@app/core/models/dtos/validation';
import { StorageService } from '@app/core/services/shared/storage.service';
import { StorageKeyConst } from '@app/core/models/constants/storageKey.const';
import { Category } from '@app/core/models/bussiness/category';
import { User } from '@app/core/models/bussiness/user';
import { CategoryService } from '@app/core/services/http/category.service';
import { PlatformServiceService } from '@app/core/services/http/platform-service.service';

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
  providerId: string = "";
  categories: Category[] = [];

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
      price : new FormControl(0, [Validators.required, Validators.min(0)]),
      color : new FormControl("#23324d", Validators.required),
    });
  }

  ngOnInit(): void {
    this.setIdProvider();
    this.getCategories();
    this.form.patchValue({
      categoryId: 1,
      durationMinutes: 60,
      price: 0,
      isActive: true
    });
  }

  setIdProvider(): void {
    const user = <User>this.storageService.get(StorageKeyConst._USER);
    if(user){
      this.providerId = user.b2CId;
    }else{
      this.snackBar.open('Error getting user', 'Close', {duration: 4000});
    }
  }

  post(){
    this.form.markAllAsTouched();
    if( this.form.valid){
      let post = {
        serviceName : this.form.get('serviceName')?.value,
        serviceDescription : this.form.get('serviceDescription')?.value,
        providerId : this.providerId,
        categoryId : this.form.get('categoryId')?.value,
        durationMinutes : this.form.get('durationMinutes')?.value,
        price : this.form.get('price')?.value,
        color : this.form.get('color')?.value,
        currency : "USD",
        isActive : true,
      }
      this.charge = true;
      this.send = false;
      this.response = new Response();
      this.serviceService.post(post).subscribe({
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
      isActive: true
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
