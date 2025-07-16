import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Booking } from '@app/core/models/bussiness/booking';
import { BookingStatus } from '@app/core/models/bussiness/enums';
import { DateOnly, TimeOnly } from '@app/core/models/bussiness/availability';
import { TimeUtils } from '@app/core/utils/time.utils';

@Component({
  selector: 'app-dialog-create-booking',
  template: `
    <div class="modal-header p-4">
      <h4 class="modal-title ff-primary">{{ data.title }}</h4>
    </div>
    <div class="modal-body pb-2">
      <form [formGroup]="bookingForm" class="row p-4">
        <!-- Información del Cliente -->
       
        <!-- Información del Servicio -->
        <div class="col-md-6 mb-3">
          <label class="form-label">ID Servicio *</label>
          <input type="text" class="form-control" formControlName="serviceId" placeholder="Ingrese ID del servicio">
          <div *ngIf="bookingForm.get('serviceId')?.invalid && bookingForm.get('serviceId')?.touched" class="text-danger small">
            Campo requerido
          </div>
        </div>

        <!-- Fecha de la Cita -->
        <div class="col-md-6 mb-3">
          <label class="form-label">Fecha de la Cita *</label>
          <input type="date" class="form-control" formControlName="bookingDate" [value]="defaultDate">
          <div *ngIf="bookingForm.get('bookingDate')?.invalid && bookingForm.get('bookingDate')?.touched" class="text-danger small">
            Campo requerido
          </div>
        </div>

        <!-- Hora de Inicio -->
        <div class="col-md-6 mb-3">
          <label class="form-label">Hora de Inicio *</label>
          <input type="time" class="form-control" formControlName="startTime">
          <div *ngIf="bookingForm.get('startTime')?.invalid && bookingForm.get('startTime')?.touched" class="text-danger small">
            Campo requerido
          </div>
        </div>

        <!-- Duración en Minutos -->
        <div class="col-md-6 mb-3">
          <label class="form-label">Duración (minutos) *</label>
          <input type="number" class="form-control" formControlName="durationMinutes" min="15" max="480" placeholder="60">
          <div *ngIf="bookingForm.get('durationMinutes')?.invalid && bookingForm.get('durationMinutes')?.touched" class="text-danger small">
            <span *ngIf="bookingForm.get('durationMinutes')?.errors?.['required']">Campo requerido</span>
            <span *ngIf="bookingForm.get('durationMinutes')?.errors?.['min']">Duración mínima: 15 minutos</span>
            <span *ngIf="bookingForm.get('durationMinutes')?.errors?.['max']">Duración máxima: 8 horas</span>
          </div>
        </div>

        <!-- Precio Total -->
        <div class="col-md-6 mb-3">
          <label class="form-label">Precio Total *</label>
          <div class="input-group">
            <span class="input-group-text">$</span>
            <input type="number" class="form-control" formControlName="totalPrice" min="0" step="0.01" placeholder="0.00">
          </div>
          <div *ngIf="bookingForm.get('totalPrice')?.invalid && bookingForm.get('totalPrice')?.touched" class="text-danger small">
            <span *ngIf="bookingForm.get('totalPrice')?.errors?.['required']">Campo requerido</span>
            <span *ngIf="bookingForm.get('totalPrice')?.errors?.['min']">El precio debe ser mayor a 0</span>
          </div>
        </div>

        <!-- Estado de la Cita -->
        <div class="col-md-6 mb-3">
          <label class="form-label">Estado</label>
          <select class="form-control" formControlName="status">
            <option [value]="BookingStatus.Pending">Pendiente</option>
            <option [value]="BookingStatus.Confirmed">Confirmado</option>
            <option [value]="BookingStatus.InProgress">En Progreso</option>
            <option [value]="BookingStatus.Completed">Completado</option>
            <option [value]="BookingStatus.Cancelled">Cancelado</option>
          </select>
        </div>

        <!-- Notas del Cliente -->
        <div class="col-12 mb-3">
          <label class="form-label">Notas del Cliente</label>
          <textarea class="form-control" formControlName="clientNotes" rows="2" placeholder="Notas adicionales del cliente..."></textarea>
        </div>

        <!-- Notas del Proveedor -->
        <div class="col-12 mb-3">
          <label class="form-label">Notas del Proveedor</label>
          <textarea class="form-control" formControlName="providerNotes" rows="2" placeholder="Notas internas del proveedor..."></textarea>
        </div>
      </form>
    </div>
    <div class="modal-footer p-4">
      <button type="button" (click)="onCancel()" class="btn btn-outline-secondary btn-sm w-lg waves-effect waves-light me-2">
        Cancelar
      </button>
      <button type="button" (click)="onConfirm()" [disabled]="bookingForm.invalid" class="btn btn-primary btn-sm w-lg waves-effect waves-light">
        Crear Cita
      </button>
    </div>
  `,
  styles: [`
    .modal-body {
      max-height: 70vh;
      overflow-y: auto;
      min-width: 600px;
    }
    
    .form-label {
      font-weight: 500;
      color: #495057;
      margin-bottom: 5px;
    }
    
    .form-control:focus {
      border-color: #007bff;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }
    
    .text-danger {
      font-size: 0.875em;
      margin-top: 2px;
    }
    
    @media (max-width: 768px) {
      .modal-body {
        min-width: 90vw;
        max-height: 80vh;
      }
    }
  `]
})
export class DialogCreateBookingComponent implements OnInit {
  
  bookingForm: FormGroup;
  defaultDate: string;
  BookingStatus = BookingStatus; // Para usar en el template

  constructor(
    public dialogRef: MatDialogRef<DialogCreateBookingComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { 
      title: string, 
      selectedDate?: Date,
      selectedHour?: number 
    }
  ) {
    // Configurar fecha por defecto
    this.defaultDate = this.data.selectedDate ? 
      this.data.selectedDate.toISOString().split('T')[0] : 
      new Date().toISOString().split('T')[0];

    // Inicializar formulario
    this.bookingForm = this.formBuilder.group({
      serviceId: ['', [Validators.required]],
      bookingDate: [this.defaultDate, [Validators.required]],
      startTime: [this.getDefaultTime(), [Validators.required]],
      durationMinutes: [60, [Validators.required, Validators.min(15), Validators.max(480)]],
      totalPrice: [0, [Validators.required, Validators.min(0.01)]],
      status: [BookingStatus.Pending],
      clientNotes: [''],
      providerNotes: ['']
    });
  }

  ngOnInit(): void {
    // Marcar campos como tocados para mostrar validaciones desde el inicio
    this.markFormGroupTouched();
  }

  private getDefaultTime(): string {
    if (this.data.selectedHour) {
      return `${this.data.selectedHour.toString().padStart(2, '0')}:00`;
    }
    return '09:00';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.bookingForm.controls).forEach(key => {
      const control = this.bookingForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onConfirm(): void {
    if (this.bookingForm.valid) {
      const formValue = this.bookingForm.value;
      const booking = new Booking();
      
      // Generar un ID único para la cita
      booking.id = this.generateBookingId();
      
      // Asignar valores del formulario
      booking.customerId = formValue.customerId;
      booking.supplierId = formValue.supplierId;
      booking.serviceId = formValue.serviceId;
      
      // Convertir fecha - crear instancia y asignar propiedades
      const bookingDate = new Date(formValue.bookingDate);
      booking.bookingDate = new DateOnly();
      booking.bookingDate.year = bookingDate.getFullYear();
      booking.bookingDate.month = bookingDate.getMonth() + 1;
      booking.bookingDate.day = bookingDate.getDate();
      
      // Convertir hora de inicio usando TimeUtils
      booking.startTime = TimeUtils.htmlTimeInputToTimeOnly(formValue.startTime);
      
      // Calcular hora de fin basada en la duración usando TimeUtils
      booking.endTime = TimeUtils.addMinutes(booking.startTime, formValue.durationMinutes);
      
      booking.durationMinutes = formValue.durationMinutes;
      booking.totalPrice = formValue.totalPrice;
      booking.currency = formValue.currency;
      booking.status = formValue.status;
      booking.clientNotes = formValue.clientNotes;
      booking.providerNotes = formValue.providerNotes;
      
      // Generar referencia de cita
      booking.bookingReference = this.generateBookingReference();
      
      // Establecer fechas de auditoría
      const now = new Date().toISOString();
      booking.createdAt = now;
      booking.updatedAt = now;
      
      if (booking.status === BookingStatus.Confirmed) {
        booking.confirmedAt = now;
      }
      
      this.dialogRef.close(booking);
    } else {
      this.markFormGroupTouched();
    }
  }

  private generateBookingId(): string {
    return 'BK-' + Date.now().toString() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }

  private generateBookingReference(): string {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    
    return `REF-${year}${month}${day}-${random}`;
  }
} 