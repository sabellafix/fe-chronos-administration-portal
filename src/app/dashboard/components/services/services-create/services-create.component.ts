import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Service } from '@app/core/models/bussiness/service';
import { MockPlatformServiceService } from '@app/core/services/mock/mock-platform-service.service';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { Option } from '@app/core/models/interfaces/option.interface';
import { Response } from '@app/core/models/dtos/response';
import { Validation } from '@app/core/models/dtos/validation';

@Component({
  selector: 'app-services-create',
  templateUrl: './services-create.component.html',
  styleUrl: './services-create.component.scss'
})
export class ServicesCreateComponent {
  titleComponent: string = "Crear servicio";
  loading: boolean = false;
  charge: boolean = false;
  pagination: Pagination = { offset: 0, limit: 100, items: 0, filters: ``, sort: 'id,desc' };
  send: boolean = false;
  response? : Response;
  form: FormGroup; 
  now : Date = new Date();

  constructor(private serviceService: MockPlatformServiceService,
              private router: Router,
              private snackBar: MatSnackBar
  ){
    this.form = new FormGroup({
      serviceName : new FormControl("", Validators.required),
      serviceDescription : new FormControl(""),
      providerId : new FormControl("", Validators.required),
      categoryId : new FormControl(1, [Validators.required, Validators.min(1)]),
      durationMinutes : new FormControl(60, [Validators.required, Validators.min(1)]),
      price : new FormControl(0, [Validators.required, Validators.min(0)]),
      currency : new FormControl("USD", Validators.required),
      isActive : new FormControl(true),
    });
  }

  ngOnInit(): void {
    // Inicializar valores por defecto del formulario
    this.form.patchValue({
      currency: "USD",
      categoryId: 1,
      durationMinutes: 60,
      isActive: true
    });
  }

  post(){
    this.form.markAllAsTouched();
    if( this.form.valid){
      let post = {
        serviceName : this.form.get('serviceName')?.value,
        serviceDescription : this.form.get('serviceDescription')?.value,
        providerId : this.form.get('providerId')?.value,
        categoryId : this.form.get('categoryId')?.value,
        durationMinutes : this.form.get('durationMinutes')?.value,
        price : this.form.get('price')?.value,
        currency : this.form.get('currency')?.value,
        isActive : this.form.get('isActive')?.value,
      }
      this.charge = true;
      this.send = false;
      this.response = new Response();
      this.serviceService.post(post).subscribe({
        next: (data: any) => {
          let service = <Service>data;          
          this.charge = false;
          this.snackBar.open('Servicio creado correctamente.', 'Cerrar', {duration: 4000});
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
          this.snackBar.open('Error ejecutando la creación ' + message, 'Cerrar', {duration: 4000});
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

  getCurrencies(): Option[] {
    return [
      { name: 'Dólar Estadounidense', code: 'USD' },
      { name: 'Euro', code: 'EUR' },
      { name: 'Peso Colombiano', code: 'COP' }
    ];
  }

  getCategories(): Option[] {
    return [
      { name: 'Tecnología', code: '1' },
      { name: 'Salud', code: '2' },
      { name: 'Educación', code: '3' },
      { name: 'Construcción', code: '4' },
      { name: 'Otros', code: '5' }
    ];
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

  // Helper method para obtener proveedores (mock data)
  getProviders(): Option[] {
    return [
      { name: 'Empresa Tecnología 1', code: 'supplier-001' },
      { name: 'Empresa Salud 2', code: 'supplier-002' },
      { name: 'Empresa Educación 3', code: 'supplier-003' },
      { name: 'Empresa Construcción 4', code: 'supplier-004' },
      { name: 'Empresa Alimentación 5', code: 'supplier-005' }
    ];
  }
}
