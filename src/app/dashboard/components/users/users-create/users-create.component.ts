import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { User } from '@app/core/models/bussiness/user';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { Response } from '@app/core/models/dtos/response';
import { Option } from '@app/core/models/interfaces/option.interface';
import { ParametricService } from '@app/core/services/shared/parametric.service';
import { Validation } from '@app/core/models/dtos/validation';
import { UserService } from '@app/core/services/http/user.service';
import { RolesConst } from '@app/core/models/constants/roles.const';

@Component({
  selector: 'app-users-create',
  templateUrl: './users-create.component.html',
  styleUrl: './users-create.component.scss'
})
export class UsersCreateComponent {
  titleComponent: string = "Create stylist";
  loading: boolean = true;
  charge: boolean = false;
  pagination: Pagination = { offset: 0, limit: 100, items: 0, filters: ``, sort: 'id,desc' };
  send: boolean = false;
  response? : Response;
  form: FormGroup; 
  validPhoto : boolean = true;
  photoUrl : string = "";
  srcImage :  string | ArrayBuffer | null = "assets/images/user-image.jpg";
  now : Date = new Date();
  codephones : Option[] = [];

  constructor(private userService: UserService,
              private parametricService: ParametricService,
              private router: Router,
              private snackBar: MatSnackBar
  ){
    this.form = new FormGroup({
      firstName : new FormControl("", Validators.required),
      lastName : new FormControl("", Validators.required),
      email : new FormControl("", [Validators.required, Validators.email]),
      phone : new FormControl("", [Validators.required, Validators.pattern(/^\d{9}$/)]),
      password : new FormControl("", [Validators.required, Validators.minLength(8)]),
    });

  }

  ngOnInit(): void {
    this.loading = true;
    this.loadValues();
    
    
  }

  post(){
    this.form.markAllAsTouched();
    if( this.form.valid){
      let post = {
        firstName : this.form.get('firstName')?.value,
        lastName : this.form.get('lastName')?.value,  
        email : this.form.get('email')?.value,
        phone : this.form.get('phone')?.value,
        password : this.form.get('password')?.value,
        userRole : RolesConst._STYLIST,
      }
      this.charge = true;
      this.send = false;
      this.response = new Response();
      this.userService.post(post).subscribe({
        next: (data: any) => {
          let user = <User>data;          
          this.charge = false;
          this.snackBar.open('Stylist created successfully.', 'Close', {duration: 4000});
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

  load(){
    this.loadValues();
  }


  loadValues(): void {
    forkJoin({options: this.parametricService.getOptions()})
    .subscribe({
      next: ({options}) => {
        this.codephones = options.codephones;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Error loading data', 'Close', {duration: 4000});
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Please select an image file.', 'Close', {duration: 4000});
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.srcImage = e.target?.result!;
      };
      reader.readAsDataURL(file);
    }
  }

  return(){
    this.router.navigate([`/users`]);
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

  asignAutoComplete(option: Option, controlName: string){
    this.form.get(controlName)?.setValue(option.code!);
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
      isDeleted: false
    });
    this.srcImage = "assets/images/user-image.jpg";
  }

}
