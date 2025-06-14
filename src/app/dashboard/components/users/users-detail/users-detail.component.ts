import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  selector: 'app-users-detail',
  templateUrl: './users-detail.component.html',
  styleUrl: './users-detail.component.scss'
})
export class UsersDetailComponent {

  titleComponent: string = "Detalle de usuario";
  loading: boolean = true;
  charge: boolean = false;
  hasChanged : boolean = false;
  pagination: Pagination = { offset: 0, limit: 100, items: 0, filters: ``, sort: 'id,desc' };
  send: boolean = false;
  response? : Response;
  form: FormGroup; 
  id: string = "";
  user: User = new User();
  now : Date = new Date();
  roles: Rol[] = [];
  loadingRoles: boolean = false;
  codephones : Option[] = [];
  country? : Option;

  constructor(private userService: MockUserService,
              private parametricService: ParametricService,
              private router: Router,
              private snackBar: MatSnackBar,
              private route: ActivatedRoute,
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
      isActive : new FormControl(false),
      isVerified : new FormControl(false),
      isDeleted : new FormControl(false),
    });

    this.route.params.subscribe(params => { if (params['id']) this.id = params['id'] });

    this.form.valueChanges.subscribe(() => {
      this.hasChanged = Object.values(this.form.controls).some(control => control.dirty);
    });
  }

  ngOnInit(): void {
   
    this.loading = true;
    this.country = { id : 52, name : "Colombia", code: "+57"}
    this.load();
    this.loadValues();
    this.roles = [
      { id: 1, name: 'Comprador', code: 'Buyer', description: 'Comprador', active: true, reserved: false, defaultValue: false, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: 'Proovedor', code: 'Supplier', description: 'Proovedor', active: true, reserved: false, defaultValue: false, createdAt: new Date(), updatedAt: new Date() },
    ];
    
  }

  load(): void{
    if(this.id) {
      this.loading = true;
      this.userService.get(this.id).subscribe({
        next: (data: any) => {      
          this.user = <User>data;
          this.setForm();
        },error: (error: any) => {
          this.loading = false;
          this.snackBar.open('Error al cargar el usuario', 'Cerrar', {duration: 4000});
        }
      });
    }
  }

  async setForm(){
    if(this.user){
      let object : Object = {
        name : this.user.name,
        phoneNumber : this.user.phoneNumber,
        email : this.user.email,
        address : this.user.address,
        userType : this.user.userType,
        department : this.user.department,
        employeeId : this.user.employeeId,
        companyName : this.user.companyName,
        entraId : this.user.entraId,
        b2CId : this.user.b2CId,
        isActive : this.user.isActive,
        isVerified : this.user.isVerified,
        isDeleted : this.user.isDeleted,
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

  loadValues(): void {
    forkJoin({options: this.parametricService.getOptions()})
    .subscribe({
      next: ({options}) => {
        this.codephones = options.codephones;
        
      }
    });
  }

  update(){
    this.router.navigate([`/users/update/${this.id}`]);
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

  getUserStatus(user: User): string {
    if (user.isDeleted) return 'Eliminado';
    if (!user.isActive) return 'Inactivo';
    if (!user.isVerified) return 'No verificado';
    return 'Activo';
  }

  getUserStatusClass(user: User): string {
    if (user.isDeleted) return 'status-deleted';
    if (!user.isActive) return 'status-inactive';
    if (!user.isVerified) return 'status-unverified';
    return 'status-active';
  }

  getUserTypes(): Option[] {
    return [
      { name: 'Comprador', code: 'Buyer' },
      { name: 'Proveedor', code: 'Supplier' },
      { name: 'Administrador', code: 'Admin' }
    ];
  }

}
