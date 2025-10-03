import { Component, Input } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { User } from '@app/core/models/bussiness/user';
import { AuthService } from '@app/core/services/http/auth.service';
import { StorageService } from '@app/core/services/shared/storage.service';
import { Navigation } from '@app/core/models/interfaces/nav.interface';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { StorageKeyConst } from '@app/core/models/constants/storageKey.const';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {

  user : User = new User();
  load: boolean = false;
  loading: boolean = false;
  pagination: Pagination = { offset: 0, limit: 1, items: 0, filters: ``, sort: 'id,asc' };
  imageUser: string = "../assets/images/user-image.jpg";
  roleUser: string = "";
  agencies : any[] = [];
  selectedSalon: any = { value: 'salon-1', label: 'Salón Centro - Madrid' };
  salons : any[] = [];
  

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
    { name: 'roles',                icon: 'panel',    route: '/roles',                module: "roles",                active: false },
  ];
  
  moduleName? : Navigation | undefined = this.routes[0];

  constructor(private activatedRoute: ActivatedRoute,
              private authService : AuthService,
              private storageService : StorageService,
              private router: Router
  ) {}

  ngOnInit(): void {
    this.onRouteChange();   
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.onRouteChange();
      }
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

    this.salons = [
      { value: 'salon-1', label: 'Salón Centro - Madrid' },
      { value: 'salon-2', label: 'Salón Norte - Barcelona' },
      { value: 'salon-3', label: 'Salón Sur - Valencia' }
    ];  
  }

  onSalonChange(value: string): void {
    this.selectedSalon = value;
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
