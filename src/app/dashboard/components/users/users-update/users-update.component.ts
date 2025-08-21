import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { UserService } from '@app/core/services/http/user.service';
import { ParametricService } from '@app/core/services/shared/parametric.service';
import { User } from '@app/core/models/bussiness/user';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { Response } from '@app/core/models/dtos/response';
import { Validation } from '@app/core/models/dtos/validation';
import { Option } from '@app/core/models/interfaces/option.interface';

@Component({
  selector: 'app-users-update',
  templateUrl: './users-update.component.html',
  styleUrl: './users-update.component.scss'
})
export class UsersUpdateComponent {

  titleComponent: string = "Update Stylist";
  loading: boolean = true;
  charge: boolean = false;
  hasChanged : boolean = false;
  pagination: Pagination = { offset: 0, limit: 100, items: 0, filters: ``, sort: 'id,desc' };
  send: boolean = false;
  response? : Response;
  form: FormGroup; 
  id: string = "";
  user: User = new User();
  validPhoto : boolean = true;
  photoUrl : string = "";
  srcImage : string = "assets/images/user-image.jpg";
  photoBase64 : string = "";
  now : Date = new Date();
  codephones : Option[] = [];
  country? : Option;
  roles: any[] = [];
  showPasswordFields: boolean = false;

  constructor(private userService: UserService,
              private parametricService: ParametricService,
              private router: Router,
              private snackBar: MatSnackBar,
              private route: ActivatedRoute,
  ){
    this.form = new FormGroup({
      firstName : new FormControl("", Validators.required),
      lastName : new FormControl("", Validators.required),
      email : new FormControl("", [Validators.required, Validators.email]),
      phone : new FormControl("", [Validators.required, Validators.pattern(/^\d{9}$/)]),
      userRole : new FormControl("", Validators.required),
      newPassword : new FormControl(""),
      confirmPassword : new FormControl(""),
    });

    this.route.params.subscribe(params => { if (params['id']) this.id = params['id'] });

    this.form.valueChanges.subscribe(() => {
      this.hasChanged = Object.values(this.form.controls).some(control => control.dirty);
    });
  }

  ngOnInit(): void {
    this.loading = true;
    this.country = { id : "52", name : "Colombia", code: "+57"}
    this.load();
    
    this.roles = [
      { id: 1, name: 'Stylist', code: 'stylist' },
      { id: 2, name: 'Admin', code: 'admin' }
    ];
  }

  load(): void{
    if(this.id) {
      this.loading = true;
      this.userService.get(this.id).subscribe({
        next: (data: any) => {      
          this.user = <User>data;
          console.log(this.user);
          console.log("srcImage" , this.srcImage);
          this.setForm();
        },error: (error: any) => {
          this.loading = false;
          this.snackBar.open('Error loading the user', 'Cerrar', {duration: 4000});
        }
      });
    }
  }

  async setForm(){
    if(this.user){
      let object : Object = {
        firstName : this.user.firstName,
        lastName : this.user.lastName,
        email : this.user.email,
        phone : this.user.phone,
        userRole : this.user.userRole,
        newPassword : "",
        confirmPassword : "",
      };
      this.form.setValue(object);
      
      if (this.user.photo && this.user.photo !== "assets/images/user-image.jpg") {
        this.srcImage =  this.user.photo;
      }
    }
    this.loading = false;
  }

  put(){
    this.form.markAllAsTouched();
    
    if (!this.validPhoto) {
      this.snackBar.open('Select a valid image.', 'Cerrar', {duration: 4000});
      return;
    }
    
    if (this.showPasswordFields) {
      const newPassword = this.form.get('newPassword')?.value;
      const confirmPassword = this.form.get('confirmPassword')?.value;
      
      if (newPassword && newPassword.length < 8) {
        this.snackBar.open('The new password must have at least 8 characters', 'Cerrar', {duration: 4000});
        return;
      }
      
      if (newPassword !== confirmPassword) {
        this.snackBar.open('The passwords do not match', 'Cerrar', {duration: 4000});
        return;
      }
    }
    
    if( this.form.valid){
      let put = {
        firstName : this.form.get('firstName')?.value,
        lastName : this.form.get('lastName')?.value,
        email : this.form.get('email')?.value,
        phone : this.form.get('phone')?.value,
        userRole : this.form.get('userRole')?.value,
        photo : this.photoBase64 || this.user.photo,
      }
      
      if (this.showPasswordFields && this.form.get('newPassword')?.value) {
        (put as any).password = this.form.get('newPassword')?.value;
      }
      
      this.charge = true;
      this.send = false;
      this.response = new Response();
      this.userService.put(put, this.id).subscribe({
        next: (data: any) => {
          this.charge = false;
          let user = <User>data;
          this.snackBar.open('User updated correctly.', 'Cerrar', {duration: 4000});
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
          this.snackBar.open('Error executing the update ' + message, 'Cerrar', {duration: 4000});
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



  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      if (!file.type.startsWith('image/')) {
        this.validPhoto = false;
        this.snackBar.open('Select a valid image file.', 'Cerrar', {duration: 4000});
        return;
      }
      
      const maxSizeInBytes = 5 * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        this.validPhoto = false;
        this.snackBar.open('The image must be less than 5MB.', 'Cerrar', {duration: 4000});
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.validPhoto = false;
        this.snackBar.open('Invalid image format. Use: JPEG, PNG, GIF or WebP.', 'Cerrar', {duration: 4000});
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          this.srcImage = result;
          
          // Mantener los metadatos completos del archivo (data:image/tipo;base64,...)
          this.photoBase64 = result;
          
          this.validPhoto = true;
          this.form.markAsDirty();
          this.snackBar.open('Image loaded correctly.', 'Cerrar', {duration: 2000});
        }
      };
      
      reader.onerror = () => {
        this.validPhoto = false;
        this.snackBar.open('Error loading the image.', 'Cerrar', {duration: 4000});
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

  getUserTypes(): Option[] {
    return [
      { name: 'Comprador', code: 'Buyer' },
      { name: 'Proveedor', code: 'Supplier' },
      { name: 'Administrador', code: 'Admin' }
    ];
  }

  togglePasswordFields(): void {
    this.showPasswordFields = !this.showPasswordFields;
    
    if (this.showPasswordFields) {
      this.form.get('newPassword')?.setValidators([Validators.required, Validators.minLength(8)]);
      this.form.get('confirmPassword')?.setValidators([Validators.required]);
    } else {
      this.form.get('newPassword')?.clearValidators();
      this.form.get('confirmPassword')?.clearValidators();
      this.form.get('newPassword')?.setValue('');
      this.form.get('confirmPassword')?.setValue('');
    }
    
    this.form.get('newPassword')?.updateValueAndValidity();
    this.form.get('confirmPassword')?.updateValueAndValidity();
  }

  resetForm(): void {
    this.setForm();
    this.showPasswordFields = false;
    this.togglePasswordFields();
    this.srcImage = "assets/images/user-image.jpg";
    this.photoBase64 = "";
    this.validPhoto = true;
  }

}
