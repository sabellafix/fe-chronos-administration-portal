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
import { UserService } from '@app/core/services/http/user.service';

import { Validation } from '@app/core/models/dtos/validation';

@Component({
  selector: 'app-users-detail',
  templateUrl: './users-detail.component.html',
  styleUrl: './users-detail.component.scss'
})
export class UsersDetailComponent {

  titleComponent: string = "Stylist Details";
  loading: boolean = true;
  charge: boolean = false;
  hasChanged : boolean = false;
  pagination: Pagination = { offset: 0, limit: 100, items: 0, filters: ``, sort: 'id,desc' };
  send: boolean = false;
  response? : Response;
  form: FormGroup; 
  id: string = "";
  user: User = new User();
  srcImage: string = "assets/images/user-image.jpg";
  now : Date = new Date();
  roles: any[] = [];
  loadingRoles: boolean = false;
  codephones : Option[] = [];
  country? : Option;

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
          if(this.user.photo) {
            this.srcImage = this.user.photo;
          }
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
    this.router.navigate([`/users/${this.id}/update`]);
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
    if (user.isDeleted) return 'Deleted';
    if (!user.isActive) return 'Inactive';
    if (!user.isVerified) return 'Not verified';
    return 'Active';
  }

  getUserStatusClass(user: User): string {
    if (user.isDeleted) return 'badge-danger';
    if (!user.isActive) return 'badge-warning';
    if (!user.isVerified) return 'badge-info';
    return 'badge-success';
  }

  getUserTypes(): Option[] {
    return [
      { name: 'Stylist', code: 'stylist' },
      { name: 'Admin', code: 'admin' }
    ];
  }

  getRoleName(code: string): string {
    const role = this.roles.find(r => r.code === code);
    return role ? role.name : code;
  }

}
