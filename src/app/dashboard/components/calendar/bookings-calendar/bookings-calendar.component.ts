import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Customer, Service, User } from '@app/core/models/bussiness';
import { CustomerService } from '@app/core/services/http/customer.service';
import { ServiceService } from '@app/core/services/http/platform-service.service';
import { UserService } from '@app/core/services/http/user.service';
import { SalonService } from '@app/core/services/http/salon.service';
import { VisualOption } from '@app/core/models/interfaces/option.interface';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { RolesConst } from '@app/core/models/constants/roles.const';
import { AuthService } from '@app/core/services/http/auth.service';
import { Permission } from '@app/core/models/bussiness/permission';
import { DashboardFiltersService } from '@app/core/services/shared/dashboard-filters.service';

@Component({
  selector: 'app-bookings-calendar',
  templateUrl: './bookings-calendar.component.html',
  styleUrl: './bookings-calendar.component.scss'
})
export class BookingsCalendarComponent implements OnInit, OnDestroy {

  tabs: string[] = ['Month', 'Week', 'Day', 'Stylists'];
  tabActive: string = 'Month';
  tabIndex: number = 0;
  
  private viewToTabMap: { [key: string]: string } = {
    'month': 'Month',
    'week': 'Week',
    'day': 'Day',
    'stylists': 'Stylists'
  };
  
  private tabToViewMap: { [key: string]: string } = {
    'Month': 'month',
    'Week': 'week',
    'Day': 'day',
    'Stylists': 'stylists'
  };
  dateNow: Date = new Date();
  loading: boolean = false;
  imageUser: string = "../assets/images/user-image.jpg";

  dateCalendarDaily: Date = new Date();
  dateCalendarWeekly: Date = new Date();
  dateCalendarMonthly: Date = new Date();
  dateBookingsSupplier: Date = new Date();

  services: Service[] = [];
  stylists: User[] = [];
  users: User[] = [];
  customers: Customer[] = [];
  
  serviceOptions: VisualOption[] = [];
  stylistOptions: VisualOption[] = [];
  customerOptions: VisualOption[] = [];

  serviceSelected: Service = new Service();
  stylistSelected: User = new User();
  customerSelected: Customer = new Customer();

  servicesSelected: Service[] = [];
  stylistsSelected: User[] = [];
  customersSelected: Customer[] = [];

  user: User | null = null;
  permissions: Permission[] = [];
  selectedSalonId: string | null = null;
  
  private destroy$: Subject<void> = new Subject<void>();

  constructor(
    private userService: UserService,
    private customerService: CustomerService,
    private serviceService: ServiceService, 
    private authService: AuthService,
    private dashboardFiltersService: DashboardFiltersService,
    private salonService: SalonService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.user = this.authService.getUserLogged();
    this.permissions = this.authService.getPermissionsLogged();
    this.loadData();
  }
  
  private scrollListener?: () => void;

  ngOnInit(): void {
    this.initStickyHeader();
    this.subscribeToSalonChanges();
    this.subscribeToQueryParams();
  }
  
  private subscribeToQueryParams(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const view = params['view'];
        if (view && this.viewToTabMap[view]) {
          this.tabActive = this.viewToTabMap[view];
          this.tabIndex = this.tabs.indexOf(this.tabActive);
        } else {
          this.setDefaultTab();
        }
      });
  }
  
  private setDefaultTab(): void {
    this.tabActive = 'Month';
    this.tabIndex = 0;
  }

  ngOnDestroy(): void {
    if (this.scrollListener) {
      window.removeEventListener("scroll", this.scrollListener);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToSalonChanges(): void {
    this.dashboardFiltersService.selectedSalon$
      .pipe(takeUntil(this.destroy$))
      .subscribe(salon => {
        this.selectedSalonId = salon?.id ?? null;
        this.resetFiltersOnSalonChange();
        this.loadStylistsBySalon();
      });
  }

  private resetFiltersOnSalonChange(): void {
    this.serviceSelected = new Service();
    this.stylistSelected = new User();
    this.servicesSelected = [];
    this.stylistsSelected = [];
  }

  private loadStylistsBySalon(): void {
    if (!this.selectedSalonId) {
      this.stylists = [];
      this.users = [];
      this.prepareStylistOptions();
      return;
    }

    this.salonService.getUsersBySalon(this.selectedSalonId, RolesConst._STYLIST)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stylists) => {
          this.stylists = stylists.filter(s => s.isActive);
          this.users = this.stylists;
          
          this.stylists.forEach(stylist => {
            if (!stylist.photo) {
              stylist.photo = this.imageUser;
            }
          });
          
          this.prepareStylistOptions();
        },
        error: (error) => {
          console.error('Error loading stylists by salon:', error);
        }
      });
  }

  private prepareStylistOptions(): void {
    this.stylistOptions = this.stylists.map(stylist => ({
      id: stylist.id,
      name: `${stylist.firstName} ${stylist.lastName}`,
      code: stylist.id,
      imageUrl: stylist.photo,
      selected: false
    }));
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
      this.serviceService.getAllServices(),
      this.customerService.getAllCustomers()
    ]).subscribe(([services, customers]) => {
      this.services = services;
      this.customers = customers;
      
      this.prepareSelectOptions();
      
      this.loading = false;
    }, error => {
      console.error('Error to load data:', error);
    }, () => {
      this.loading = false;
    });
  }

  private prepareSelectOptions(): void {
    this.serviceOptions = this.services.map(service => ({
      id: service.id,
      name: service.serviceName || '',
      code: service.id,
      color: service.color || undefined,
      selected: false
    }));

    this.prepareStylistOptions();

    this.customerOptions = this.customers.map(customer => ({
      id: customer.id,
      name: `${customer.firstName} ${customer.lastName}`,
      code: customer.id,
      selected: false
    }));
  }

  onServiceSelectionChange(selectedServices: VisualOption[]): void {
    this.servicesSelected = selectedServices.map(service => this.services.find(s => s.id === service.id) || new Service());
  }

  onSingleServiceSelectionChange(selectedService: VisualOption): void {
    this.serviceSelected = this.services.find(service => service.id === selectedService.id) || new Service();
  }
  
  onStylistSelectionChange(selectedStylists: VisualOption[]): void {
    this.stylistsSelected = selectedStylists.map(stylist => this.stylists.find(s => s.id === stylist.id) || new User());
  }

  onSingleStylistSelectionChange(selectedStylist: VisualOption): void {
    this.stylistSelected = this.stylists.find(stylist => stylist.id === selectedStylist.id) || new User();
  }

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
    this.updateUrlWithView(tab);
  }
  
  private updateUrlWithView(tab: string): void {
    const view = this.tabToViewMap[tab];
    if (view) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { view },
        queryParamsHandling: 'merge'
      });
    }
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



   hasPermission(permission: string): boolean {
    return this.permissions.some(p => p.name.includes(permission));
   }

   onWeekSelectedFromMonthly(date: Date): void {
    this.dateCalendarWeekly = new Date(date);
    this.onTabChanged('Week');
   }

   onDaySelectedFromWeekly(date: Date): void {
    this.dateCalendarDaily = new Date(date);
    this.onTabChanged('Day');
   }

   get currentCalendarDate(): Date {
    switch (this.tabActive) {
      case 'Month':
        return this.dateCalendarMonthly;
      case 'Week':
        return this.dateCalendarWeekly;
      case 'Day':
        return this.dateCalendarDaily;
      case 'Stylists':
        return this.dateBookingsSupplier;
      default:
        return this.dateCalendarMonthly;
    }
   }
}
