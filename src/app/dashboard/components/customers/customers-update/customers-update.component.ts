import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Customer } from '@app/core/models/bussiness/customer';
import { Service } from '@app/core/models/bussiness/service';
import { ServiceModifier } from '@app/core/models/bussiness/service-modifier';
import { CustomerService } from '@app/core/services/http/customer.service';
import { ServiceService } from '@app/core/services/http/platform-service.service';
import { Response } from '@app/core/models/dtos/response';
import { Validation } from '@app/core/models/dtos/validation';

@Component({
  selector: 'app-customers-update',
  templateUrl: './customers-update.component.html',
  styleUrl: './customers-update.component.scss'
})
export class CustomersUpdateComponent implements OnInit {
  titleComponent: string = "Update Customer";
  loading: boolean = false;
  charge: boolean = false;
  send: boolean = false;
  response? : Response;
  form: FormGroup; 
  now : Date = new Date();
  customerId: string = '';
  customer?: Customer;
  services: Service[] = [];
  loadingServices: boolean = false;
  showCreateServiceForm: boolean = false;

  languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'pt', label: 'Portuguese' }
  ];

  constructor(private customerService: CustomerService,
              private serviceService: ServiceService,
              private router: Router,
              private route: ActivatedRoute,
              private snackBar: MatSnackBar,
              private cdr: ChangeDetectorRef
  ){
    this.form = new FormGroup({
      firstName : new FormControl(""),
      lastName : new FormControl(""),
      phoneNumber : new FormControl(""),
      email : new FormControl("", [Validators.email, Validators.maxLength(500)]),
      preferredLanguage : new FormControl("EN"),
      notes : new FormControl(""),
      isActive : new FormControl(true),
      serviceModifiers: new FormArray([])
    });
  }

  ngOnInit(): void {
    this.customerId = this.route.snapshot.paramMap.get('id')!;
    this.loadCustomer();
    this.loadServices();
  }

  loadCustomer(): void {
    this.loading = true;
    this.customerService.getCustomer(this.customerId).subscribe({
      next: (customer: Customer) => {
        this.customer = customer;
        this.form.patchValue({
          firstName: customer.firstName,
          lastName: customer.lastName,
          phoneNumber: customer.phoneNumber,
          email: customer.email,
          preferredLanguage: customer.preferredLanguage || 'EN',
          notes: customer.notes,
          isActive: customer.isActive
        });
        
        if (customer.serviceModifiers && customer.serviceModifiers.length > 0) {
          const serviceModifiersArray = this.form.get('serviceModifiers') as FormArray;
          customer.serviceModifiers.forEach(modifier => {
            serviceModifiersArray.push(this.createServiceModifierFormGroup(modifier));
          });
        }
        
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Error loading customer data', 'Close', {duration: 4000});
        this.loading = false;
      }
    });
  }

  loadServices(): void {
    this.loadingServices = true;
    this.serviceService.getAllServices().subscribe({
      next: (services: Service[]) => {
        this.services = services.filter(service => service.isActive);
        this.loadingServices = false;
      },
      error: (error) => {
        this.snackBar.open('Error loading services', 'Close', {duration: 4000});
        this.loadingServices = false;
      }
    });
  }

  post(){
    this.form.markAllAsTouched();
    if( this.form.valid){
      const serviceModifiersArray = this.form.get('serviceModifiers') as FormArray;
      const serviceModifiers = serviceModifiersArray.controls.map(control => {
        const modifier = new ServiceModifier();
        modifier.customerId = this.customerId;
        modifier.serviceId = control.get('serviceId')?.value;
        modifier.modifiedDurationInMinutes = control.get('modifiedDurationInMinutes')?.value;
        modifier.modifiedPrice = control.get('modifiedPrice')?.value;
        modifier.customer = null;
        modifier.service = null;
        return modifier;
      });

      let updateCustomerDto = {
        firstName : this.form.get('firstName')?.value || null,
        lastName : this.form.get('lastName')?.value || null,
        phoneNumber : this.form.get('phoneNumber')?.value || null,
        email : this.form.get('email')?.value || null,
        preferredLanguage : this.form.get('preferredLanguage')?.value || null,
        notes : this.form.get('notes')?.value || null,
        isActive : this.form.get('isActive')?.value,
        serviceModifiers: serviceModifiers.length > 0 ? serviceModifiers : undefined
      }
      
      this.charge = true;
      this.send = false;
      this.response = new Response();
      this.customerService.updateCustomer(this.customerId, updateCustomerDto).subscribe({
        next: (data: any) => {
          let customer = <Customer>data;          
          this.charge = false;
          this.snackBar.open('Customer updated successfully.', 'Close', {duration: 4000});
          this.return();
        },
        error: (error: any) =>{
          let message = '';
          if(error.status == 422){
            this.send = true;
            this.response = error.error;
          }
          if(error.error.message && error.status != 422){
            message = error.error.message;
          }
          this.charge = false;
          this.snackBar.open('Error executing the update ' + message, 'Close', {duration: 4000});
        }
      });
    }
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

  return(){
    this.router.navigate([`/customers`]);
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
      preferredLanguage: "EN",
      isActive: true
    });
    const serviceModifiersArray = this.form.get('serviceModifiers') as FormArray;
    serviceModifiersArray.clear();
  }

  getLanguageLabel(value: string): string {
    const option = this.languageOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  }

  get serviceModifiersArray(): FormArray {
    return this.form.get('serviceModifiers') as FormArray;
  }

  createServiceModifierFormGroup(modifier?: ServiceModifier): FormGroup {
    return new FormGroup({
      serviceId: new FormControl(modifier?.serviceId || '', Validators.required),
      modifiedDurationInMinutes: new FormControl(modifier?.modifiedDurationInMinutes || 0, [Validators.required, Validators.min(1)]),
      modifiedPrice: new FormControl(modifier?.modifiedPrice || 0, [Validators.required, Validators.min(1)])
    });
  }

  addServiceModifier(): void {
    const serviceModifiersArray = this.form.get('serviceModifiers') as FormArray;
    serviceModifiersArray.push(this.createServiceModifierFormGroup());
    this.showCreateServiceForm =  true;
    this.refreshServiceDropdowns();
  }

  removeServiceModifier(index: number): void {
    const serviceModifiersArray = this.form.get('serviceModifiers') as FormArray;
    serviceModifiersArray.removeAt(index);
    this.showCreateServiceForm = false;
    this.refreshServiceDropdowns();
  }

  private refreshServiceDropdowns(): void {
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  getServiceName(serviceId: string): string {
    const service = this.services.find(s => s.id === serviceId);
    return service ? service.serviceName || 'Unknown Service' : 'Unknown Service';
  }

  getServiceDuration(serviceId: string): number {
    const service = this.services.find(s => s.id === serviceId);
    return service ? service.durationMinutes : 0;
  }

  getServicePrice(serviceId: string): number {
    const service = this.services.find(s => s.id === serviceId);
    return service ? service.price : 0;
  }

  getServiceColor(serviceId: string): string {
    const service = this.services.find(s => s.id === serviceId);
    return service ? service.color + ' !important' : '#e9ecef';
  }

  getAvailableServices(currentIndex: number): Service[] {
    const serviceModifiersArray = this.form.get('serviceModifiers') as FormArray;
    const selectedServiceIds: string[] = [];
    
    serviceModifiersArray.controls.forEach((control, index) => {
      if (index !== currentIndex) {
        const serviceId = control.get('serviceId')?.value;
        if (serviceId && serviceId.trim() !== '') {
          selectedServiceIds.push(serviceId);
        }
      }
    });
    
    const availableServices = this.services.filter(service => !selectedServiceIds.includes(service.id));
    
    const currentServiceId = serviceModifiersArray.at(currentIndex)?.get('serviceId')?.value;
    if (currentServiceId && currentServiceId.trim() !== '') {
      const currentService = this.services.find(s => s.id === currentServiceId);
      if (currentService && !availableServices.find(s => s.id === currentServiceId)) {
        availableServices.unshift(currentService);
      }
    }
    
    return availableServices;
  }

  onServiceChange(index: number, selectedServiceId: any): void {
    const serviceModifiersArray = this.form.get('serviceModifiers') as FormArray;
    const currentControl = serviceModifiersArray.at(index);
    
    if (selectedServiceId && selectedServiceId.trim() !== '') {
      const selectedService = this.services.find(s => s.id === selectedServiceId);
      if (selectedService) {
        currentControl.patchValue({
          modifiedDurationInMinutes: selectedService.durationMinutes,
          modifiedPrice: selectedService.price
        });
      }
    }
    
    this.refreshServiceDropdowns();
  }

  toggleCustomerStatus(): void {
    const control = this.form.get('isActive');
    if (control) {
      control.setValue(!control.value);
      this.form.markAsDirty();
    }
  }

  setCreateServiceForm(): void {
    this.showCreateServiceForm = true;
  }

  cancelServiceForm(): void {
    this.showCreateServiceForm = false;
  }

}
