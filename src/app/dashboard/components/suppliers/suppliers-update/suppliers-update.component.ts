import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Supplier } from '@app/core/models/bussiness/supplier';
import { MockSupplierService } from '@app/core/services/mock/mock-supplier.service';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { Option } from '@app/core/models/interfaces/option.interface';
import { Response } from '@app/core/models/dtos/response';
import { Validation } from '@app/core/models/dtos/validation';

@Component({
  selector: 'app-suppliers-update',
  templateUrl: './suppliers-update.component.html',
  styleUrl: './suppliers-update.component.scss'
})
export class SuppliersUpdateComponent {
  titleComponent: string = "Actualizar estilista";
  loading: boolean = true;
  charge: boolean = false;
  hasChanged : boolean = false;
  pagination: Pagination = { offset: 0, limit: 100, items: 0, filters: ``, sort: 'id,desc' };
  send: boolean = false;
  response? : Response;
  form: FormGroup; 
  id: string = "";
  supplier: Supplier = new Supplier();
  now : Date = new Date();

  constructor(private supplierService: MockSupplierService,
              private router: Router,
              private snackBar: MatSnackBar,
              private route: ActivatedRoute,
  ){
    this.form = new FormGroup({
      companyName : new FormControl("", Validators.required),
      businessDescription : new FormControl(""),
      businessAddress : new FormControl("", Validators.required),
      website : new FormControl(""),
      businessEmail : new FormControl("", [Validators.required, Validators.email]),
      businessPhone : new FormControl("", Validators.required),
      userId : new FormControl("", Validators.required),
      isVerified : new FormControl(false),
      rating : new FormControl(0, [Validators.min(0), Validators.max(5)]),
      totalReviews : new FormControl(0, [Validators.min(0)]),
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
      this.supplierService.get(this.id).subscribe({
        next: (data: any) => {      
          this.supplier = <Supplier>data;
          this.setForm();
        },error: (error: any) => {
          this.loading = false;
          this.snackBar.open('Error al cargar el proveedor', 'Cerrar', {duration: 4000});
        }
      });
    }
  }

  async setForm(){
    if(this.supplier){
      let object : Object = {
        companyName : this.supplier.companyName,
        businessDescription : this.supplier.businessDescription,
        businessAddress : this.supplier.businessAddress,
        website : this.supplier.website,
        businessEmail : this.supplier.businessEmail,
        businessPhone : this.supplier.businessPhone,
        userId : this.supplier.userId,
        isVerified : this.supplier.isVerified,
        rating : this.supplier.rating,
        totalReviews : this.supplier.totalReviews,
        isActive : this.supplier.isActive,
      };
      this.form.setValue(object);
    }
    this.loading = false;
  }

  put(){
    this.form.markAllAsTouched();
    if( this.form.valid){
      let put = {
        companyName : this.form.get('companyName')?.value,
        businessDescription : this.form.get('businessDescription')?.value,
        businessAddress : this.form.get('businessAddress')?.value,
        website : this.form.get('website')?.value,
        businessEmail : this.form.get('businessEmail')?.value,
        businessPhone : this.form.get('businessPhone')?.value,
        userId : this.form.get('userId')?.value,
        isVerified : this.form.get('isVerified')?.value,
        rating : this.form.get('rating')?.value,
        totalReviews : this.form.get('totalReviews')?.value,
        isActive : this.form.get('isActive')?.value,
      }
      this.charge = true;
      this.send = false;
      this.response = new Response();
      this.supplierService.put(put, this.id).subscribe({
        next: (data: any) => {
          this.charge = false;
          let supplier = <Supplier>data;
          this.snackBar.open('Proveedor actualizado correctamente.', 'Cerrar', {duration: 4000});
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
          this.snackBar.open('Error ejecutando la actualización ' + message, 'Cerrar', {duration: 4000});
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
    this.router.navigate([`/suppliers`]);
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

  toggleStatus(field: string): void {
    const control = this.form.get(field);
    if (control) {
      control.setValue(!control.value);
      this.form.markAsDirty();
    }
  }

  getRatingStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
  }
}
