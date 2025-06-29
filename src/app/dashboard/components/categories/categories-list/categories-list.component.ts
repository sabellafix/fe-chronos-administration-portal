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
  titleComponent: string = "Categories";
  entity: string = EntiesConst._CATEGORY;
  loading: boolean = false;
  category: Category = new Category();
  categories: Category[] = [];
  showSearch: boolean = false;
   
  attributes: Option[] = [ 
    {name: "Name", code: "name"}, 
    {name: "Description", code: "description"}
  ];

  states: Option[] = [ 
    { name: "Active", code: "true" },
    { name: "Inactive", code: "false" }
  ];
  
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  showPaginate: boolean = true;
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
        this.snackBar.open('Error getting the categories', 'Close', {duration: 4000});
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
        title: 'Are you sure you want to delete the category?',
        description: ['This action will delete the selected category.'],
        labelButtons: ['Yes, delete', 'Cancel']
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.categoryService.deleteCategory(id).subscribe({
          next: (response: any) => {
            this.snackBar.open('Category deleted successfully', 'Close', {duration: 4000});
            this.load();
          }, 
          error: (error: any) => {
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
    // TODO: Implement filters when available in the backend
    this.load();
  }

  getCategoryStatus(category: Category): string {
    return category.isActive ? 'Active' : 'Inactive';
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
