import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Supplier } from '@app/core/models/bussiness/supplier';
import { SupplierService } from '@app/core/services/http/supplier.service';
import { Option } from '@app/core/models/interfaces/option.interface';
import { DialogConfirmComponent } from '@app/dashboard/components/shared/dialogs/dialog-confirm/dialog-confirm.component';

@Component({
  selector: 'app-suppliers-list',
  templateUrl: './suppliers-list.component.html',
  styleUrl: './suppliers-list.component.scss'
})
export class SuppliersListComponent {
  titleComponent : string = "List of stylists";
  loading: boolean = false;
  supplier: Supplier = new Supplier();
  suppliers: Supplier[] = [];
   
  attributes : Option[] = [ 
    {name: "Empresa", code : "companyName"}, 
    {name: "Email", code : "businessEmail"},
    {name: "Teléfono", code : "businessPhone"},
    {name: "Verificado", code : "isVerified"},
    {name: "Rating", code : "rating"} 
  ];

  states : Option[] = [ 
    { name: "Activo", code: "true" },
    { name: "Inactivo", code: "false" }
  ];

  verificationStates : Option[] = [
    { name: "Verificado", code: "true" },
    { name: "No verificado", code: "false" }
  ];

  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  showPaginate : boolean = true; // Deshabilitado hasta implementar paginación en backend
  maxItems = [10,20,50];

  constructor(
    private supplierService: SupplierService,
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
    this.supplierService.getSuppliers().subscribe({
      next: (response: Supplier[]) => {
        this.suppliers = response;
        this.totalItems = response.length;
        this.loading = false;
      },error: (response) =>{
        this.snackBar.open('Error al obtener los proveedores', 'Cerrar', {duration: 4000});
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
    this.router.navigate([`/suppliers/create`]);
  }

  update(id: string): void {
    this.router.navigate([`/suppliers/${id}/update`]);
  }

  detail(id: string): void {
    this.router.navigate([`/suppliers/${id}/detail`]);
  }

  availability(id: string): void {
    this.router.navigate([`/suppliers/${id}/availability`]);
  }

  delete(id: string): void {
      const dialogRef = this.dialog.open(DialogConfirmComponent, {
        width: '400px',
        data: {
          title: '¿Quiere eliminar el proveedor?',
          description: ['Esta acción eliminará el proveedor seleccionado.'],
          labelButtons: ['Sí, eliminar', 'Cancelar']
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.supplierService.deleteSupplier(id).subscribe({
            next: (response: any) => {              
              this.snackBar.open('Proveedor eliminado correctamente', 'Cerrar', {duration: 4000});
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

  getSupplierName(supplier: Supplier): string {
    return [supplier.companyName, supplier.businessEmail ? `(${supplier.businessEmail})` : '']
      .filter(name => name)
      .join(' ')!;
  }

  getSupplierStatus(supplier: Supplier): string {
    if (!supplier.isActive) return 'Inactivo';
    if (!supplier.isVerified) return 'No verificado';
    return 'Activo';
  }

  getSupplierStatusClass(supplier: Supplier): string {
    if (!supplier.isActive) return 'status-inactive';
    if (!supplier.isVerified) return 'status-unverified';
    return 'status-active';
  }

  getRatingStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  }

  clear(){}
}
