import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Company } from '@app/core/models/bussiness/company';
import { MockCompanyService } from '@app/core/services/mock/mock-company.service';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { Option } from '@app/core/models/interfaces/option.interface';
import { Response } from '@app/core/models/dtos/response';
import { Validation } from '@app/core/models/dtos/validation';

@Component({
  selector: 'app-companies-detail',
  templateUrl: './companies-detail.component.html',
  styleUrl: './companies-detail.component.scss'
})
export class CompaniesDetailComponent implements OnInit {
  titleComponent: string = "Detalle de empresa";
  loading: boolean = true;
  charge: boolean = false;
  hasChanged: boolean = false;
  pagination: Pagination = { offset: 0, limit: 100, items: 0, filters: ``, sort: 'id,desc' };
  send: boolean = false;
  response?: Response;
  form: FormGroup; 
  id: string = "";
  company: Company = new Company();
  now: Date = new Date();

  constructor(
    private companyService: MockCompanyService,
    private router: Router,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
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
      subscriptionPlan: new FormControl("", Validators.required),
      subscriptionStartDate: new FormControl("", Validators.required),
      subscriptionEndDate: new FormControl("", Validators.required),
      isActive: new FormControl(false)
    });

    this.route.params.subscribe(params => { 
      if (params['id']) this.id = params['id'] 
    });

    this.form.valueChanges.subscribe(() => {
      this.hasChanged = Object.values(this.form.controls).some(control => control.dirty);
    });
  }

  ngOnInit(): void {
    this.loading = true;
    this.load();
  }

  load(): void {
    if(this.id) {
      this.loading = true;
      this.companyService.get(parseInt(this.id)).subscribe({
        next: (data: any) => {      
          this.company = <Company>data;
          this.setForm();
        },
        error: (error: any) => {
          this.loading = false;
          this.snackBar.open('Error al cargar la empresa', 'Cerrar', {duration: 4000});
        }
      });
    }
  }

  async setForm() {
    if(this.company){
      let object: Object = {
        companyName: this.company.companyName,
        legalName: this.company.legalName,
        industry: this.company.industry,
        headquartersAddress: this.company.headquartersAddress,
        website: this.company.website,
        email: this.company.email,
        phone: this.company.phone,
        contactPersonName: this.company.contactPersonName,
        contactPersonEmail: this.company.contactPersonEmail,
        contactPersonPhone: this.company.contactPersonPhone,
        subscriptionPlan: this.company.subscriptionPlan,
        subscriptionStartDate: this.company.subscriptionStartDate,
        subscriptionEndDate: this.company.subscriptionEndDate,
        isActive: this.company.isActive
      };
      this.form.setValue(object);
      this.form.disable();
    }
    this.loading = false;
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

  update() {
    this.router.navigate([`/companies/${this.id}/update`]);
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

  getCompanyStatus(company: Company): string {
    return company.isActive ? 'Activo' : 'Inactivo';
  }

  getCompanyStatusClass(company: Company): string {
    return company.isActive ? 'status-active' : 'status-inactive';
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

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  }
}
