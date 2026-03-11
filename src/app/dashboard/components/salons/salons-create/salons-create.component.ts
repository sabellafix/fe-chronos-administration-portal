import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Salon } from '@app/core/models/bussiness/salon';
import { Response } from '@app/core/models/dtos/response';
import { Validation } from '@app/core/models/dtos/validation';
import { SalonService } from '@app/core/services/http/salon.service';
import { SalonStateService } from '@app/core/services/shared/salon-state.service';
import { CreateSalonDto } from '@app/core/models/bussiness';

@Component({
  selector: 'app-salons-create',
  templateUrl: './salons-create.component.html',
  styleUrl: './salons-create.component.scss'
})
export class SalonsCreateComponent {
  titleComponent: string = "Create salon";
  loading: boolean = false;
  charge: boolean = false;
  send: boolean = false;
  response?: Response;
  form: FormGroup;

  constructor(
    private salonService: SalonService,
    private salonStateService: SalonStateService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = new FormGroup({
      name: new FormControl("", [Validators.required, Validators.maxLength(100)]),
      description: new FormControl("", [Validators.maxLength(500)]),
      capacity: new FormControl(1, [Validators.required, Validators.min(1)]),
      address: new FormControl("", [Validators.required, Validators.maxLength(200)]),
      city: new FormControl("", [Validators.required, Validators.maxLength(100)]),
      state: new FormControl("", [Validators.maxLength(100)]),
      country: new FormControl("", [Validators.required, Validators.maxLength(100)]),
      zipCode: new FormControl("", [Validators.maxLength(20)])
    });
  }

  ngOnInit(): void {
    this.form.patchValue({
      capacity: 1
    });
  }

  post() {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      let createDto: CreateSalonDto = new CreateSalonDto();
      createDto.name = this.form.get('name')?.value;
      createDto.description = this.form.get('description')?.value || '';
      createDto.capacity = this.form.get('capacity')?.value;
      createDto.address = this.form.get('address')?.value;
      createDto.city = this.form.get('city')?.value;
      createDto.state = this.form.get('state')?.value || '';
      createDto.country = this.form.get('country')?.value;
      createDto.zipCode = this.form.get('zipCode')?.value || '';

      this.charge = true;
      this.send = false;
      this.response = new Response();

      this.salonService.createSalon(createDto).subscribe({
        next: (data: any) => {
          let salon = <Salon>data;
          this.salonStateService.setSelectedSalon(salon);
          this.charge = false;
          this.snackBar.open('Salon created successfully.', 'Close', { duration: 4000 });
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
          this.snackBar.open('Error executing the creation ' + message, 'Close', { duration: 4000 });
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

  resetForm(): void {
    this.form.reset();
    this.form.patchValue({
      capacity: 1
    });
  }
}
