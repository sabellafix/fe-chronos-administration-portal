import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Service } from '@app/core/models/bussiness/service';
import { ServiceService } from '@app/core/services/http/platform-service.service';
import { Option } from '@app/core/models/interfaces/option.interface';
import { DialogConfirmComponent } from '@app/dashboard/components/shared/dialogs/dialog-confirm/dialog-confirm.component';

@Component({
  selector: 'app-services-list',
  templateUrl: './services-list.component.html',
  styleUrl: './services-list.component.scss'
})
export class ServicesListComponent {
  titleComponent : string = "Services";
  loading: boolean = false;
  service: Service = new Service();
  services: Service[] = [];
   
  attributes : Option[] = [ 
    {name: "State", code : "isActive"}, 
    {name: "Name", code : "serviceName"}, 
    {name: "Price", code : "price"},
    {name: "Duration", code : "duration"} 
  ];

  states : Option[] = [ 
    { name: "Active", code: "true" },
    { name: "Inactive", code: "false" }
  ];

  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  showPaginate : boolean = true; // Deshabilitado hasta implementar paginación en backend
  maxItems = [10,20,50];

  constructor(
    private serviceService: ServiceService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ){
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.serviceService.getServices().subscribe({
      next: (response: Service[]) => {
        this.services = response;
        this.totalItems = response.length;
        this.loading = false;
      },error: (response) =>{
        this.snackBar.open('Error al obtener los servicios', 'Cerrar', {duration: 4000});
        this.totalItems = 0;
        this.loading = false;
      }
    });
  }

  changePage(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    // TODO: Implementar paginación cuando esté disponible en el backend
    this.load();
  }

  create(): void {
    this.router.navigate([`/services/create`]);
  }

  update(id: string): void {
    this.router.navigate([`/services/${id}/update`]);
  }

  detail(id: string): void {
    this.router.navigate([`/services/${id}/detail`]);
  }

  delete(id: string): void {
      const dialogRef = this.dialog.open(DialogConfirmComponent, {
        width: '400px',
        data: {
          title: '¿Quiere eliminar el servicio?',
          description: ['Esta acción eliminará el servicio seleccionado.'],
          labelButtons: ['Sí, eliminar', 'Cancelar']
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.serviceService.deleteService(id).subscribe({
            next: (response: any) => {              
              this.snackBar.open('Servicio eliminado correctamente', 'Cerrar', {duration: 4000});
              this.load();
            }, error: (error: any) =>{
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

  filter(filters: string){
    // TODO: Implementar filtros cuando esté disponible en el backend
    this.load();
  }

  getServiceName(service: Service): string {
    return [service.serviceName, service.price ? `($${service.price} ${service.currency || ''})` : '']
      .filter(name => name)
      .join(' ')!;
  }

  getServiceStatus(service: Service): string {
    return service.isActive ? 'Activo' : 'Inactivo';
  }

  getServiceStatusClass(service: Service): string {
    return service.isActive ? 'status-active' : 'status-inactive';
  }

  getDurationFormatted(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  }

  clear(){}

  getServiceDisplayName(service: Service): string {
    return service.serviceName || 'Sin nombre';
  }

  getServiceCurrency(service: Service): string {
    return service.currency || 'USD';
  }

  getServiceColor(service: Service): string {
    return service.color || '#23324d';
  }
}
