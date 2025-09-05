import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { RolService } from '@app/core/services/http/rol.service';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { Permission, CreateRolDto, CreateRolePermissionDto } from '@app/core/models/bussiness';
import { RolePermission } from '@app/core/models/bussiness/rolePermission';
import { Response } from '@app/core/models/dtos/response';
import { Validation } from '@app/core/models/dtos/validation';
import { PermissionsSearchComponent } from '../../permissions/permissions-search/permissions-search.component';
import { StorageService } from '@app/core/services/shared/storage.service';
import { StorageKeyConst } from '@app/core/models/constants/storageKey.const';
import { User } from '@app/core/models/bussiness/user';

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
  permissions: Permission[] = [];
  rolePermissions: RolePermission[] = [];
  selectAll: boolean = false;
  validPermissions: boolean = true;
  send: boolean = false;
  response?: Response;
  userLogged: User = new User();

  totalItems = 10;
  pageSize = 10;
  pageIndex = 0;
  showPaginate : boolean = true;
  maxItems = [10,20,50];

  constructor(private rolService: RolService,
              private dialog: MatDialog,
              private router: Router,
              private snackBar: MatSnackBar,
              private storageService: StorageService
  ){
    this.form = new FormGroup({
      name: new FormControl("", Validators.required),
      description: new FormControl("", Validators.required)
    });
    this.userLogged = this.getUsetLogged();
  }

  ngOnInit(): void {
    this.loading = false;
  }

  getUsetLogged(): User {
    const user = this.storageService.get(StorageKeyConst._USER);
    return user as User;
  }

  post(): void {
    this.form.markAllAsTouched();
    const selectedPermissions = this.permissions.filter(x => x.active);
    this.validPermissions = (selectedPermissions.length > 0);
    
    if (this.form.valid && this.validPermissions) {
      // Crear RolePermissions por cada Permission seleccionado
      const rolePermissions = this.createRolePermissions(selectedPermissions);
      
      // Crear el DTO usando la estructura correcta
      const createRolDto: CreateRolDto = new CreateRolDto();
      createRolDto.name = this.form.get('name')?.value;
      createRolDto.code = this.form.get('code')?.value;
      createRolDto.description = this.form.get('description')?.value;
      createRolDto.rolePermissions = rolePermissions;

      this.charge = true;
      this.send = false;
      
      this.rolService.createRol(createRolDto).subscribe({
        next: (data: any) => {
          this.charge = false;
          this.snackBar.open('Rol created successfully.', 'Close', { duration: 4000 });
          this.return();
        },
        error: (error: any) => {
          let message = '';
          if (error.status == 422) {
            this.send = true;
            this.response = error.error;
          }
          if (error.error.message && error.status != 422) {
            message = error.error.message;
          }
          this.charge = false;
          this.snackBar.open('Error executing the creation ' + message, 'Close', { duration: 4000 });
        }
      });
    }
  }

  setAll(): void {
    this.permissions.forEach(x => { x.active = !this.selectAll });
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

  search(): void {
    const dialogRef = this.dialog.open(PermissionsSearchComponent, {
      width: '60%',
      data: {
        selected: this.permissions
      }
    });
    dialogRef.afterClosed().subscribe((selected: Permission[]) => {
      if (selected && selected.length > 0) {
        this.permissions = selected;
        this.updateRolePermissions();
        this.totalItems = this.permissions.length;
        this.validPermissions = true;
        this.pageIndex = 0;
        this.pageSize = 10;
        this.pagination.offset = this.pageIndex;
        this.pagination.limit = this.pageSize;
        this.snackBar.open('Permissions updated.', 'Close', { duration: 4000 });
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

  generateCode(): void {
    const nameValue = this.form.get('name')?.value;
    if (nameValue) {
      const code = nameValue.toUpperCase().replace(/\s+/g, '_');
      this.form.get('code')?.setValue(code);
    }
  }

  getValidation(controlName: string): Validation | undefined {
    if (this.response?.validation) {
      const validation = this.response?.validation.find(val => controlName == val.attribute.split('.').pop()!.toString());
      if (validation) {
        return validation;
      }
    }
    return undefined;
  }

  // Métodos para manejar RolePermissions

  private createRolePermissions(selectedPermissions: Permission[]): CreateRolePermissionDto[] {
    return selectedPermissions.map(permission => {
      const rolePermissionDto = new CreateRolePermissionDto();
      rolePermissionDto.permissionId = permission.id;
      rolePermissionDto.grantedBy = this.userLogged.id;
      return rolePermissionDto;
    });
  }

  private updateRolePermissions(): void {
    this.rolePermissions = this.permissions.map(permission => {
      const rolePermission = new RolePermission();
      rolePermission.permissionId = permission.id;
      rolePermission.permission = permission;
      rolePermission.isActive = permission.active || false;
      rolePermission.grantedAt = new Date().toISOString();
      rolePermission.grantedBy = this.userLogged.id;
      return rolePermission;
    });
  }

  getRolePermissionByPermission(permission: Permission): RolePermission | undefined {
    return this.rolePermissions.find(rp => rp.permissionId === permission.id);
  }

  isPermissionGranted(permission: Permission): boolean {
    const rolePermission = this.getRolePermissionByPermission(permission);
    return rolePermission ? rolePermission.isActive : false;
  }
    
  return(): void {
    this.router.navigate([`/roles`]);
  }

}
