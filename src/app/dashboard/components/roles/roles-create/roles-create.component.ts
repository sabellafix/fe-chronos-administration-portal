import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { RolService } from '@app/core/services/http/rol.service';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { Permission } from '@app/core/models/bussiness';
import { PermissionsSearchComponent } from '../../permissions/permissions-search/permissions-search.component';

@Component({
  selector: 'app-roles-create',
  templateUrl: './roles-create.component.html',
  styleUrl: './roles-create.component.scss'
})
export class RolesCreateComponent {
  
  loading: boolean = true;
  charge: boolean = false;
  titleComponent: string = "Create rol";
  pagination: Pagination = { offset: 0, limit: 1000, items: 0, filters: ``, sort: 'id,desc' };
  form: FormGroup; 
  permissions : Permission[] = [];
  selectAll : boolean = false;
  validPermissions : boolean = true;
  send: boolean = false;
  response? : Response;

  totalItems = 10;
  pageSize = 10;
  pageIndex = 0;
  showPaginate : boolean = true;
  maxItems = [10,20,50];

  constructor(private rolService: RolService,
              private dialog: MatDialog,
              private router: Router,
              private snackBar: MatSnackBar
  ){
    this.form = new FormGroup({
      name : new FormControl("", Validators.required),
      description : new FormControl("", Validators.required)
    });

  }

  ngOnInit(): void {
    this.loading = false;
  }

  post(){
    this.form.markAllAsTouched();
    const select = this.permissions.filter(x => x.isActive);
    this.validPermissions = (select.length > 0);
    if( this.form.valid && this.validPermissions){
      let permissions = this.permissions.map(permission => permission.name);
      let post = {
        name : this.form.get('name')?.value,
        code : this.form.get('code')?.value,
        description :  this.form.get('description')?.value,
        permissions : permissions
      }
      this.charge = true;
      this.send = false;
      this.rolService.createRol(post).subscribe({
        next: (data: any) => {
          this.charge = false;
          this.snackBar.open('Rol created successfully.', 'Close', {duration: 4000});
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

  setAll(){
    this.permissions.forEach(x => {x.isActive = !this.selectAll});
  }

  changePage(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.pagination.offset = this.pageIndex;
    this.pagination.limit = this.pageSize;
  }
 

  remove(permission: Permission): void {
    const index = this.permissions.indexOf(permission);
    if (index >= 0) {
      this.permissions.splice(index, 1);
    }
  }

  removeAll(): void {
    this.permissions = [];
  }

  search(){
    const dialogRef = this.dialog.open(PermissionsSearchComponent, {
      width: '60%',
      data: {
        selected: this.permissions
      }
    });
    dialogRef.afterClosed().subscribe((selected: Permission[]) => {
      if (selected && selected.length > 0) {
        this.permissions = selected;
        this.totalItems = this.permissions.length;
        this.validPermissions = true;
        this.pageIndex = 0;
        this.pageSize = 10;
        this.pagination.offset = this.pageIndex;
        this.pagination.limit = this.pageSize;
        this.snackBar.open('Permissions updated.', 'Close', {duration: 4000});
      }   
    });
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
    
  return(){
    this.router.navigate([`/roles`]);
  }

}
