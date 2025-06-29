import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Category } from '@app/core/models/bussiness/category';
import { CategoryService } from '@app/core/services/http/category.service';
import { CreateCategoryDto } from '@app/core/models/bussiness/create-dtos';

@Component({
  selector: 'app-categories-create',
  templateUrl: './categories-create.component.html',
  styleUrl: './categories-create.component.scss'
})
export class CategoriesCreateComponent {
  titleComponent: string = "Create category";
  loading: boolean = false;
  charge: boolean = false;
  send: boolean = false;
  form: FormGroup;
  now: Date = new Date();

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = new FormGroup({
      name: new FormControl("", Validators.required),
      description: new FormControl("", Validators.required),
      isActive: new FormControl(true),
    });
  }

  ngOnInit(): void {
    this.loading = false;
    this.form.patchValue({
      isActive: true
    });
  }

  post() {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      const createDto: CreateCategoryDto = {
        name: this.form.get('name')?.value,
        description: this.form.get('description')?.value
      };

      this.charge = true;
      this.send = false;
      this.categoryService.createCategory(createDto).subscribe({
        next: (data: Category) => {
          this.charge = false;
          this.snackBar.open('Categoría creada correctamente.', 'Cerrar', { duration: 4000 });
          this.return();
        },
        error: (error: any) => {
          let message = '';
          if (error.error.message && error.status != 422) {
            message = error.error.message;
          }
          this.charge = false;
          this.snackBar.open('Error ejecutando la creación ' + message, 'Cerrar', { duration: 4000 });
        }
      });
    }
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

  toggleStatus(field: string): void {
    const control = this.form.get(field);
    if (control) {
      control.setValue(!control.value);
      this.form.markAsDirty();
    }
  }

  resetForm(): void {
    this.form.reset();
    this.form.patchValue({
      isActive: true
    });
  }
}
