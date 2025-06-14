import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Category } from '@app/core/models/bussiness/category';
import { CategoryService } from '@app/core/services/http/category.service';
import { Option } from '@app/core/models/interfaces/option.interface';
import { EntiesConst } from '@app/core/models/constants/entity.const';
import { DialogConfirmComponent } from '@app/dashboard/components/shared/dialogs/dialog-confirm/dialog-confirm.component';

@Component({
  selector: 'app-categories-list',
  templateUrl: './categories-list.component.html',
  styleUrl: './categories-list.component.scss'
})
export class CategoriesListComponent {
  titleComponent: string = "Listado de categorías";
  entity: string = EntiesConst._CATEGORY;
  loading: boolean = false;
  category: Category = new Category();
  categories: Category[] = [];
   
  attributes: Option[] = [ 
    {name: "Nombre", code: "name"}, 
    {name: "Descripción", code: "description"}
  ];

  states: Option[] = [ 
    { name: "Activo", code: "true" },
    { name: "Inactivo", code: "false" }
  ];
  
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  showPaginate: boolean = false; // Deshabilitado hasta implementar paginación en backend
  maxItems = [10, 20, 50];
  Math = Math;

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.categoryService.getCategories().subscribe({
      next: (response: Category[]) => {
        this.categories = response;
        this.totalItems = response.length;
        this.loading = false;
      },
      error: (response) => {
        this.snackBar.open('Error al obtener las categorías', 'Cerrar', {duration: 4000});
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
    this.router.navigate([`/categories/create`]);
  }

  update(id: number): void {
    this.router.navigate([`/categories/${id}/update`]);
  }

  detail(id: number): void {
    this.router.navigate([`/categories/${id}/detail`]);
  }

  delete(id: number): void {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      width: '400px',
      data: {
        title: '¿Quiere eliminar la categoría?',
        description: ['Esta acción eliminará la categoría seleccionada.'],
        labelButtons: ['Sí, eliminar', 'Cancelar']
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.categoryService.delete(id).subscribe({
          next: (response: any) => {
            this.snackBar.open('Categoría eliminada correctamente', 'Cerrar', {duration: 4000});
            this.load();
          }, 
          error: (error: any) => {
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

  getCategoryStatus(category: Category): string {
    return category.isActive ? 'Activo' : 'Inactivo';
  }

  getCategoryStatusClass(category: Category): string {
    return category.isActive ? 'status-active' : 'status-inactive';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  }

  clear(){}
}
