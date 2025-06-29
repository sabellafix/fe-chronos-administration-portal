import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Category } from '@app/core/models/bussiness/category';
import { CategoryService } from '@app/core/services/http/category.service';
import { UpdateCategoryDto } from '@app/core/models/bussiness/update-dtos';

@Component({
  selector: 'app-categories-update',
  templateUrl: './categories-update.component.html',
  styleUrl: './categories-update.component.scss'
})
export class CategoriesUpdateComponent {
  titleComponent: string = "Update category";
  loading: boolean = true;
  charge: boolean = false;
  hasChanged: boolean = false;
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
      this.categoryService.getCategory(this.id).subscribe({
        next: (data: Category) => {
          this.category = data;
          this.setForm();
        }, 
        error: (error: any) => {
          this.loading = false;
          this.snackBar.open('Error loading the category', 'Close', { duration: 4000 });
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
    }
    this.loading = false;
  }

  put() {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      const updateDto: UpdateCategoryDto = {
        name: this.form.get('name')?.value,
        description: this.form.get('description')?.value,
        isActive: this.form.get('isActive')?.value,
      };

      this.charge = true;
      this.send = false;
      this.categoryService.updateCategory(this.id, updateDto).subscribe({
        next: (data: Category) => {
          this.charge = false;
          this.snackBar.open('Category updated successfully.', 'Close', { duration: 4000 });
          this.hasChanged = false;
          this.return();
        },
        error: (error: any) => {
          let message = '';
          if (error.error.message && error.status != 422) {
            message = error.error.message;
          }
          this.charge = false;
          this.snackBar.open('Error executing the update ' + message, 'Close', { duration: 4000 });
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
}
