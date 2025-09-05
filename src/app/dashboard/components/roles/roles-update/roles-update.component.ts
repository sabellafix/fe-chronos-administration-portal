import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { RolService } from '@app/core/services/http/rol.service';
import { PermissionService } from '@app/core/services/http/permission.service';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { Permission, Rol, UpdateRolDto, UpdateRolePermissionDto, User } from '@app/core/models/bussiness';
import { RolePermission } from '@app/core/models/bussiness/rolePermission';
import { Response } from '@app/core/models/dtos/response';
import { Validation } from '@app/core/models/dtos/validation';
import { PermissionsSearchComponent } from '../../permissions/permissions-search/permissions-search.component';
import { StorageKeyConst } from '@app/core/models/constants/storageKey.const';
import { StorageService } from '@app/core/services/shared/storage.service';

@Component({
  selector: 'app-roles-update',
  templateUrl: './roles-update.component.html',
  styleUrl: './roles-update.component.scss'
})
export class RolesUpdateComponent {

  loading: boolean = true;
  charge: boolean = false;
  titleComponent: string = "Update Role";
  pagination: Pagination = { offset: 0, limit: 1000, items: 0, filters: ``, sort: 'id,desc' };
  form: FormGroup; 
  permissions: Permission[] = [];
  availablePermissions: Permission[] = [];
  selectAll: boolean = false;
  validPermissions: boolean = true;
  send: boolean = false;
  response?: Response;
  userLogged: User = new User();
  
  rolId: number = 0;
  currentRol: Rol = new Rol();

  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  showPaginate: boolean = true;
  maxItems = [10, 20, 50];

  constructor(
    private rolService: RolService,
    private permissionService: PermissionService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private storageService: StorageService
  ) {
    this.form = new FormGroup({
      name: new FormControl("", Validators.required),
      description: new FormControl("", Validators.required)
    });
    this.userLogged = this.getUsetLogged();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.rolId = +params['id'];
      if (this.rolId) {
        this.loadRol();
      } else {
        this.router.navigate(['/roles']);
      }
    });
  }

  loadRol(): void {
    this.loading = true;
    this.rolService.getRol(this.rolId).subscribe({
      next: (response: Rol) => {
        this.currentRol = response;       
        this.populateForm();
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Error loading the rol', 'Close', { duration: 4000 });
        this.loading = false;
        this.router.navigate(['/roles']);
      }
    });
  }

  getUsetLogged(): User {
    const user = this.storageService.get(StorageKeyConst._USER);
    return user as User;
  }


  populateForm(): void {
    this.form.patchValue({
      name: this.currentRol.name,
      description: this.currentRol.description
    });
    
    // Mapear los permisos del rol desde rolePermissions
    this.mapRolePermissionsToPermissions();
    this.totalItems = this.permissions.length;
    this.validPermissions = this.permissions.length > 0;
  }

  put(): void {
    this.form.markAllAsTouched();
    this.validPermissions = this.permissions.length > 0;
    
    if (this.form.valid && this.validPermissions) {
      // Sincronizar rolePermissions antes de enviar
      this.updateRolePermissions();
      
      const updateRolDto: UpdateRolDto = new UpdateRolDto();
      updateRolDto.name = this.form.get('name')?.value;
      updateRolDto.description = this.form.get('description')?.value;
      updateRolDto.isActive = this.currentRol.isActive;
      
      // Agregar rolePermissions al DTO si el backend lo soporta
      updateRolDto.rolePermissions = this.getActiveRolePermissions();

      this.charge = true;
      this.send = false;
      
      this.rolService.updateRol(this.rolId, updateRolDto).subscribe({
        next: (data: Rol) => {
          this.charge = false;
          this.snackBar.open('Rol updated successfully.', 'Close', { duration: 4000 });
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
          this.snackBar.open('Error executing the update ' + message, 'Close', { duration: 4000 });
        }
      });
    }
  }

  setAll() {
    this.selectAll = !this.selectAll;
    this.permissions.forEach(x => { x.active = this.selectAll });
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
      this.updateRolePermissions(); // Sincronizar con rolePermissions
      this.totalItems = this.permissions.length;
      this.validPermissions = this.permissions.length > 0;
    }
  }

  removeAll(): void {
    this.permissions = [];
    this.updateRolePermissions(); // Sincronizar con rolePermissions
    this.totalItems = 0;
    this.validPermissions = false;
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
        this.updateRolePermissions(); // Sincronizar con rolePermissions
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

  getValidation(controlName: string): Validation | undefined {
    if (this.response?.validation) {
      const validation = this.response?.validation.find(val => controlName == val.attribute.split('.').pop()!.toString());
      if (validation) {
        return validation;
      }
    }
    return undefined;
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
    }
  }

  toggleActiveStatus(): void {
    this.currentRol.isActive = !this.currentRol.isActive;
  }

  private mapRolePermissionsToPermissions(): void {
    if (this.currentRol.rolePermissions && this.currentRol.rolePermissions.length > 0) {
      this.permissions = this.currentRol.rolePermissions
        .map(rp => {
          const permission = rp.permission;
          permission.active = true; 
          return permission;
        });
    } else {
      this.permissions = [];
    }
  }

  private updateRolePermissions(): void {
    if (this.currentRol.rolePermissions) {
      this.currentRol.rolePermissions.forEach(rp => {
        rp.isActive = false;
      });

      this.permissions.forEach(permission => {
        const existingRolePermission = this.currentRol.rolePermissions.find(
          rp => rp.permissionId === permission.id
        );
        
        if (existingRolePermission) {
          existingRolePermission.isActive = true;
          existingRolePermission.permission = permission;
        } else {
          const newRolePermission = new RolePermission();
          newRolePermission.roleId = this.currentRol.id;
          newRolePermission.permissionId = permission.id;
          newRolePermission.permission = permission;
          newRolePermission.isActive = true;
          newRolePermission.grantedAt = new Date().toISOString();
          newRolePermission.grantedBy = this.userLogged.id;
          this.currentRol.rolePermissions.push(newRolePermission);
        }
      });
    }
  }

  private getActiveRolePermissions(): UpdateRolePermissionDto[] {
    return this.currentRol.rolePermissions?.filter(rp => rp.isActive).map(rp => {
      const updateRolePermissionDto = new UpdateRolePermissionDto();
      updateRolePermissionDto.permissionId = rp.permissionId;
      updateRolePermissionDto.grantedBy = rp.grantedBy;
      updateRolePermissionDto.roleId = rp.roleId;
      return updateRolePermissionDto;
    }) || [];
  }

  private hasPermission(permissionId: number): boolean {
    return this.currentRol.rolePermissions?.some(
      rp => rp.permissionId === permissionId && rp.isActive
    ) || false;
  }

  return() {
    this.router.navigate([`/roles`]);
  }
}
