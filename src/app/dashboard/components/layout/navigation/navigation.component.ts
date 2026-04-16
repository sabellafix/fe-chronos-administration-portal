import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PermissionService } from '@app/core/services/shared/permission.service';

interface MenuItem {
  title: string;
  icon: string;
  route?: string;
  queryParams?: { [key: string]: string };
  children?: MenuItem[];
  isOpen?: boolean;
  show?: boolean;
}

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent implements OnInit{

  @Input('companyName') companyName : string = "../assets/images/brand-icon.svg"; 
  @Input('companyLogo') companyLogo : string = "../assets/images/brand-icon.svg";
  @Input('companyLogoCollapse') companyLogoCollapse : string = "../assets/images/brand-icon.svg";

  public routeSegment: string = '';
  loading : boolean = false;
  showBrand : boolean = false;
  private currentOpenMenu: MenuItem | null = null;

  menuItems: MenuItem[] = [     
    {
      title: 'Dashboard',
      icon: 'bx bx-line-chart',
      route: 'dashboard'
    },
    {
      title: 'Calendar',
      icon: 'bx bx bx-calendar',
      route: 'calendar',
      children: [
        {
          title: 'Month',
          icon: 'bx bx bx-calendar',
          route: 'calendar',
          queryParams: { view: 'month' }
        },
        {
          title: 'Week',
          icon: 'bx bx bx-calendar',
          route: 'calendar',
          queryParams: { view: 'week' }
        },
        {
          title: 'Day',
          icon: 'bx bx bx-calendar',
          route: 'calendar',
          queryParams: { view: 'day' }
        },
        {
          title: 'Stylists',
          icon: 'bx bx bx-calendar',
          route: 'calendar',
          queryParams: { view: 'stylists' }
        }
      ]
    },
    {
      title: 'Bookings',
      icon: 'bx bx-calendar-check',
      route: 'bookings'
    },
    {
      title: 'Chat',
      icon: 'bx bx-chat',
      route: 'chat'
    },
    {
      title: 'Stylists',
      icon: 'bx bx-face',
      route: 'users',
      children: [
        {
          title: 'Create',
          icon: 'bx bx-face',
          route: 'users/create'
        }
      ]
    },
    {
      title: 'Services',
      icon: 'bx bx-cut',
      route: 'services',
      children: [
       
        {
          title: 'Create',
          icon: 'bx bx-cut',
          route: 'services/create'
        }
      ]
    },  
    {
      title: 'Categories',
      icon: 'bx bx-collection',
      route: 'categories',
      children: [
       
        {
          title: 'Create',
          icon: 'bx bx-collection',
          route: 'categories/create'
        }
      ]
    },
    {
      title: 'Customers',
      icon: 'bx bx-user',
      route: 'customers',
      children: [
        {
          title: 'Create',
          icon: 'bx bx-user',
          route: 'customers/create'
        }
      ]
    },
    {
      title: 'Salons',
      icon: 'bx bx-building',
      route: 'salons',
      children: [
        {
          title: 'Create',
          icon: 'bx bx-building',
          route: 'salons/create'
        }
      ]
    },
    {
      title: 'Roles',
      icon: 'bx bx-id-card',
      route: 'roles',
      children: [
        {
          title: 'Create',
          icon: 'bx bx-shield',
          route: 'roles/create'
        }
      ]
    }
  ];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private permissionService: PermissionService
  ) {
    this.activatedRoute.parent?.url.subscribe(urlSegment => { this.routeSegment = urlSegment[0]?.path; });
  }

  ngOnInit(): void {
    this.applyPermissionsToMenu();
  }

  private applyPermissionsToMenu(): void {
    this.menuItems.forEach(item => {
      item.show = this.hasPermissionForMenuItem(item);
      
      if (item.children) {
        item.children.forEach(child => {
          child.show = this.hasPermissionForMenuItem(child);
        });
      }
    });
  }

  private hasPermissionForMenuItem(item: MenuItem): boolean {
    if (!item.route) {
      return true;
    }
    return this.permissionService.hasPermissionForRoute(item.route);
  }

  toggleSubmenu(item: MenuItem): void {
    if (item.children) {
      if (this.currentOpenMenu === item) {
        item.isOpen = false;
        this.currentOpenMenu = null;
        return;
      }

      if (this.currentOpenMenu) {
        this.currentOpenMenu.isOpen = false;
      }

      item.isOpen = true;
      this.currentOpenMenu = item;
    } else if (item.route) {
      this.router.navigate([item.route]);
    }
  }
}
