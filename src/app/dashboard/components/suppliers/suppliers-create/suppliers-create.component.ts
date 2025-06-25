import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Supplier } from '@app/core/models/bussiness/supplier';
import { MockSupplierService } from '@app/core/services/mock/mock-supplier.service';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { Response } from '@app/core/models/dtos/response';
import { Validation } from '@app/core/models/dtos/validation';
import { User } from '@app/core/models/bussiness/user';
import { UserService } from '@app/core/services/http/user.service';

@Component({
  selector: 'app-suppliers-create',
  templateUrl: './suppliers-create.component.html',
  styleUrl: './suppliers-create.component.scss'
})
export class SuppliersCreateComponent {
  titleComponent: string = "Create supplier";
  loading: boolean = false;
  charge: boolean = false;
  pagination: Pagination = { offset: 0, limit: 100, items: 0, filters: ``, sort: 'id,desc' };
  send: boolean = false;
  response? : Response;
  form: FormGroup; 
  now : Date = new Date();
  users: User[] = [];

  constructor(private supplierService: MockSupplierService,
              private router: Router,
              private snackBar: MatSnackBar,
              private userService: UserService
  ){
    this.form = new FormGroup({
      companyName : new FormControl("", Validators.required),
      businessDescription : new FormControl(""),
      businessAddress : new FormControl("", Validators.required),
      website : new FormControl(""),
      businessEmail : new FormControl("", [Validators.required, Validators.email]),
      businessPhone : new FormControl("", Validators.required),
      userId : new FormControl("", Validators.required),
      isVerified : new FormControl(true),
      rating : new FormControl(5, [Validators.min(0), Validators.max(5)]),
      totalReviews : new FormControl(0, [Validators.min(0)]),
      isActive : new FormControl(true),
    });
  }

  ngOnInit(): void {
    this.getUsers();
    this.form.patchValue({
      isActive: true,
      isVerified: true,
      rating: 5,
      totalReviews: 0
    });
  }

  getUsers(): void{
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (response: User[]) => {
        this.users = response;
        this.loading = false;
      },error: (response) =>{
        this.snackBar.open('Error getting users', 'Close', {duration: 4000});
        this.loading = false;
      }
    });
  }

  post(){
    this.form.markAllAsTouched();
    if( this.form.valid){
      let post = {
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
      this.supplierService.post(post).subscribe({
        next: (data: any) => {
          let supplier = <Supplier>data;          
          this.charge = false;
          this.snackBar.open('Supplier created successfully.', 'Close', {duration: 4000});
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

  resetForm(): void {
    this.form.reset();
    this.form.patchValue({
      isActive: true,
      isVerified: false,
      rating: 0,
      totalReviews: 0
    });
  }

  getRatingStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
  }

}
