import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Salon } from '@app/core/models/bussiness/salon';
import { SalonService } from '@app/core/services/http/salon.service';
import { SalonStateService } from '@app/core/services/shared/salon-state.service';

@Component({
  selector: 'app-salons-detail',
  templateUrl: './salons-detail.component.html',
  styleUrl: './salons-detail.component.scss'
})
export class SalonsDetailComponent {
  titleComponent: string = "Detail salon";
  loading: boolean = true;
  charge: boolean = false;
  id: string = "";
  salon: Salon = new Salon();

  constructor(
    private salonService: SalonService,
    private salonStateService: SalonStateService,
    private router: Router,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {
    this.route.params.subscribe(params => { if (params['id']) this.id = params['id'] });
  }

  ngOnInit(): void {
    this.loading = true;
    this.load();
  }

  load(): void {
    if (this.id) {
      this.loading = true;
      this.salonService.getSalon(this.id).subscribe({
        next: (data: any) => {
          this.salon = <Salon>data;
          this.salonStateService.setSelectedSalon(this.salon);
          this.loading = false;
        },
        error: (error: any) => {
          this.loading = false;
          this.snackBar.open('Error loading the salon', 'Close', { duration: 4000 });
        }
      });
    }
  }

  update() {
    this.router.navigate([`/salons/${this.id}/update`]);
  }

  return() {
    this.router.navigate([`/salons`]);
  }

  getSalonStatus(salon: Salon): string {
    return salon.isActive ? 'Active' : 'Inactive';
  }

  getSalonStatusClass(salon: Salon): string {
    return salon.isActive ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger';
  }

  getFullAddress(salon: Salon): string {
    const parts = [
      salon.address,
      salon.city,
      salon.state,
      salon.country,
      salon.zipCode
    ].filter(part => part);
    return parts.join(', ') || 'N/A';
  }

  formatDate(dateString: string | Date): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
