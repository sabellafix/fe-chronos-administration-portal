import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Company } from '@app/core/models/bussiness/company';
import { MockCompanyService } from '@app/core/services/mock/mock-company.service';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { Option } from '@app/core/models/interfaces/option.interface';
import { Response } from '@app/core/models/dtos/response';
import { Validation } from '@app/core/models/dtos/validation';

@Component({
  selector: 'app-companies-create',
  templateUrl: './companies-create.component.html',
  styleUrl: './companies-create.component.scss'
})
export class CompaniesCreateComponent implements OnInit {
  titleComponent: string = "Crear empresa";
  loading: boolean = true;
  charge: boolean = false;
  pagination: Pagination = { offset: 0, limit: 100, items: 0, filters: ``, sort: 'id,desc' };
  send: boolean = false;
  response?: Response;
  form: FormGroup; 
  now: Date = new Date();

  constructor(
    private companyService: MockCompanyService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = new FormGroup({
      companyName: new FormControl("", Validators.required),
      legalName: new FormControl("", Validators.required),
      industry: new FormControl("", Validators.required),
      headquartersAddress: new FormControl("", Validators.required),
      website: new FormControl("", [Validators.pattern(/^(https?:\/\/)?([\w\.-]+)\.([a-z]{2,})(\/.*)?$/i)]),
      email: new FormControl("", [Validators.required, Validators.email]),
      phone: new FormControl("", Validators.required),
      contactPersonName: new FormControl("", Validators.required),
      contactPersonEmail: new FormControl("", [Validators.required, Validators.email]),
      contactPersonPhone: new FormControl("", Validators.required),
      subscriptionPlan: new FormControl("Basic", Validators.required),
      subscriptionStartDate: new FormControl("", Validators.required),
      subscriptionEndDate: new FormControl("", Validators.required),
      isActive: new FormControl(true)
    });
  }

  ngOnInit(): void {
    this.loading = false;
    
    // Inicializar valores por defecto del formulario
    this.form.patchValue({
      isActive: true,
      subscriptionPlan: 'Basic'
    });
  }

  post() {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      let post = {
        companyName: this.form.get('companyName')?.value,
        legalName: this.form.get('legalName')?.value,
        industry: this.form.get('industry')?.value,
        headquartersAddress: this.form.get('headquartersAddress')?.value,
        website: this.form.get('website')?.value,
        email: this.form.get('email')?.value,
        phone: this.form.get('phone')?.value,
        contactPersonName: this.form.get('contactPersonName')?.value,
        contactPersonEmail: this.form.get('contactPersonEmail')?.value,
        contactPersonPhone: this.form.get('contactPersonPhone')?.value,
        subscriptionPlan: this.form.get('subscriptionPlan')?.value,
        subscriptionStartDate: this.form.get('subscriptionStartDate')?.value,
        subscriptionEndDate: this.form.get('subscriptionEndDate')?.value,
        isActive: this.form.get('isActive')?.value
      };
      
      this.charge = true;
      this.send = false;
      this.response = new Response();
      
      this.companyService.post(post).subscribe({
        next: (data: any) => {
          let company = <Company>data;          
          this.charge = false;
          this.snackBar.open('Empresa creada correctamente.', 'Cerrar', {duration: 4000});
          this.return();
        },
        error: (error: any) => {
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

  getValidation(controlName: string): Validation | undefined {
    if(this.response?.validation){
      const validation = this.response?.validation.find((val : any) => controlName == val.attribute.split('.').pop()!.toString());
      if(validation){
        return validation;
      }
    }
    return undefined;
  }

  return() {
    this.router.navigate([`/companies`]);
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

  asignAutoComplete(option: Option, controlName: string) {
    this.form.get(controlName)?.setValue(option.code!);
  }

  toggleStatus(): void {
    const control = this.form.get('isActive');
    if (control) {
      control.setValue(!control.value);
      this.form.markAsDirty();
    }
  }

  getSubscriptionPlans(): Option[] {
    return [
      { name: 'Básico', code: 'Basic' },
      { name: 'Profesional', code: 'Professional' },
      { name: 'Empresarial', code: 'Enterprise' },
      { name: 'Premium', code: 'Premium' }
    ];
  }

  getIndustries(): Option[] {
    return [
      { name: 'Tecnología', code: 'Technology' },
      { name: 'Salud', code: 'Healthcare' },
      { name: 'Educación', code: 'Education' },
      { name: 'Construcción', code: 'Construction' },
      { name: 'Alimentación', code: 'Food' },
      { name: 'Belleza', code: 'Beauty' },
      { name: 'Manufactura', code: 'Manufacturing' },
      { name: 'Servicios', code: 'Services' }
    ];
  }

}
