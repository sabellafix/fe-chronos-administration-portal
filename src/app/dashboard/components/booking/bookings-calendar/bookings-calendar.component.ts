import { Component, OnInit, OnDestroy } from '@angular/core';
import { Customer, Service, User } from '@app/core/models/bussiness';
import { BookingService } from '@app/core/services/http/booking.service';
import { CompanyService } from '@app/core/services/http/company.service';
import { CustomerService } from '@app/core/services/http/customer.service';
import { ServiceService } from '@app/core/services/http/platform-service.service';
import { UserService } from '@app/core/services/http/user.service';
import { VisualOption } from '@app/core/models/interfaces/option.interface';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-bookings-calendar',
  templateUrl: './bookings-calendar.component.html',
  styleUrl: './bookings-calendar.component.scss'
})
export class BookingsCalendarComponent implements OnInit, OnDestroy {

  tabs: string[] = ['Month', 'Week', 'Day', 'Stylists', 'Floor'];
  tabActive: string = 'Month';
  tabIndex: number = 1;
  dateNow: Date = new Date();
  loading: boolean = false;

  dateCalendarDaily: Date = new Date();
  dateCalendarWeekly: Date = new Date();
  dateCalendarMonthly: Date = new Date();
  dateBookingsSupplier: Date = new Date();

  services: Service[] = [];
  stylists: User[] = [];
  customers: Customer[] = [];

  // Opciones para el nuevo componente SelectImageComponent
  serviceOptions: VisualOption[] = [];
  stylistOptions: VisualOption[] = [];
  customerOptions: VisualOption[] = [];

  serviceSelected: Service = new Service();
  stylistSelected: User = new User();
  customerSelected: Customer = new Customer();

  constructor(
    private bookingService: BookingService,
    private companyService: CompanyService,
    private userService: UserService,
    private customerService: CustomerService,
    private serviceService: ServiceService, 
  ) {
    this.loadData();
  }
  
  private scrollListener?: () => void;

  ngOnInit(): void {
    this.initStickyHeader();
  }

  ngOnDestroy(): void {
    if (this.scrollListener) {
      window.removeEventListener("scroll", this.scrollListener);
    }
  }

  private initStickyHeader(): void {
    const calendarHeader = document.getElementById("calendar-header");
    if (calendarHeader) {
      this.scrollListener = () => {
        const scrollPosition = window.scrollY;
        if (scrollPosition >= 30) {
          calendarHeader.classList.add("sticky");
        } else {
          calendarHeader.classList.remove("sticky");
        }
      };
      
      window.addEventListener("scroll", this.scrollListener);
    }
  }

  loadData(): void {
    this.loading = true;
    forkJoin([
      this.serviceService.getServices(),
      this.userService.getUsers(),
      this.customerService.getCustomers()
    ]).subscribe(([services, stylists, customers]) => {
      this.services = services;
      this.stylists = stylists;
      this.customers = customers;
      
      // Convertir los datos a VisualOption para el nuevo componente
      this.prepareSelectOptions();
      
      this.loading = false;
    }, error => {
      console.error('Error to load data:', error);
    }, () => {
      this.loading = false;
    });
  }

  private prepareSelectOptions(): void {
    // Convertir servicios a VisualOption
    this.serviceOptions = this.services.map(service => ({
      id: service.id,
      name: service.serviceName || '',
      code: service.id,
      color: service.color || undefined,
      selected: false
    }));

    // Convertir stylists a VisualOption (puedes agregar imageUrl si tienes fotos de usuarios)
    this.stylistOptions = this.stylists.map(stylist => ({
      id: stylist.id,
      name: `${stylist.firstName} ${stylist.lastName}`,
      code: stylist.id,
      // imageUrl: stylist.profileImage, // Si tienes imagen de perfil
      selected: false
    }));

    // Convertir customers a VisualOption
    this.customerOptions = this.customers.map(customer => ({
      id: customer.id,
      name: `${customer.firstName} ${customer.lastName}`,
      code: customer.id,
      selected: false
    }));
  }

  // Método para manejar la selección de servicios con el nuevo componente
  onServiceSelectionChange(selectedServices: VisualOption[]): void {
    if (selectedServices.length === 1) {
      this.serviceSelected = this.services.find(service => service.id === selectedServices[0].id) || new Service();
    } else {
      this.serviceSelected = new Service(); // Reset si múltiples o ninguno seleccionado
    }
    console.log('Servicios seleccionados:', selectedServices);
  }

  // Método para manejar selección única de servicio
  onSingleServiceSelectionChange(selectedService: VisualOption): void {
    this.serviceSelected = this.services.find(service => service.id === selectedService.id) || new Service();
    console.log('Servicio seleccionado:', selectedService);
  }

  // Métodos existentes (mantenidos para compatibilidad)
  onChangeService(event: any): void {
    this.serviceSelected = this.services.find(service => service.id === event.target.value) || new Service();
  }

  onChangeStylist(event: any): void {
    this.stylistSelected = this.stylists.find(stylist => stylist.id === event.target.value) || new User();
  }

  onChangeCustomer(event: any): void {
    this.customerSelected = this.customers.find(customer => customer.id === event.target.value) || new Customer();
  }
  

  onTabChanged(tab: string): void {
    this.tabActive = tab;
    this.tabIndex = this.tabs.indexOf(tab);
  } 


  changeDateCalendarMonthly(isLeft: boolean): void {
    if(isLeft){
      this.dateCalendarMonthly = new Date(this.dateCalendarMonthly.setMonth(this.dateCalendarMonthly.getMonth() - 1));
    }else{
      this.dateCalendarMonthly = new Date(this.dateCalendarMonthly.setMonth(this.dateCalendarMonthly.getMonth() + 1));
    }
   }

   setTodayDateCalendarMonthly(): void {
    this.dateCalendarMonthly = new Date();
   }

  changeDateCalendarWeekly(isLeft: boolean): void {
    if(isLeft){
      this.dateCalendarWeekly = new Date(this.dateCalendarWeekly.setDate(this.dateCalendarWeekly.getDate() - 7));
    }else{
      this.dateCalendarWeekly = new Date(this.dateCalendarWeekly.setDate(this.dateCalendarWeekly.getDate() + 7));
    }
   }

   setTodayDateCalendarWeekly(): void {
    this.dateCalendarWeekly = new Date();
   }


   changeDateCalendarDaily(isLeft: boolean): void {
    if(isLeft){
      this.dateCalendarDaily = new Date(this.dateCalendarDaily.setDate(this.dateCalendarDaily.getDate() - 1));
    }else{
      this.dateCalendarDaily = new Date(this.dateCalendarDaily.setDate(this.dateCalendarDaily.getDate() + 1));
    }
   }  

   setTodayDateCalendarDaily(): void {
    this.dateCalendarDaily = new Date();
   }


   changeDateBookingsSupplier(isLeft: boolean): void {
    if(isLeft){
      this.dateBookingsSupplier = new Date(this.dateBookingsSupplier.setDate(this.dateBookingsSupplier.getDate() - 1));
    }else{
      this.dateBookingsSupplier = new Date(this.dateBookingsSupplier.setDate(this.dateBookingsSupplier.getDate() + 1));
    }
   }
   
   setTodayDateBookingsSupplier(): void {
    this.dateBookingsSupplier = new Date();
   }
}
