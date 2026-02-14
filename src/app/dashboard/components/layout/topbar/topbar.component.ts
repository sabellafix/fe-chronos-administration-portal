import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { User } from '@app/core/models/bussiness/user';
import { AuthService } from '@app/core/services/http/auth.service';
import { StorageService } from '@app/core/services/shared/storage.service';
import { SalonStateService } from '@app/core/services/shared/salon-state.service';
import { DashboardFiltersService } from '@app/core/services/shared/dashboard-filters.service';
import { UserService } from '@app/core/services/http/user.service';
import { Navigation } from '@app/core/models/interfaces/nav.interface';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { VisualOption } from '@app/core/models/interfaces/option.interface';
import { StorageKeyConst } from '@app/core/models/constants/storageKey.const';
import { RolesConst } from '@app/core/models/constants/roles.const';
import { Salon } from '@app/core/models/bussiness/salon';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent implements OnInit, OnDestroy {

  user : User = new User();
  load: boolean = false;
  loading: boolean = false;
  pagination: Pagination = { offset: 0, limit: 1, items: 0, filters: ``, sort: 'id,asc' };
  imageUser: string = "../assets/images/user-image.jpg";
  roleUser: string = "";
  agencies : any[] = [];
  selectedSalon: Salon = new Salon();
  salons : Salon[] = [];
  
  // Dashboard filters
  isDashboardRoute: boolean = false;
  startDate: string = '';
  endDate: string = '';
  stylistOptions: VisualOption[] = [];
  salonOptions: VisualOption[] = [];
  stylists: User[] = [];
  
  private destroy$: Subject<void> = new Subject<void>();
  

  public routeParent: string = "";
  public routeChild: string = "";
  
  breadcrumbs: string = '';
  routes: Navigation[] = [
    { name: 'dashboard',            icon: 'panel',    route: '/dashboard',            module: "dashboard",            active: false },
    { name: 'styilist',             icon: 'panel',    route: '/users',                module: "users",                active: false },
    { name: 'services',             icon: 'panel',    route: '/services',             module: "services",             active: false },
    { name: 'categories',           icon: 'panel',    route: '/categories',           module: "categories",           active: false },
    { name: 'companies',            icon: 'panel',    route: '/companies',            module: "companies",            active: false },
    { name: 'bookings',             icon: 'panel',    route: '/bookings',             module: "bookings",             active: false },
    { name: 'customers',            icon: 'panel',    route: '/customers',            module: "customers",            active: false },
    { name: 'products',             icon: 'panel',    route: '/products',             module: "products",             active: false },
    { name: 'roles',                icon: 'panel',    route: '/roles',                module: "roles",                active: false },
  ];
  
  moduleName? : Navigation | undefined = this.routes[0];

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private storageService: StorageService,
    private salonStateService: SalonStateService,
    private dashboardFiltersService: DashboardFiltersService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.onRouteChange();   
    this.router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.onRouteChange();
          this.checkDashboardRoute(event.urlAfterRedirects);
        }
      });

    // Check initial route
    this.checkDashboardRoute(this.router.url);

    this.user = JSON.parse(this.storageService.get(StorageKeyConst._USER)!);
    if(this.user != null){
      this.user.role = JSON.parse(this.storageService.get(StorageKeyConst._ROLE)!);
      if(this.user.role != null){
        this.roleUser = this.user.role.name;
      }
      if(this.user.photo != null){
        this.imageUser = this.user.photo;
      }
    } 

    this.salons = [
      {
        id: '07c3fea6-9326-45cf-b97b-c29b92e5437e',
        companyId: '85be9ea1-6980-42a7-bfe2-4c1da6da6e9f',
        name: 'Chronos North Point',
        description: 'Chronos North Point',
        capacity: 40,
        address: '1060 West Addison Street, Wrigley Field',
        city: 'Chicago',
        state: 'IL',
        country: 'United States',
        zipCode: '60613',
        isActive: true,
        createdAt: new Date('2025-09-01'),
        updatedAt: new Date('2025-09-01'),
        company: {} as any,
        bookings: [],
        services: []
      },
      {
        id: '790eceaa-2d87-4b8a-9594-f21d82f0799f',
        companyId: '85be9ea1-6980-42a7-bfe2-4c1da6da6e9f',
        name: 'Chronos Central Park',
        description: 'Chronos Central Park',
        capacity: 35,
        address: '900 Michigan Ave, 360 Chicago Observation Deck',
        city: 'Chicago',
        state: 'IL',
        country: 'United States',
        zipCode: '60611',
        isActive: true,
        createdAt: new Date('2025-09-01'),
        updatedAt: new Date('2025-09-01'),
        company: {} as any,
        bookings: [],
        services: []
      }
    ];  

    this.selectedSalon = this.salons[0];
    // Establecer el salón inicial en el servicio compartido
    this.salonStateService.setSelectedSalon(this.selectedSalon);
    
    // Initialize dashboard filters
    this.initializeDashboardFilters();
    this.loadStylists();
    this.prepareSalonOptions();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private checkDashboardRoute(url: string): void {
    this.isDashboardRoute = url === '/dashboard' || url.endsWith('/dashboard');
  }
  
  private initializeDashboardFilters(): void {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    this.startDate = this.formatDateForInput(startOfMonth);
    this.endDate = this.formatDateForInput(endOfMonth);
  }
  
  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  
  private loadStylists(): void {
    this.userService.getUsersByRole(RolesConst._STYLIST)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.stylists = users.filter(u => u.isActive);
          this.prepareStylistOptions();
        },
        error: (error) => {
          console.error('Error loading stylists:', error);
        }
      });
  }
  
  private prepareStylistOptions(): void {
    this.stylistOptions = this.stylists.map((stylist) => ({
      id: stylist.id,
      name: `${stylist.firstName} ${stylist.lastName}`,
      imageUrl: stylist.photo || '../assets/images/user-image.jpg',
      selected: false
    }));
    
    // Estado inicial sin estilista seleccionado
    this.dashboardFiltersService.updateSelectedStylist(null);
  }
  
  private prepareSalonOptions(): void {
    this.salonOptions = this.salons.map((salon, index) => ({
      id: salon.id,
      name: salon.name,
      selected: index === 0 // Seleccionar el primero por defecto
    }));
    
    // Notificar el salón inicial seleccionado
    if (this.salons.length > 0) {
      this.dashboardFiltersService.updateSelectedSalon(this.salons[0]);
    }
  }
  
  onStartDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const newStartDate = new Date(input.value);
    const currentEndDate = new Date(this.endDate);
    
    // Validar que la fecha de inicio no sea posterior a la fecha de fin
    if (newStartDate > currentEndDate) {
      // Ajustar la fecha de fin para que sea igual a la fecha de inicio
      this.endDate = input.value;
      this.dashboardFiltersService.updateEndDate(newStartDate);
    }
    
    this.startDate = input.value;
    this.dashboardFiltersService.updateStartDate(newStartDate);
  }
  
  onEndDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const newEndDate = new Date(input.value);
    const currentStartDate = new Date(this.startDate);
    
    // Validar que la fecha de fin no sea anterior a la fecha de inicio
    if (newEndDate < currentStartDate) {
      // Ajustar la fecha de inicio para que sea igual a la fecha de fin
      this.startDate = input.value;
      this.dashboardFiltersService.updateStartDate(newEndDate);
    }
    
    this.endDate = input.value;
    this.dashboardFiltersService.updateEndDate(newEndDate);
  }
  
  getMaxStartDate(): string {
    return this.endDate;
  }
  
  getMinEndDate(): string {
    return this.startDate;
  }
  
  onStylistSingleSelectionChange(selectedOption: VisualOption | null): void {
    const selectedStylist = selectedOption ? this.stylists.find(s => s.id === selectedOption.id) || null : null;
    this.dashboardFiltersService.updateSelectedStylist(selectedStylist);
  }
  
  onSalonSingleSelectionChange(selectedOption: VisualOption | null): void {
    const selectedSalon = selectedOption ? this.salons.find(s => s.id === selectedOption.id) || null : null;
    this.dashboardFiltersService.updateSelectedSalon(selectedSalon);
    if (selectedSalon) {
      this.onSalonChange(selectedSalon);
    }
  }

  onSalonChange(value: Salon): void {
    this.selectedSalon = value;
    this.salonStateService.setSelectedSalon(value);
  } 

  onRouteChange() {
    const parentRoute = this.activatedRoute;
    if (parentRoute) {
      const urlSegments = parentRoute.snapshot.url;
      this.routeParent = urlSegments.map(segment => segment.path).join('/');
      if(this.routeParent == '') { this.routeParent = "dashboard" }
      this.moduleName = this.routes.find(x => x.module == this.routeParent);
    }
    this.activatedRoute.children.forEach((childRoute) => {
      childRoute.url.subscribe((urlSegments) => {
        this.routeChild = urlSegments.map((segment) => segment.path).join('/');
        this.moduleName = this.routes.find(x => x.module == this.routeChild);
        this.load = false;
      });
    });
  }
  

  logOut(){
    this.authService.logOut();
  }


  profile(){
    this.router.navigate([`/users/${this.user.id}/detail`]);
  }

}
