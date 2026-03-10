import { Component, Input, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '@app/core/models/bussiness/user';
import { Booking } from '@app/core/models/bussiness/booking';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { Response } from '@app/core/models/dtos/response';
import { Option, VisualOption } from '@app/core/models/interfaces/option.interface';
import { ParametricService } from '@app/core/services/shared/parametric.service';
import { UserService } from '@app/core/services/http/user.service';
import { BookingService } from '@app/core/services/http/booking.service';
import { Service } from '@app/core/models/bussiness/service';
import { ServiceService } from '@app/core/services/http/platform-service.service';

import { Validation } from '@app/core/models/dtos/validation';
import { RolService } from '@app/core/services/http/rol.service';
import { Rol } from '@app/core/models/bussiness/rol';

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
  showBadgesServices: boolean = false;
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
  servicesOptions: VisualOption[] = [];
  filteredServices: Service[] = [];
  loadingServices: boolean = false;
  
  dateRangeForm: FormGroup;
  startDateControl: FormControl = new FormControl('');
  endDateControl: FormControl = new FormControl('');
  allBookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  selectedServiceIds: string[] = [];
  loadingBookings: boolean = false;
  maxDate: string = '';
  activeStartDate: string = '';
  activeEndDate: string = '';
  private filterTimeout: any;

  totalRevenue: number = 0;
  totalBookingsCount: number = 0;
  uniqueCustomersCount: number = 0;

  constructor(private userService: UserService,
              private parametricService: ParametricService,
              private router: Router,
              private snackBar: MatSnackBar,
              private route: ActivatedRoute,
              private serviceService: ServiceService,
              private bookingService: BookingService,
              private rolService: RolService,
  ){
    this.form = new FormGroup({
      firstName : new FormControl("", Validators.required),
      lastName : new FormControl("", Validators.required),
      email : new FormControl("", [Validators.required, Validators.email]),
      phone : new FormControl("", [Validators.required, Validators.pattern(/^\d{9}$/)]),
      userRole : new FormControl("", Validators.required),
    });

    this.dateRangeForm = new FormGroup({
      startDate: this.startDateControl,
      endDate: this.endDateControl
    });

    this.maxDate = new Date().toISOString().split('T')[0];
    
    this.initializeDateFilters();

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
          this.loadRole();
        },error: (error: any) => {
          this.loading = false;
          this.snackBar.open('Error loading the user', 'Cerrar', {duration: 4000});
        }
      });
    }
  }

  loadRole(){
    this.rolService.getRol(this.user.roleId).subscribe({
      next: (response: Rol) => {
        this.user.role = response;
        if(this.user.photo) {
          this.srcImage = this.user.photo;
        }
        this.setForm();
        this.loadUserServices();
      },
      error: (error: any) => {
        this.loading = false;
        this.snackBar.open('Error loading the role', 'Cerrar', {duration: 4000});
      }
    });
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

  loadUserServices(): void {
    if (this.user.id) {
      this.loadingServices = true;
      this.serviceService.getServicesByProvider(this.user.id).subscribe({
        next: (data: Service[]) => {
          this.services = data;
          this.filteredServices = [...data];
          this.loadingServices = false;
          this.servicesOptions = this.services.map(service => ({ id: service.id, name: service.serviceName || '', color: service.color || undefined }));
          this.loadBookings();
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

  private initializeDateFilters(): void {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    this.startDateControl.setValue(this.formatDateForInput(startOfMonth));
    this.endDateControl.setValue(this.formatDateForInput(endOfMonth));
  }
  
  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getMaxStartDate(): string {
    return this.endDateControl.value || this.maxDate;
  }
  
  getMinEndDate(): string {
    return this.startDateControl.value ?? '';
  }

  isValidDateRange(): boolean {
    const startDate = this.startDateControl.value;
    const endDate = this.endDateControl.value;
    
    if (!startDate && !endDate) {
      return true;
    }
    
    if (startDate && endDate) {
      return new Date(startDate) <= new Date(endDate);
    }
    
    return true;
  }

  onDateChange(): void {
    const startDate = this.startDateControl.value;
    const endDate = this.endDateControl.value;
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start > end) {
        this.endDateControl.setValue(startDate);
      }
    }
  }

  applyDateFilter(): void {
    const startDate = this.startDateControl.value;
    const endDate = this.endDateControl.value;

    if (!startDate || !endDate) {
      return;
    }

    if (!this.isValidDateRange()) {
      return;
    }

    this.activeStartDate = startDate;
    this.activeEndDate = endDate;
    this.loadBookings();
  }

  clearDateFilter(): void {
    this.initializeDateFilters();
    this.activeStartDate = '';
    this.activeEndDate = '';
    this.selectedServiceIds = [];
    this.loadBookings();
    this.snackBar.open('Filtro reiniciado', 'Cerrar', {duration: 2000});
  }

  hasActiveFilter(): boolean {
    return this.activeStartDate !== '' || this.activeEndDate !== '';
  }

  private addOneDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    return newDate;
  }

  loadBookings(): void {
    const startDate = this.startDateControl.value;
    const endDate = this.endDateControl.value;

    if (!startDate || !endDate) {
      this.allBookings = [];
      this.filteredBookings = [];
      this.calculateMetrics([]);
      return;
    }

    this.loadingBookings = true;

    const startDateObj = this.addOneDay(new Date(startDate));
    const endDateObj = this.addOneDay(new Date(endDate));

    this.bookingService.getByUserDateRange(this.id, startDateObj, endDateObj).subscribe({
      next: (data: Booking[]) => {
        this.allBookings = data;
        this.loadingBookings = false;
        this.applyServiceFilter();
      },
      error: (error: any) => {
        this.loadingBookings = false;
        this.allBookings = [];
        this.filteredBookings = [];
        this.snackBar.open('Error retrieving bookings', 'Cerrar', { duration: 4000 });
        this.calculateMetrics([]);
      }
    });
  }

  private calculateMetrics(bookings: Booking[]): void {
    this.totalRevenue = bookings.reduce((total, booking) => {
      return total + (booking.totalPrice || 0);
    }, 0);
    
    this.totalBookingsCount = bookings.length;

    const uniqueCustomerIds = new Set<string>();
    bookings.forEach(booking => {
      if (booking.customerId) {
        uniqueCustomerIds.add(booking.customerId);
      }
    });
    this.uniqueCustomersCount = uniqueCustomerIds.size;
  }


  onServiceSelectionChange(selectedServices: VisualOption[]): void {
    // console.log("selectedServices", selectedServices);
    this.selectedServiceIds = selectedServices
      .map(service => service.id)
      .filter((id): id is string => id !== undefined);
      console.log("selectedServiceIds", this.selectedServiceIds);
    this.applyServiceFilter();
  }

  private applyServiceFilter(): void {
    if (this.selectedServiceIds.length == 0) {
      this.filteredBookings = [...this.allBookings];
    } else {
      this.filteredBookings = this.allBookings.filter(booking => 
        booking.services?.some(service => this.selectedServiceIds.includes(service.id))
      );
    }
    this.calculateMetrics(this.filteredBookings);
  }

}
