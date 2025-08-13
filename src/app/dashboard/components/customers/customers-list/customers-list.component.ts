import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Customer } from '@app/core/models/bussiness/customer';
import { CustomerService } from '@app/core/services/http/customer.service';
import { Option } from '@app/core/models/interfaces/option.interface';
import { DialogConfirmComponent } from '@app/dashboard/components/shared/dialogs/dialog-confirm/dialog-confirm.component';

@Component({
  selector: 'app-customers-list',
  templateUrl: './customers-list.component.html',
  styleUrl: './customers-list.component.scss'
})
export class CustomersListComponent {
  titleComponent : string = "Customers";
  loading: boolean = false;
  customer: Customer = new Customer();
  customers: Customer[] = [];
   
  attributes : Option[] = [ 
    {name: "State", code : "isActive"}, 
    {name: "First Name", code : "firstName"}, 
    {name: "Last Name", code : "lastName"},
    {name: "Gender", code : "gender"},
    {name: "Language", code : "preferredLanguage"} 
  ];

  states : Option[] = [ 
    { name: "Active", code: "true" },
    { name: "Inactive", code: "false" }
  ];

  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  showPaginate : boolean = true; // Deshabilitado hasta implementar paginación en backend
  maxItems = [10,20,50];

  constructor(
    private customerService: CustomerService,
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
    this.customerService.getAllCustomers().subscribe({
      next: (response: Customer[]) => {
        this.customers = response;
        this.totalItems = response.length;
        this.loading = false;
      },error: (response) =>{
        this.snackBar.open('Error al obtener los clientes', 'Cerrar', {duration: 4000});
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
    this.router.navigate([`/customers/create`]);
  }

  update(id: string): void {
    this.router.navigate([`/customers/${id}/update`]);
  }

  detail(id: string): void {
    this.router.navigate([`/customers/${id}/detail`]);
  }

  delete(id: string): void {
      const dialogRef = this.dialog.open(DialogConfirmComponent, {
        width: '400px',
        data: {
          title: '¿Quiere eliminar el cliente?',
          description: ['Esta acción eliminará el cliente seleccionado.'],
          labelButtons: ['Sí, eliminar', 'Cancelar']
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.customerService.deleteCustomer(id).subscribe({
            next: (response: any) => {              
              this.snackBar.open('Cliente eliminado correctamente', 'Cerrar', {duration: 4000});
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

  getCustomerName(customer: Customer): string {
    return [customer.firstName, customer.lastName]
      .filter(name => name)
      .join(' ')!;
  }

  getCustomerStatus(customer: Customer): string {
    return customer.isActive ? 'Activo' : 'Inactivo';
  }

  getCustomerStatusClass(customer: Customer): string {
    return customer.isActive ? 'status-active' : 'status-inactive';
  }

  getGenderFormatted(gender: string): string {
    switch(gender?.toLowerCase()) {
      case 'm':
      case 'male':
        return 'Masculino';
      case 'f':
      case 'female':
        return 'Femenino';
      case 'o':
      case 'other':
        return 'Otro';
      default:
        return 'N/A';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  }

  getLanguageFormatted(language: string): string {
    switch(language?.toUpperCase()) {
      case 'EN':
        return 'Inglés';
      case 'ES':
        return 'Español';
      case 'FR':
        return 'Francés';
      case 'PT':
        return 'Portugués';
      default:
        return language || 'N/A';
    }
  }

  clear(){}
}
