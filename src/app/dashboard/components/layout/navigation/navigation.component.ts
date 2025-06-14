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
      title: 'Usuarios',
      icon: 'bx bx-group',
      children: [
        {
          title: 'Listado',
          icon: 'bx bx-user',
          route: 'users'
        },
        {
          title: 'Crear',
          icon: 'bx bx-git-commit',
          route: 'users/create'
        }
      ]
    },
    {
      title: 'Servicios',
      icon: 'bx bx-cog',
      children: [
        {
          title: 'Listado',
          icon: 'bx bx-cog',
          route: 'services'
        },
        {
          title: 'Crear',
          icon: 'bx bx-git-commit',
          route: 'services/create'
        }
      ]
    },  
    {
      title: 'Recevas',
      icon: 'bx bx bx-calendar',
      children: [
        {
          title: 'Calendario',
          icon: 'bx bx-calendar',
          route: 'bookings'
        }
      ]
    },
    {
      title: 'Estilistas',
      icon: 'bx bx bx-cut',
      children: [
        {
          title: 'Listado',
          icon: 'bx bx-cog',
          route: 'suppliers'
        },
        {
          title: 'Crear',
          icon: 'bx bx-git-commit',
          route: 'suppliers/create'
        }
      ]
    },
    {
      title: 'Categorías',
      icon: 'bx bx-cog',
      children: [
        { 
          title: 'Listado',
          icon: 'bx bx-cog',
          route: 'categories'
        },
        {
          title: 'Crear',
          icon: 'bx bx-git-commit',
          route: 'categories/create'
        }
      ]
    },
    {
      title: 'Compañías',
      icon: 'bx bx-cog',
      children: [
        { 
          title: 'Listado',
          icon: 'bx bx-cog',
          route: 'companies'
        },
        {
          title: 'Crear',
          icon: 'bx bx-git-commit',
          route: 'companies/create'
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
