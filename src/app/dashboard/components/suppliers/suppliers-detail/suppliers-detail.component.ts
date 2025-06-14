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
  selector: 'app-suppliers-detail',
  templateUrl: './suppliers-detail.component.html',
  styleUrl: './suppliers-detail.component.scss'
})
export class SuppliersDetailComponent {
  titleComponent: string = "Detalle de estilista";
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
      rating : new FormControl(0),
      totalReviews : new FormControl(0),
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
    this.router.navigate([`/suppliers/update/${this.id}`]);
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

  getSupplierStatus(supplier: Supplier): string {
    if (!supplier.isActive) return 'Inactivo';
    if (!supplier.isVerified) return 'No verificado';
    return 'Activo';
  }

  getSupplierStatusClass(supplier: Supplier): string {
    if (!supplier.isActive) return 'status-inactive';
    if (!supplier.isVerified) return 'status-unverified';
    return 'status-active';
  }

  getRatingStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
  }
}
