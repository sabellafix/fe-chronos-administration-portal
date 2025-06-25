import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Category } from '@app/core/models/bussiness/category';
import { CategoryService } from '@app/core/services/http/category.service';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';

@Component({
  selector: 'app-categories-detail',
  templateUrl: './categories-detail.component.html',
  styleUrl: './categories-detail.component.scss'
})
export class CategoriesDetailComponent {
  titleComponent: string = "Detalle de categoría";
  loading: boolean = true;
  charge: boolean = false;
  hasChanged: boolean = false;
  pagination: Pagination = { offset: 0, limit: 100, items: 0, filters: ``, sort: 'id,desc' };
  send: boolean = false;
  form: FormGroup;
  id: number = 0;
  category: Category = new Category();
  now: Date = new Date();

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
  ) {
    this.form = new FormGroup({
      name: new FormControl("", Validators.required),
      description: new FormControl("", Validators.required),
      isActive: new FormControl(false),
    });

    this.route.params.subscribe(params => { 
      if (params['id']) this.id = parseInt(params['id'], 10);
    });

    this.form.valueChanges.subscribe(() => {
      this.hasChanged = Object.values(this.form.controls).some(control => control.dirty);
    });
  }

  ngOnInit(): void {
    this.loading = true;
    this.load();
  }

  load(): void {
    if (this.id && this.id > 0) {
      this.loading = true;
      this.categoryService.get(this.id).subscribe({
        next: (data: Category) => {
          this.category = data;
          this.setForm();
        }, 
        error: (error: any) => {
          this.loading = false;
          this.snackBar.open('Error al cargar la categoría', 'Cerrar', { duration: 4000 });
        }
      });
    }
  }

  async setForm() {
    if (this.category) {
      let object: Object = {
        name: this.category.name,
        description: this.category.description,
        isActive: this.category.isActive,
      };
      this.form.setValue(object);
      this.form.disable();
    }
    this.loading = false;
  }

  update() {
    this.router.navigate([`/categories/${this.id}/update`]);
  }

  return() {
    this.router.navigate([`/categories`]);
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

  getCategoryStatus(category: Category): string {
    return category.isActive ? 'Active' : 'Inactive';
  }

  getCategoryStatusClass(category: Category): string {
    return category.isActive ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger ';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
