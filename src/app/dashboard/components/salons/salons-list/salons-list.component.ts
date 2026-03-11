import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Salon } from '@app/core/models/bussiness';
import { Option } from '@app/core/models/interfaces/option.interface';
import { DialogConfirmComponent } from '@app/dashboard/components/shared/dialogs/dialog-confirm/dialog-confirm.component';
import { SalonService } from '@app/core/services/http/salon.service';

@Component({
  selector: 'app-salons-list',
  templateUrl: './salons-list.component.html',
  styleUrl: './salons-list.component.scss'
})
export class SalonsListComponent {
  titleComponent: string = "Salons List";
  loading: boolean = false;
  salon: Salon = new Salon();
  salons: Salon[] = [];
   
  attributes: Option[] = [ 
    { name: "State", code: "isActive" }, 
    { name: "Name", code: "name" }, 
    { name: "City", code: "city" },
    { name: "Country", code: "country" } 
  ];

  states: Option[] = [ 
    { name: "Active", code: "true" },
    { name: "Inactive", code: "false" }
  ];

  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  showPaginate: boolean = true; 
  maxItems = [10, 20, 50];  

  constructor(
    private salonService: SalonService,
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
    this.salonService.getSalons().subscribe({
      next: (response: Salon[]) => {
        this.salons = response;
        this.totalItems = response.length;
        this.loading = false;
      },
      error: (response) => {
        this.snackBar.open('Error getting the salons', 'Close', { duration: 4000 });
        this.totalItems = 0;
        this.loading = false;
      }
    });
  }

  changePage(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.load();
  }

  create(): void {
    this.router.navigate([`/salons/create`]);
  }

  update(id: string): void {
    this.router.navigate([`/salons/${id}/update`]);
  }

  detail(id: string): void {
    this.router.navigate([`/salons/${id}/detail`]);
  }

  delete(id: string): void {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      width: '400px',
      data: {
        title: 'Are you sure you want to delete the salon?',
        description: ['This action will delete the selected salon.'],
        labelButtons: ['Yes, delete', 'Cancel']
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.salonService.deleteSalon(id).subscribe({
          next: (response: any) => {              
            this.snackBar.open('Salon deleted successfully', 'Close', { duration: 4000 });
            this.load();
          },
          error: (error: any) => {
            let message = '';
            if (error.error.message && error.status != 422) {
              message = error.error.message;
            }
            this.snackBar.open('Error executing the deletion ' + message, 'Close', { duration: 4000 });
          }
        });
      }
    });
  }

  filter(filters: string) {
    this.load();
  }

  getSalonName(salon: Salon): string {
    return salon.name || 'Sin nombre';
  }

  getSalonStatus(salon: Salon): string {
    return salon.isActive ? 'Active' : 'Inactive';
  }

  getSalonStatusClass(salon: Salon): string {
    return salon.isActive ? 'status-active' : 'status-inactive';
  }

  getSalonLocation(salon: Salon): string {
    return [salon.city, salon.address, salon.country]
      .filter(part => part)
      .join(', ') || 'N/A';
  }

  formatDate(dateString: string | Date): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  }

  clear() {}
}
