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
import { MockUserService } from '@app/core/services/mock/mock-user.service';
import { Rol } from '@app/core/models/bussiness/rol';
import { Validation } from '@app/core/models/dtos/validation';

@Component({
  selector: 'app-users-create',
  templateUrl: './users-create.component.html',
  styleUrl: './users-create.component.scss'
})
export class UsersCreateComponent {
  titleComponent: string = "Crear usuario";
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
  country? : Option;
  roles: any[] = [];

  constructor(private userService: MockUserService,
              private parametricService: ParametricService,
              private router: Router,
              private snackBar: MatSnackBar
  ){
    this.form = new FormGroup({
      name : new FormControl("", Validators.required),
      phoneNumber : new FormControl("", [Validators.required]),
      email : new FormControl("", [Validators.required, Validators.email]),
      address : new FormControl("", Validators.required),
      userType : new FormControl("", Validators.required),
      department : new FormControl(""),
      employeeId : new FormControl(""),
      companyName : new FormControl(""),
      entraId : new FormControl(""),
      b2CId : new FormControl(""),
      isActive : new FormControl(true),
      isVerified : new FormControl(false),
      isDeleted : new FormControl(false),
    });

  }

  ngOnInit(): void {
    this.loading = true;
    this.country = { id : 52, name : "Colombia", code: "+57"}
    this.loadValues();
    
    // Inicializar roles
    this.roles = [
      { id: 1, name: 'Comprador', code: 'Buyer' },
      { id: 2, name: 'Proveedor', code: 'Supplier' },
      { id: 3, name: 'Administrador', code: 'Admin' }
    ];
    
    // Inicializar valores por defecto del formulario
    this.form.patchValue({
      isActive: true,
      isVerified: false,
      isDeleted: false
    });
  }

  post(){
    this.form.markAllAsTouched();
    if( this.form.valid){
      let post = {
        name : this.form.get('name')?.value,
        phoneNumber : this.form.get('phoneNumber')?.value,
        email : this.form.get('email')?.value,
        address : this.form.get('address')?.value,
        userType : this.form.get('userType')?.value,
        department : this.form.get('department')?.value,
        employeeId : this.form.get('employeeId')?.value,
        companyName : this.form.get('companyName')?.value,
        entraId : this.form.get('entraId')?.value,
        b2CId : this.form.get('b2CId')?.value,
        isActive : this.form.get('isActive')?.value,
        isVerified : this.form.get('isVerified')?.value,
        isDeleted : this.form.get('isDeleted')?.value,
      }
      this.charge = true;
      this.send = false;
      this.response = new Response();
      this.userService.post(post).subscribe({
        next: (data: any) => {
          let user = <User>data;          
          this.charge = false;
          this.snackBar.open('Usuario creado correctamente.', 'Cerrar', {duration: 4000});
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
        this.snackBar.open('Error al cargar los datos', 'Cerrar', {duration: 4000});
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Por favor selecciona un archivo de imagen.', 'Cerrar', {duration: 4000});
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.srcImage = e.target?.result!;
      };
      reader.readAsDataURL(file);
      // Note: photo field is not part of User entity, this is just for UI preview
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
