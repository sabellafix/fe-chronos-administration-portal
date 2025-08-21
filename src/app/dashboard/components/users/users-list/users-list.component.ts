import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { DialogConfirmComponent } from '../../shared/dialogs/dialog-confirm/dialog-confirm.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '@app/core/models/bussiness/user';
import { UserService } from '@app/core/services/http/user.service';
import { Option } from '@app/core/models/interfaces/option.interface';
import { EntiesConst } from '@app/core/models/constants/entity.const';
import { Rol } from '@app/core/models/bussiness/rol';
import { UserRole } from '@app/core/models/bussiness/enums';
import { RolesConst } from '@app/core/models/constants/roles.const';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent {
  titleComponent : string = "Stylist list";
  entity : string = EntiesConst._USER;
  loading: boolean = false;
  user: User = new User();
  users: User[] = [];
  roles: Rol[] = [];
  rol : string = RolesConst._STYLIST;
   
  attributes : Option[] = [ 
    {name: "Name", code : "firstName"}, 
    {name: "Last name", code : "lastName"},
    {name: "Email", code : "email"},
    {name: "Role", code : "userRole"},
    {name: "Teléfono", code : "phone"}
  ];

  states : Option[] = [ 
    { name: "Activo", code: "true" },
    { name: "Inactivo", code: "false" }
  ];

  userRoles : Option[] = [
    { name: "Cliente", code: UserRole.Client },
    { name: "Proveedor de Servicios", code: UserRole.ServiceProvider }
  ];

  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  showPaginate : boolean = true; // Deshabilitado hasta implementar paginación en backend
  maxItems = [10,20,50];

  constructor(
    private userService: UserService,
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
    this.userService.getUsersByRole(this.rol).subscribe({
      next: (response: User[]) => {
        this.users = response;  
        this.totalItems = response.length;
        this.loading = false;
      },error: (response) =>{
        this.snackBar.open('Error getting users', 'Close', {duration: 4000});
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
    this.router.navigate([`/users/create`]);
  }

  update(id: string): void {
    this.router.navigate([`/users/${id}/update`]);
  }

  detail(id: string): void {
    this.router.navigate([`/users/${id}/detail`]);
  }

  availability(id: string): void {
    this.router.navigate([`/users/${id}/availability`]);
  }

  delete(id: string): void {
      const dialogRef = this.dialog.open(DialogConfirmComponent, {
        width: '400px',
        data: {
          title: 'Do you want to delete the user?',
          description: ['This will delete the selected user.'],
          labelButtons: ['Yes, delete', 'Cancel']
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.userService.delete(id).subscribe({
            next: (response: any) => {              
              this.snackBar.open('User deleted successfully', 'Close', {duration: 4000});
              this.load();
            }, error: (error: any) =>{
              let message = '';
              if(error.error.message && error.status != 422){
                message = error.error.message;
              }
              this.snackBar.open('Error executing the deletion ' + message, 'Close', {duration: 4000});
            }
          });
        }
      });
  }

  filter(filters: string){
    // TODO: Implementar filtros cuando esté disponible en el backend
    this.load();
  }

  getFullName(user: User): string {
    const fullName = [user.firstName, user.lastName].filter(name => name).join(' ');
    return fullName || user.name || 'Sin nombre';
  }

  getUserRole(user: User): string {
    switch(user.userRole) {
      case UserRole.Client:
        return 'Cliente';
      case UserRole.ServiceProvider:
        return 'Service provider';
      default:
        return user.userType || 'No defined';
    }
  }

  getUserStatus(user: User): string {
    if (user.isDeleted) return 'Deleted';
    if (!user.isActive) return 'Inactive';
    if (!user.isVerified) return 'Unverified';
    return 'Active';
  }

  getUserStatusClass(user: User): string {
    if (user.isDeleted) return 'status-deleted';
    if (!user.isActive) return 'status-inactive';
    if (!user.isVerified) return 'status-unverified';
    return 'status-active';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  }

  clear(){}
}
