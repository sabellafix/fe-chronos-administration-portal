import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Customer } from '@app/core/models/bussiness/customer';
import { DateOnly } from '@app/core/models/bussiness/availability';
import { CustomerService } from '@app/core/services/http/customer.service';
import { UserService } from '@app/core/services/http/user.service';
import { User } from '@app/core/models/bussiness/user';
import { Response } from '@app/core/models/dtos/response';
import { Validation } from '@app/core/models/dtos/validation';

@Component({
  selector: 'app-customers-create',
  templateUrl: './customers-create.component.html',
  styleUrl: './customers-create.component.scss'
})
export class CustomersCreateComponent {
  titleComponent: string = "Create Customer";
  loading: boolean = false;
  charge: boolean = false;
  send: boolean = false;
  response? : Response;
  form: FormGroup; 
  now : Date = new Date();
  users: User[] = [];
  imageUser: string | ArrayBuffer | null = "../assets/images/user-image.jpg";

  genderOptions = [
    { value: 'M', label: 'Male' },
    { value: 'F', label: 'Female' },
    { value: 'O', label: 'Other' }
  ];

  languageOptions = [
    { value: 'EN', label: 'English' },
    { value: 'ES', label: 'Spanish' },
    { value: 'FR', label: 'French' },
    { value: 'PT', label: 'Portuguese' }
  ];

  constructor(private customerService: CustomerService,
              private router: Router,
              private snackBar: MatSnackBar,
              private userService: UserService
  ){
    this.form = new FormGroup({
      firstName : new FormControl("", Validators.required),
      lastName : new FormControl("", Validators.required),
      dateOfBirth : new FormControl("", Validators.required),
      gender : new FormControl("", Validators.required),
      photo : new FormControl(""),
      preferredLanguage : new FormControl("EN", Validators.required),
      address : new FormControl("", Validators.required),
      userId : new FormControl("", Validators.required),
      isActive : new FormControl(true),
    });
  }

  ngOnInit(): void {
    this.getUsers();
    this.form.patchValue({
      isActive: true,
      preferredLanguage: "EN"
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
      const dateOfBirthValue = this.form.get('dateOfBirth')?.value;
      let dateOfBirth = new DateOnly();
      
      if (dateOfBirthValue) {
        const date = new Date(dateOfBirthValue);
        dateOfBirth.year = date.getFullYear();
        dateOfBirth.month = date.getMonth() + 1;
        dateOfBirth.day = date.getDate();
      }

      let post = {
        firstName : this.form.get('firstName')?.value,
        lastName : this.form.get('lastName')?.value,
        dateOfBirth : dateOfBirth,
        gender : this.form.get('gender')?.value,
        photo : this.form.get('photo')?.value || "",
        preferredLanguage : this.form.get('preferredLanguage')?.value,
        address : this.form.get('address')?.value,
        userId : this.form.get('userId')?.value,
        isActive : this.form.get('isActive')?.value,
      }
      
      this.charge = true;
      this.send = false;
      this.response = new Response();
      this.customerService.createCustomer(post).subscribe({
        next: (data: any) => {
          let customer = <Customer>data;          
          this.charge = false;
          this.snackBar.open('Customer created successfully.', 'Close', {duration: 4000});
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
    this.router.navigate([`/customers`]);
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
      preferredLanguage: "EN"
    });
  }

  getGenderLabel(value: string): string {
    const option = this.genderOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  }

  getLanguageLabel(value: string): string {
    const option = this.languageOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  }

  getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.form?.get('photo')?.setValue('');
        this.snackBar.open('Please select an image file.', 'Close', {duration: 4000});
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageUser = e.target?.result!;
      };
      reader.readAsDataURL(file);
      this.form.controls['photo'].setValue(file);
    }
  }

}
