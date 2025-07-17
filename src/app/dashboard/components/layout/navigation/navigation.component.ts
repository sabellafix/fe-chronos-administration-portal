import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

interface MenuItem {
  title: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  isOpen?: boolean;
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
      title: 'Companies',
      icon: 'bx bx-store',
      children: [
        { 
          title: 'List',
          icon: 'bx bx-store',
          route: 'companies'
        },
        {
          title: 'Create',
          icon: 'bx bx-store',
          route: 'companies/create'
        }
      ]
    },
    {
      title: 'Bookings',
      icon: 'bx bx bx-calendar',
      children: [
        {
          title: 'Calendar',
          icon: 'bx bx-calendar',
          route: 'bookings'
        }
      ]
    },
    {
      title: 'Stylists',
      icon: 'bx bx-face',
      children: [
        {
          title: 'List',
          icon: 'bx bx-face',
          route: 'users'
        },
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
      children: [
        {
          title: 'List',
          icon: 'bx bx-cut',
          route: 'services'
        },
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
      children: [
        { 
          title: 'List',
          icon: 'bx bx-collection',
          route: 'categories'
        },
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
      children: [
        {
          title: 'List',
          icon: 'bx bx-user',
          route: 'customers'
        },
        {
          title: 'Create',
          icon: 'bx bx-user',
          route: 'customers/create'
        }
      ]
    }
  ];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.activatedRoute.parent?.url.subscribe(urlSegment => { this.routeSegment = urlSegment[0]?.path; });
  }

  ngOnInit(): void {
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
