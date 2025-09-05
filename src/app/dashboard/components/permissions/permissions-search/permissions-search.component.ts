import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Permission } from '@app/core/models/bussiness';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { PermissionService } from '@app/core/services/http/permission.service';

@Component({
  selector: 'app-permissions-search',
  templateUrl: './permissions-search.component.html',
  styleUrl: './permissions-search.component.scss'
})
export class PermissionsSearchComponent {

    loading: boolean = true;
    titleComponent: string = "Search Permissions";
    pagination: Pagination = { offset: 0, limit: 10, items: 0, filters: ``, sort: 'id,desc' };
    permissions: Permission[] = []; // Permisos mostrados con paginación y filtros
    allPermissions: Permission[] = []; // Todos los permisos cargados del servidor
    filteredPermissions: Permission[] = []; // Permisos filtrados por búsqueda
    selected: Permission[] = [];
    attributes = ['resource', 'description', 'name'];
  
    id: number = 0;
    selectAll: boolean = false;
    keySearch: string = '';
  
    totalItems = 0;    
    pageSize = 10;
    pageIndex = 0;
    showPaginate: boolean = true;
    maxItems = [10, 20, 50];
  
    constructor(public dialogRef: MatDialogRef<PermissionsSearchComponent>,
                @Inject(MAT_DIALOG_DATA) public data: { selected: Permission[] },
                private permissionService: PermissionService,
    ){
    }
  
      ngOnInit(): void {
    if (this.data.selected) {      
      this.data.selected.forEach(perm => { this.selected.push(perm) });
    }
    this.load();
  }

  load(): void {
    this.loading = true;
    this.permissionService.getPermissions().subscribe({
      next: (response) => {
        this.allPermissions = <Permission[]>response;
        this.allPermissions = this.setPermissions(this.selected, this.allPermissions);
        
        this.applyFiltersAndPagination();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando permisos:', error);
        this.loading = false;
      }
    });
  }
  
    setPermissions(selected: Permission[], all: Permission[]): Permission[] {
      all.forEach(x => {
        const exist = selected.find( y => y.id == x.id);
        if(exist){
          x.active = true;
        }
      });
      return all;
    }
  
      setAll(): void {
    this.permissions.forEach(perm => {
      perm.active = !this.selectAll;
      const index = this.selected.findIndex(select => select.id == perm.id);
      if (perm.active) {
        if (index == -1) {
          this.selected.push(perm);
        }
      } else {
        if (index >= 0) {
          this.selected.splice(index, 1);
        }
      }
    });
    
    this.updateAllPermissionsSelection();
  }
  
      changePage(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.pagination.offset = this.pageIndex;
    this.pagination.limit = this.pageSize;
    this.selectAll = false; 
    
    this.applyPagination();
  }
  
      onKeyUp(event: KeyboardEvent): void {
    const key = event.key;
    if (/^[a-zA-Z0-9\s]$/.test(key) || key === 'Backspace' || key === 'Delete') {
      this.search();
    }
  }

  search(): void {
    this.pageIndex = 0;
    this.applyFiltersAndPagination();
  }

  clearSearch(): void {
    this.keySearch = '';
    this.pageIndex = 0;
    this.applyFiltersAndPagination();
  }
  
      close(reason: boolean): void {
    if (reason) {
      const select = this.selected;
      this.dialogRef.close(select);
    } else {
      this.dialogRef.close();
    }
  }

  select(permission: Permission): void {
    permission.active = !permission.active;
    if (!permission.active) {
      const index = this.selected.findIndex(perm => perm.id == permission.id);
      if (index >= 0) {
        this.selected.splice(index, 1);
      }
    } else {
      this.selected.push(permission);
    }
    
    this.updateAllPermissionsSelection();
  }


  private applyFiltersAndPagination(): void {
    this.applyFilters();
    this.applyPagination();
  }

  private applyFilters(): void {
    if (this.keySearch && this.keySearch.trim()) {
      const searchTerm = this.keySearch.trim().toLowerCase();
      this.filteredPermissions = this.allPermissions.filter(permission => {
        return this.attributes.some(attribute => {
          const value = (permission as any)[attribute];
          return value && value.toString().toLowerCase().includes(searchTerm);
        });
      });
    } else {
      this.filteredPermissions = [...this.allPermissions];
    }
    
    this.totalItems = this.filteredPermissions.length;
  }

  private applyPagination(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.permissions = this.filteredPermissions.slice(startIndex, endIndex);
  }

  private updateAllPermissionsSelection(): void {
    this.allPermissions.forEach(perm => {
      const isSelected = this.selected.some(selected => selected.id === perm.id);
      perm.active = isSelected;
    });
    
    this.filteredPermissions.forEach(perm => {
      const isSelected = this.selected.some(selected => selected.id === perm.id);
      perm.active = isSelected;
    });
    
    this.permissions.forEach(perm => {
      const isSelected = this.selected.some(selected => selected.id === perm.id);
      perm.active = isSelected;
    });
  }

}
  