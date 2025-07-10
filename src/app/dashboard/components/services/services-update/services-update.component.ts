import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Service } from '@app/core/models/bussiness/service';
import { ServiceService as PlatformServiceService } from '@app/core/services/http/platform-service.service';
import { CreateServiceDto, UpdateServiceDto } from '@app/core/models/bussiness';
import { CategoryService } from '@app/core/services/http/category.service';
import { StorageService } from '@app/core/services/shared/storage.service';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { Response } from '@app/core/models/dtos/response';
import { Validation } from '@app/core/models/dtos/validation';
import { Category } from '@app/core/models/bussiness/category';
import { User } from '@app/core/models/bussiness/user';
import { StorageKeyConst } from '@app/core/models/constants/storageKey.const';

@Component({
  selector: 'app-services-update',
  templateUrl: './services-update.component.html',
  styleUrl: './services-update.component.scss'
})
export class ServicesUpdateComponent {
  titleComponent: string = "Update service";
  loading: boolean = true;
  charge: boolean = false;
  hasChanged : boolean = false;
  pagination: Pagination = { offset: 0, limit: 100, items: 0, filters: ``, sort: 'id,desc' };
  send: boolean = false;
  response? : Response;
  form: FormGroup; 
  id: string = "";
  service: Service = new Service();
  now : Date = new Date();
  providerId: string = "";
  categories: Category[] = [];

  constructor(private serviceService: PlatformServiceService,
              private router: Router,
              private snackBar: MatSnackBar,
              private route: ActivatedRoute,
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
      isActive : new FormControl(true),
    });

    this.route.params.subscribe(params => { if (params['id']) this.id = params['id'] });

    this.form.valueChanges.subscribe(() => {
      this.hasChanged = Object.values(this.form.controls).some(control => control.dirty);
    });
  }

  ngOnInit(): void {
 
    this.loading = true;
    this.load();
  }

  setIdProvider(): void {
    const user = <User>this.storageService.get(StorageKeyConst._USER);
    if(user){
      this.providerId = user.b2CId;
    }else{
      this.snackBar.open('Error getting user', 'Close', {duration: 4000});
    }
  }

  load(): void{
    if(this.id) {
      this.loading = true;
      this.serviceService.getService(this.id).subscribe({
        next: (data: any) => {      
          this.service = <Service>data;
          this.setIdProvider();
          this.getCategories();
          
        },error: (error: any) => {
          this.loading = false;
          this.snackBar.open('Error loading the service', 'Close', {duration: 4000});
        }
      });
    }
  }

  async setForm(){
    if(this.service){
      let object : Object = {
        serviceName : this.service.serviceName,
        serviceDescription : this.service.serviceDescription,
        categoryId : this.service.categoryId,
        durationMinutes : this.service.durationMinutes,
        processingTime : this.service.processingTime,
        price : this.service.price,
        color : this.service.color,
        isActive : this.service.isActive,
      };
      this.form.setValue(object);
    }
    this.loading = false;
  }

  put(){
    this.form.markAllAsTouched();
    if( this.form.valid){
      let updateDto: UpdateServiceDto = new UpdateServiceDto();
      updateDto.serviceName = this.form.get('serviceName')?.value;
      updateDto.serviceDescription = this.form.get('serviceDescription')?.value;
      updateDto.categoryId = this.form.get('categoryId')?.value;
      updateDto.durationMinutes = this.form.get('durationMinutes')?.value;
      updateDto.processingTime = this.form.get('processingTime')?.value;
      updateDto.price = this.form.get('price')?.value;
      updateDto.color = this.form.get('color')?.value;
      updateDto.currency = "USD";
      updateDto.isActive = this.form.get('isActive')?.value;
      
      this.charge = true;
      this.send = false;
      this.response = new Response();
      console.log("updateDto", updateDto);
      this.serviceService.updateService(this.id, updateDto).subscribe({
        next: (data: any) => {
          this.charge = false;
          let service = <Service>data;
          this.snackBar.open('Service updated successfully.', 'Close', {duration: 4000});
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
          this.snackBar.open('Error executing the update ' + message, 'Close', {duration: 4000});
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
        this.setForm();
      },error: (response) =>{
        this.snackBar.open('Error getting categories', 'Close', {duration: 4000});
        this.loading = false;
      }
    });
  }

  resetForm(): void {
    this.form.reset();
    this.form.patchValue({
      categoryId: 1,
      durationMinutes: 60,
      processingTime: 0,
      price: 0,
      color: "#000000",
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
