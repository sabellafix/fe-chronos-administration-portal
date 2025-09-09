import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { RolService } from '@app/core/services/http/rol.service';
import { PermissionService } from '@app/core/services/http/permission.service';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { Permission, Rol } from '@app/core/models/bussiness';
import { Response } from '@app/core/models/dtos/response';

@Component({
  selector: 'app-roles-detail',
  templateUrl: './roles-detail.component.html',
  styleUrl: './roles-detail.component.scss'
})
export class RolesDetailComponent {

  loading: boolean = true;
  charge: boolean = false;
  titleComponent: string = "Detail Role";
  pagination: Pagination = { offset: 0, limit: 1000, items: 0, filters: ``, sort: 'id,desc' };
  form: FormGroup; 
  permissions: Permission[] = [];
  validPermissions: boolean = true;
  send: boolean = false;
  response?: Response;
  
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
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.form = new FormGroup({
      name: new FormControl("", Validators.required),
      description: new FormControl("", Validators.required)
    });
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

  update(): void {
    this.router.navigate([`/roles/${this.rolId}/update`]);
  }

  changePage(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.pagination.offset = this.pageIndex;
    this.pagination.limit = this.pageSize;
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


  return() {
    this.router.navigate([`/roles`]);
  }
}
