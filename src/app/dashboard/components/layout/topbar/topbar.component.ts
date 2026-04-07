import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { User } from '@app/core/models/bussiness/user';
import { AuthService } from '@app/core/services/http/auth.service';
import { StorageService } from '@app/core/services/shared/storage.service';
import { DashboardFiltersService, FilterVisibility } from '@app/core/services/shared/dashboard-filters.service';
import { UserService } from '@app/core/services/http/user.service';
import { SalonService } from '@app/core/services/http/salon.service';
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
  
  isDashboardRoute: boolean = false;
  startDate: string = '';
  endDate: string = '';
  stylistOptions: VisualOption[] = [];
  salonOptions: VisualOption[] = [];
  stylists: User[] = [];
  loadingSalons: boolean = false;
  
  filterVisibility: FilterVisibility = {
    showDateRange: false,
    showStylist: false,
    showSalon: false
  };
  
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
    { name: 'calendar',             icon: 'panel',    route: '/calendar',             module: "calendar",             active: false },
    { name: 'customers',            icon: 'panel',    route: '/customers',            module: "customers",            active: false },
    { name: 'products',             icon: 'panel',    route: '/products',             module: "products",             active: false },
    { name: 'salons',               icon: 'panel',    route: '/salons',               module: "salons",               active: false },
    { name: 'roles',                icon: 'panel',    route: '/roles',                module: "roles",                active: false },
  ];
  
  moduleName? : Navigation | undefined = this.routes[0];

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private storageService: StorageService,
    private dashboardFiltersService: DashboardFiltersService,
    private userService: UserService,
    private salonService: SalonService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.onRouteChange();   
    this.router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.onRouteChange();
          this.updateFilterVisibility(event.urlAfterRedirects);
        }
      });

    this.updateFilterVisibility(this.router.url);
    
    this.dashboardFiltersService.filterVisibility$
      .pipe(takeUntil(this.destroy$))
      .subscribe(visibility => {
        this.filterVisibility = visibility;
        this.isDashboardRoute = this.dashboardFiltersService.hasVisibleFilters();
      });

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

    this.initializeDashboardFilters();
    
    this.loadSalons();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateFilterVisibility(url: string): void {
    this.dashboardFiltersService.updateFilterVisibilityByRoute(url);
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

  private loadSalons(): void {
    this.loadingSalons = true;
    this.salonService.getSalons()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (salons) => {
          this.salons = salons.filter(s => s.isActive);
          
          if (this.salons.length > 0) {
            this.selectedSalon = this.salons[0];
            // Única actualización de filtros al cargar salones
            this.dashboardFiltersService.updateFilters({
              selectedSalon: this.selectedSalon,
              selectedStylist: null
            });
            this.loadStylistsBySalon(this.selectedSalon.id);
          }
          
          this.prepareSalonOptions();
          this.loadingSalons = false;
        },
        error: (error) => {
          console.error('Error loading salons:', error);
          this.loadingSalons = false;
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
  }
  
  private prepareSalonOptions(): void {
    this.salonOptions = this.salons.map((salon, index) => ({
      id: salon.id,
      name: salon.name,
      selected: index === 0
    }));
  }
  
  applyDateFilters(): void {
    const newStartDate = new Date(this.startDate);
    const newEndDate = new Date(this.endDate);
    
    if (newStartDate > newEndDate) {
      this.endDate = this.startDate;
    }
    
    this.dashboardFiltersService.updateDateRange(new Date(this.startDate), new Date(this.endDate));
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
      this.loadStylistsBySalon(selectedSalon.id);
    }
  }

  private loadStylistsBySalon(salonId: string): void {
    this.salonService.getUsersBySalon(salonId, RolesConst._STYLIST)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.stylists = users.filter(u => u.isActive);
          this.prepareStylistOptions();
        },
        error: (error) => {
          console.error('Error loading stylists by salon:', error);
        }
      });
  }

  onSalonChange(value: Salon): void {
    this.selectedSalon = value;
    this.dashboardFiltersService.setSelectedSalon(value);
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
