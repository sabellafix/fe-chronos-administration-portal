import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Salon } from '@app/core/models/bussiness/salon';
import { SalonService } from '@app/core/services/http/salon.service';
import { SalonStateService } from '@app/core/services/shared/salon-state.service';
import { UpdateSalonDto } from '@app/core/models/bussiness';
import { Response } from '@app/core/models/dtos/response';
import { Validation } from '@app/core/models/dtos/validation';

@Component({
  selector: 'app-salons-update',
  templateUrl: './salons-update.component.html',
  styleUrl: './salons-update.component.scss'
})
export class SalonsUpdateComponent {
  titleComponent: string = "Update salon";
  loading: boolean = true;
  charge: boolean = false;
  hasChanged: boolean = false;
  send: boolean = false;
  response?: Response;
  form: FormGroup;
  id: string = "";
  salon: Salon = new Salon();

  constructor(
    private salonService: SalonService,
    private salonStateService: SalonStateService,
    private router: Router,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {
    this.form = new FormGroup({
      name: new FormControl("", [Validators.required, Validators.maxLength(100)]),
      description: new FormControl("", [Validators.maxLength(500)]),
      capacity: new FormControl(1, [Validators.required, Validators.min(1)]),
      address: new FormControl("", [Validators.required, Validators.maxLength(200)]),
      city: new FormControl("", [Validators.required, Validators.maxLength(100)]),
      state: new FormControl("", [Validators.maxLength(100)]),
      country: new FormControl("", [Validators.required, Validators.maxLength(100)]),
      zipCode: new FormControl("", [Validators.maxLength(20)]),
      isActive: new FormControl(true)
    });

    this.route.params.subscribe(params => { if (params['id']) this.id = params['id'] });

    this.form.valueChanges.subscribe(() => {
      this.hasChanged = Object.values(this.form.controls).some(control => control.dirty);
    });
  }

  ngOnInit(): void {
    this.loading = true;
    this.load();
  }

  load(): void {
    if (this.id) {
      this.loading = true;
      this.salonService.getSalon(this.id).subscribe({
        next: (data: any) => {
          this.salon = <Salon>data;
          this.setForm();
        },
        error: (error: any) => {
          this.loading = false;
          this.snackBar.open('Error loading the salon', 'Close', { duration: 4000 });
        }
      });
    }
  }

  async setForm() {
    if (this.salon) {
      let object: Object = {
        name: this.salon.name,
        description: this.salon.description,
        capacity: this.salon.capacity,
        address: this.salon.address,
        city: this.salon.city,
        state: this.salon.state,
        country: this.salon.country,
        zipCode: this.salon.zipCode,
        isActive: this.salon.isActive
      };
      this.form.setValue(object);
    }
    this.loading = false;
  }

  put() {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      let updateDto: UpdateSalonDto = new UpdateSalonDto();
      updateDto.name = this.form.get('name')?.value;
      updateDto.description = this.form.get('description')?.value || '';
      updateDto.capacity = this.form.get('capacity')?.value;
      updateDto.address = this.form.get('address')?.value;
      updateDto.city = this.form.get('city')?.value;
      updateDto.state = this.form.get('state')?.value || '';
      updateDto.country = this.form.get('country')?.value;
      updateDto.zipCode = this.form.get('zipCode')?.value || '';
      updateDto.isActive = this.form.get('isActive')?.value;

      this.charge = true;
      this.send = false;
      this.response = new Response();

      this.salonService.updateSalon(this.id, updateDto).subscribe({
        next: (data: any) => {
          this.charge = false;
          let salon = <Salon>data;
          this.salonStateService.setSelectedSalon(salon);
          this.snackBar.open('Salon updated successfully.', 'Close', { duration: 4000 });
          this.hasChanged = false;
          this.return();
        },
        error: (error: any) => {
          let message = '';
          if (error.status == 422) {
            this.send = true;
            this.response = error.error;
          }
          if (error.error.message && error.status != 422) {
            message = error.error.message;
          }
          this.charge = false;
          this.snackBar.open('Error executing the update ' + message, 'Close', { duration: 4000 });
        }
      });
    }
  }

  getValidation(controlName: string): Validation | undefined {
    if (this.response?.validation) {
      const validation = this.response?.validation.find(val => controlName == val.attribute.split('.').pop()!.toString());
      if (validation) {
        return validation;
      }
    }
    return undefined;
  }

  return() {
    this.router.navigate([`/salons`]);
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

  toggleStatus(): void {
    const control = this.form.get('isActive');
    if (control) {
      control.setValue(!control.value);
      this.form.markAsDirty();
    }
  }

  resetForm(): void {
    this.form.reset();
    this.form.patchValue({
      capacity: 1,
      isActive: true
    });
  }
}
