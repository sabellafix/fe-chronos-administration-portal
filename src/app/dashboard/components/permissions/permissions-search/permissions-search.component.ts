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
    titleComponent: string = "Search permissions";
    pagination: Pagination = { offset: 0, limit: 10, items: 0, filters: ``, sort: 'id,desc' };
    permissions : Permission[] = [];
    selected : Permission[] = [];
    attributes = ['resource', 'description'];
  
    id: number = 0;
    selectAll : boolean = false;
    keySearch : string = '';
  
    totalItems = 10;    
    pageSize = 10;
    pageIndex = 0;
    showPaginate : boolean = true;
    maxItems = [10,20,50];
  
    constructor(public dialogRef: MatDialogRef<PermissionsSearchComponent>,
                @Inject(MAT_DIALOG_DATA) public data: { selected: Permission[] },
                private permissionService: PermissionService,
    ){
    }
  
    ngOnInit(): void {
      if(this.data.selected){      
        this.data.selected.forEach(perm => {this.selected.push(perm)});
      }
      this.load();
    }
  
    load(){
      this.loading = true;
      this.permissionService.getPermissions().subscribe({
        next: (response) => {
          this.permissions = <Permission[]>response;
          this.permissions = this.setPermissions(this.selected, this.permissions)
          this.totalItems = response.length;
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
  
    setAll(){
      this.permissions.forEach(perm => {
        perm.active = !this.selectAll;
        const index = this.selected.findIndex(select => select.id == perm.id);
        if(perm.active){
            if (index == -1) {
              this.selected.push(perm);
            }
        }else{
          if (index >= 0) {
            this.selected.splice(index, 1);
          }
        }
      });
    }
  
    changePage(event: any) {
      this.pageIndex = event.pageIndex;
      this.pageSize = event.pageSize;
      this.pagination.offset = this.pageIndex;
      this.pagination.limit = this.pageSize;
      this.selectAll = false; 
      this.load();
    }
  
    onKeyUp(event: KeyboardEvent) {
      const key = event.key;
      if (/^[a-zA-Z0-9]$/.test(key) || key === 'Backspace' || key === 'Delete') {
        this.search();
      }
    }
  
    search(){
      if(this.keySearch){
        let search = this.keySearch.trim().toLocaleLowerCase();
        let values = this.attributes.map(attribute => ({ attribute, search }));
        // this.pagination.filters = this.filterService.buildAttributeFiltersURL(values, ',');
        this.pagination.offset = 0;
      }else{
        this.pagination.filters = '';
      }
      this.load();
    }
  
    close(reason: boolean){
      if(reason){
        const select = this.selected;
        this.dialogRef.close(select);
      }else{
        this.dialogRef.close();
      }
    }
  
    select(permission : Permission){
      permission.active = !permission.active;
      if(!permission.active){
        const index = this.selected.findIndex(perm => perm.id == permission.id);
        if (index >= 0) {
          this.selected.splice(index, 1);
        }
      }else{
        this.selected.push(permission);
      }
      this.permissions = this.setPermissions(this.selected, this.permissions)
    }
  
  }
  