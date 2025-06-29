import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Service } from '@app/core/models/bussiness/service';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { Option } from '@app/core/models/interfaces/option.interface';
import { Response } from '@app/core/models/dtos/response';
import { Validation } from '@app/core/models/dtos/validation';
import { ServiceService as PlatformServiceService } from '@app/core/services/http/platform-service.service';
import { CategoryService } from '@app/core/services/http/category.service';
import { Category } from '@app/core/models/bussiness/category';

@Component({
  selector: 'app-services-detail',
  templateUrl: './services-detail.component.html',
  styleUrl: './services-detail.component.scss'
})
export class ServicesDetailComponent {
  titleComponent: string = "Detail service";
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
  categories: Category[] = [];

  constructor(private serviceService: PlatformServiceService,
              private router: Router,
              private snackBar: MatSnackBar,
              private route: ActivatedRoute,
              private categoryService: CategoryService
  ){
    this.form = new FormGroup({
      serviceName : new FormControl("", Validators.required),
      serviceDescription : new FormControl(""),
      providerId : new FormControl("", Validators.required),
      categoryId : new FormControl(0, [Validators.required, Validators.min(1)]),
      durationMinutes : new FormControl(0, [Validators.required, Validators.min(1)]),
      price : new FormControl(0, [Validators.required, Validators.min(0)]),
      currency : new FormControl("USD", Validators.required),
      isActive : new FormControl(false),
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

  load(): void{
    if(this.id) {
      this.loading = true;
      this.serviceService.getService(this.id).subscribe({
        next: (data: any) => {      
          this.service = <Service>data;
          this.getCategories();
          
        },error: (error: any) => {
          this.loading = false;
          this.snackBar.open('Error al cargar el servicio', 'Cerrar', {duration: 4000});
        }
      });
    }
  }

  async setForm(){
    if(this.service){
      let object : Object = {
        serviceName : this.service.serviceName,
        serviceDescription : this.service.serviceDescription,
        providerId : this.service.providerId,
        categoryId : this.service.categoryId,
        durationMinutes : this.service.durationMinutes,
        price : this.service.price,
        currency : this.service.currency,
        isActive : this.service.isActive,
      };
      this.form.setValue(object);
      this.form.disable();
    }
    this.loading = false;
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

  update(){
    this.router.navigate([`/services/${this.id}/update`]);
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

  getServiceStatus(service: Service): string {
    return service.isActive ? 'Activo' : 'Inactivo';
  }

  getServiceStatusClass(service: Service): string {
    return service.isActive ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger';
  }

  getCurrencies(): Option[] {
    return [
      { name: 'Dólar Estadounidense', code: 'USD' },
      { name: 'Euro', code: 'EUR' },
      { name: 'Peso Colombiano', code: 'COP' }
    ];
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

  getDurationFormatted(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  }


  getCategoryName(categoryId: number): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category?.name || 'Category not found';
  }

  getPriceFormatted(price: number, currency: string): string {
    const currencySymbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'COP': '$'
    };
    
    const symbol = currencySymbols[currency] || currency;
    return `${symbol} ${price.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
