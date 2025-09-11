import { Component, Input, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '@app/core/models/bussiness/user';
import { Booking } from '@app/core/models/bussiness/booking';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { Response } from '@app/core/models/dtos/response';
import { Option } from '@app/core/models/interfaces/option.interface';
import { ParametricService } from '@app/core/services/shared/parametric.service';
import { UserService } from '@app/core/services/http/user.service';
import { BookingService } from '@app/core/services/http/booking.service';
import { Service } from '@app/core/models/bussiness/service';
import { ServiceService } from '@app/core/services/http/platform-service.service';

import { Validation } from '@app/core/models/dtos/validation';

@Component({
  selector: 'app-users-detail',
  templateUrl: './users-detail.component.html',
  styleUrl: './users-detail.component.scss'
})
export class UsersDetailComponent implements OnDestroy {

  titleComponent: string = "Stylist Details";
  loading: boolean = true;
  charge: boolean = false;
  hasChanged : boolean = false;
  pagination: Pagination = { offset: 0, limit: 100, items: 0, filters: ``, sort: 'id,desc' };
  send: boolean = false;
  response? : Response;
  form: FormGroup; 
  id: string = "";
  user: User = new User();
  srcImage: string = "assets/images/user-image.jpg";
  now : Date = new Date();
  roles: any[] = [];
  loadingRoles: boolean = false;
  codephones : Option[] = [];
  country? : Option;
  services: Service[] = [];
  loadingServices: boolean = false;
  
  // Propiedades para el filtro de fechas y bookings
  dateRangeForm: FormGroup;
  filteredBookings: Booking[] = [];
  loadingBookings: boolean = false;
  maxDate: string = '';
  activeStartDate: string = '';
  activeEndDate: string = '';
  private filterTimeout: any;

  constructor(private userService: UserService,
              private parametricService: ParametricService,
              private router: Router,
              private snackBar: MatSnackBar,
              private route: ActivatedRoute,
              private serviceService: ServiceService,
              private bookingService: BookingService,
  ){
    this.form = new FormGroup({
      firstName : new FormControl("", Validators.required),
      lastName : new FormControl("", Validators.required),
      email : new FormControl("", [Validators.required, Validators.email]),
      phone : new FormControl("", [Validators.required, Validators.pattern(/^\d{9}$/)]),
      userRole : new FormControl("", Validators.required),
    });

    // Inicializar formulario de filtro de fechas
    this.dateRangeForm = new FormGroup({
      startDate: new FormControl(''),
      endDate: new FormControl('')
    });

    // Establecer fecha máxima (hoy)
    this.maxDate = new Date().toISOString().split('T')[0];

    this.route.params.subscribe(params => { if (params['id']) this.id = params['id'] });

    this.form.valueChanges.subscribe(() => {
      this.hasChanged = Object.values(this.form.controls).some(control => control.dirty);
    });
  }

  ngOnInit(): void {
   
    this.loading = true;
    this.country = { id : "52", name : "Colombia", code: "+57"}
    this.load();
    
    this.roles = [
      { id: 1, name: 'Stylist', code: 'stylist' },
      { id: 2, name: 'Admin', code: 'admin' }
    ];
    
  }

  ngOnDestroy(): void {
    // Limpiar timeout para evitar memory leaks
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }
  }

  load(): void{
    if(this.id) {
      this.loading = true;
      this.userService.get(this.id).subscribe({
        next: (data: any) => {      
          this.user = <User>data;
          if(this.user.photo) {
            this.srcImage = this.user.photo;
          }
          this.setForm();
          this.loadUserServices();
        },error: (error: any) => {
          this.loading = false;
          this.snackBar.open('Error loading the user', 'Cerrar', {duration: 4000});
        }
      });
    }
  }

  async setForm(){
    if(this.user){
      let object : Object = {
        firstName : this.user.firstName,
        lastName : this.user.lastName,
        email : this.user.email,
        phone : this.user.phone,
        userRole : this.user.userRole,
      };
      this.form.setValue(object);
      this.form.disable();
    }
    this.loading = false;
  }

  getValidation(controlName: string): Validation | undefined{
    if(this.response?.validation){
      const validation = this.response?.validation.find(val => controlName == val.attribute.split('.').pop()!.toString());
      if(validation){
        return validation;
      }
    }
    return undefined;
  }

  update(){
    this.router.navigate([`/users/${this.id}/update`]);
  }

  availability(){
    this.router.navigate([`/users/${this.id}/availability`]);
  }

  return(){
    this.router.navigate([`/users`]);
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

  asignAutoComplete(option: Option, controlName: string){
    this.form.get(controlName)?.setValue(option.code!);
  }

  getUserStatus(user: User): string {
    if (user.isDeleted) return 'Deleted';
    if (!user.isActive) return 'Inactive';
    if (!user.isVerified) return 'Not verified';
    return 'Active';
  }

  getUserStatusClass(user: User): string {
    if (user.isDeleted) return 'badge-danger';
    if (!user.isActive) return 'badge-warning';
    if (!user.isVerified) return 'badge-info';
    return 'badge-success';
  }

  getUserTypes(): Option[] {
    return [
      { name: 'Stylist', code: 'stylist' },
      { name: 'Admin', code: 'admin' }
    ];
  }

  getRoleName(code: string): string {
    const role = this.roles.find(r => r.code === code);
    return role ? role.name : code;
  }

  loadUserServices(): void {
    if (this.user.id) {
      this.loadingServices = true;
      this.serviceService.getServicesByProvider(this.user.id).subscribe({
        next: (data: Service[]) => {
          this.services = data;
          this.loadingServices = false;
        },
        error: (error: any) => {
          this.loadingServices = false;
          this.snackBar.open('Error loading services', 'Cerrar', {duration: 4000});
        }
      });
    }
  }

  getServiceColor(serviceId: string): string {
    const service = this.services.find(s => s.id === serviceId);
    return service ? service.color + ' !important' : '#e9ecef';
  }

  getServiceName(serviceId: string): string {
    const service = this.services.find(s => s.id === serviceId);
    return service?.serviceName || 'Unknown Service';
  }

  getServiceDuration(serviceId: string): number {
    const service = this.services.find(s => s.id === serviceId);
    return service?.durationMinutes || 0;
  }

  getServicePrice(serviceId: string): number {
    const service = this.services.find(s => s.id === serviceId);
    return service?.price || 0;
  }

  getServiceStatus(service: Service): string {
    return service.isActive ? 'Active' : 'Inactive';
  }

  getServiceStatusClass(service: Service): string {
    return service.isActive ? 'badge-success' : 'badge-secondary';
  }

  // Métodos para el filtro de fechas y bookings
  isValidDateRange(): boolean {
    const startDate = this.dateRangeForm.get('startDate')?.value;
    const endDate = this.dateRangeForm.get('endDate')?.value;
    
    if (!startDate && !endDate) {
      return true; // Sin filtro es válido
    }
    
    if (startDate && endDate) {
      return new Date(startDate) <= new Date(endDate);
    }
    
    return true; // Una sola fecha es válida
  }

  onDateChange(): void {
    // Limpiar timeout anterior para implementar debounce
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }
    
    // Aplicar filtro después de un pequeño delay
    this.filterTimeout = setTimeout(() => {
      this.applyDateFilter();
    }, 500);
  }

  applyDateFilter(): void {
    const startDate = this.dateRangeForm.get('startDate')?.value;
    const endDate = this.dateRangeForm.get('endDate')?.value;

    // Si no hay fechas, limpiar el filtro
    if (!startDate && !endDate) {
      this.filteredBookings = [];
      this.activeStartDate = '';
      this.activeEndDate = '';
      return;
    }

    // Validar rango solo si ambas fechas están presentes
    if (startDate && endDate && !this.isValidDateRange()) {
      // No mostrar snackbar para evitar spam, solo no aplicar filtro
      return;
    }

    this.loadingBookings = true;

    // Preparar fechas para el servicio
    const startDateObj = startDate ? new Date(startDate) : undefined;
    const endDateObj = endDate ? new Date(endDate) : undefined;

    this.bookingService.getByUserDateRange(this.id, startDateObj, endDateObj).subscribe({
      next: (data: Booking[]) => {
        this.filteredBookings = data;
        this.activeStartDate = startDate || '';
        this.activeEndDate = endDate || '';
        this.loadingBookings = false;
        
        // Solo mostrar mensaje si hay al menos una fecha seleccionada
        if (startDate || endDate) {
          // this.snackBar.open(`${data.length} booking(s) encontrados`, 'Cerrar', {duration: 2000});
        }
      },
      error: (error: any) => {
        this.loadingBookings = false;
        // this.snackBar.open('Error al filtrar bookings', 'Cerrar', {duration: 4000});
        console.error('Error filtering bookings:', error);
      }
    });
  }

  clearDateFilter(): void {
    this.dateRangeForm.reset();
    this.filteredBookings = [];
    this.activeStartDate = '';
    this.activeEndDate = '';
    this.snackBar.open('Filtro removido', 'Cerrar', {duration: 2000});
  }

  hasActiveFilter(): boolean {
    return this.activeStartDate !== '' || this.activeEndDate !== '';
  }

  getFilterDescription(): string {
    if (this.activeStartDate && this.activeEndDate) {
      return `${this.formatDateForDisplay(this.activeStartDate)} - ${this.formatDateForDisplay(this.activeEndDate)}`;
    } else if (this.activeStartDate) {
      return `Desde ${this.formatDateForDisplay(this.activeStartDate)}`;
    } else if (this.activeEndDate) {
      return `Hasta ${this.formatDateForDisplay(this.activeEndDate)}`;
    }
    return '';
  }

  private formatDateForService(dateString: string): string {
    // Convierte fecha del input (YYYY-MM-DD) al formato requerido por el servicio
    const date = new Date(dateString);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  }

  private formatDateForDisplay(serviceDate: string): string {
    // Convierte fecha del servicio (YYYY/M/D) a formato de visualización
    const parts = serviceDate.split('/');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      return `${day}/${month}/${year}`;
    }
    return serviceDate;
  }

}
