import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Company } from '@app/core/models/bussiness/company';
import { MockCompanyService } from '@app/core/services/mock/mock-company.service';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { Option } from '@app/core/models/interfaces/option.interface';
// import { EntiesConst } from '@app/core/models/constants/entities.const';
import { DialogConfirmComponent } from '../../shared/dialogs/dialog-confirm/dialog-confirm.component';

@Component({
  selector: 'app-companies-list',
  templateUrl: './companies-list.component.html',
  styleUrl: './companies-list.component.scss'
})
export class CompaniesListComponent implements OnInit {
  titleComponent: string = "Listado de empresas";
  // entity: string = EntiesConst._COMPANY || 'company';
  loading: boolean = false;
  company: Company = new Company();
  companies: Company[] = [];

  pagination: Pagination = { offset: 0, limit: 10, items: 0, filters: ``, sort: 'id,desc' };
   
  attributes: Option[] = [ 
    {name: "Nombre de la Empresa", code: "companyName"}, 
    {name: "Nombre Legal", code: "legalName"},
    {name: "Industria", code: "industry"},
    {name: "Email", code: "email"},
    {name: "Plan de Suscripción", code: "subscriptionPlan"}
  ];

  states: Option[] = [ 
    { name: "Activo", code: "true" },
    { name: "Inactivo", code: "false" }
  ];

  subscriptionPlans: Option[] = [
    { name: "Básico", code: "Basic" },
    { name: "Profesional", code: "Professional" },
    { name: "Empresarial", code: "Enterprise" },
    { name: "Premium", code: "Premium" }
  ];

  totalItems = 10;
  pageSize = 10;
  pageIndex = 0;
  showPaginate: boolean = true;
  maxItems = [10, 20, 50];

  constructor(
    private companyService: MockCompanyService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.companyService.getCompanies(this.pagination).subscribe({
      next: (response) => {
        this.companies = <Company[]>response.data;
        this.totalItems = response.count;
        this.loading = false;
      },
      error: (response) => {
        this.snackBar.open('Error al obtener las empresas', 'Cerrar', {duration: 4000});
        this.totalItems = 0;
        this.loading = false;
      }
    });
  }

  changePage(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.pagination.offset = this.pageIndex;
    this.pagination.limit = this.pageSize;
    this.load();
  }

  create(): void {
    this.router.navigate([`/companies/create`]);
  }

  update(id: number): void {
    this.router.navigate([`/companies/${id}/update`]);
  }

  detail(id: number): void {
    this.router.navigate([`/companies/${id}/detail`]);
  }

  delete(id: number): void {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      width: '400px',
      data: {
        title: '¿Quiere eliminar la empresa?',
        description: ['Esta acción eliminará la empresa seleccionada.'],
        labelButtons: ['Sí, eliminar', 'Cancelar']
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.companyService.delete(id).subscribe({
          next: (response: any) => {              
            this.snackBar.open('Empresa eliminada correctamente', 'Cerrar', {duration: 4000});
            this.load();
          }, 
          error: (error: any) => {
            let message = '';
            if(error.error.message && error.status != 422){
              message = error.error.message;
            }
            this.snackBar.open('Error ejecutando la eliminación ' + message, 'Cerrar', {duration: 4000});
          }
        });
      }
    });
  }

  filter(filters: string) {
    if(filters && filters != "CLEAR"){
      this.pagination.filters = filters;
    } else {
      this.pagination.filters = '';
    }
    this.pagination.offset = 0;
    this.load();
  }

  getCompanyStatus(company: Company): string {
    return company.isActive ? 'Activo' : 'Inactivo';
  }

  getCompanyStatusClass(company: Company): string {
    return company.isActive ? 'status-active' : 'status-inactive';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  }

  clear() {}
}
