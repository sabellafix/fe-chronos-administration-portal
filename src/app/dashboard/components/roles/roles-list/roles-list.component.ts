import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Rol } from '@app/core/models/bussiness';
import { Option } from '@app/core/models/interfaces/option.interface';
import { DialogConfirmComponent } from '@app/dashboard/components/shared/dialogs/dialog-confirm/dialog-confirm.component';
import { RolService } from '@app/core/services/http/rol.service';

@Component({
  selector: 'app-roles-list',
  templateUrl: './roles-list.component.html',
  styleUrl: './roles-list.component.scss'
})
export class RolesListComponent {
  titleComponent : string = "Roles";
  loading: boolean = false;
  rol: Rol = new Rol();
  roles: Rol[] = [];
   
  attributes : Option[] = [ 
    {name: "Estado", code : "isActive"}, 
    {name: "Nombre", code : "name"}, 
    {name: "Código", code : "code"},
    {name: "Descripción", code : "description"} 
  ];

  states : Option[] = [ 
    { name: "Activo", code: "true" },
    { name: "Inactivo", code: "false" }
  ];

  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  showPaginate : boolean = true; 
  maxItems = [10,20,50];  

  constructor(
    private rolService: RolService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ){
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.rolService.getRoles().subscribe({
      next: (response: Rol[]) => {
        this.roles = response;
        this.totalItems = response.length;
        this.loading = false;
      },error: (response) =>{
        this.snackBar.open('Error al obtener los roles', 'Cerrar', {duration: 4000});
        this.totalItems = 0;
        this.loading = false;
      }
    });
  }

  changePage(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    // TODO: Implementar paginación cuando esté disponible en el backend
    this.load();
  }

  create(): void {
    this.router.navigate([`/roles/create`]);
  }

  update(id: number): void {
    this.router.navigate([`/roles/${id}/update`]);
  }

  detail(id: number): void {
    this.router.navigate([`/roles/${id}/detail`]);
  }

  delete(id: number): void {
      const dialogRef = this.dialog.open(DialogConfirmComponent, {
        width: '400px',
        data: {
          title: '¿Quiere eliminar el rol?',
          description: ['Esta acción eliminará el rol seleccionado.'],
          labelButtons: ['Sí, eliminar', 'Cancelar']
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.rolService.deleteRol(id).subscribe({
            next: (response: any) => {              
              this.snackBar.open('Rol eliminado correctamente', 'Cerrar', {duration: 4000});
              this.load();
            }, error: (error: any) =>{
              let message = '';
              if(error.error.message && error.status != 422){
                message = error.error.message;
              }
              this.snackBar.open('Error ejecutando la eliminación ' + message, 'Cerrar', {duration: 4000});
            }
          });
        }
      });
  }

  filter(filters: string){
    // TODO: Implementar filtros cuando esté disponible en el backend
    this.load();
  }

  getRolStatus(rol: Rol): string {
    return rol.isActive ? 'Activo' : 'Inactivo';
  }

  getRolStatusClass(rol: Rol): string {
    return rol.isActive ? 'status-active' : 'status-inactive';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  }

  clear(){}

  getRolDisplayName(rol: Rol): string {
    return rol.name || 'Sin nombre';
  }

  getRolType(rol: Rol): string {
    return rol.isSystemRole ? 'Sistema' : 'Personalizado';
  }

  getRolTypeClass(rol: Rol): string {
    return rol.isSystemRole ? 'badge bg-info text-white' : 'badge bg-secondary text-white';
  }
}
