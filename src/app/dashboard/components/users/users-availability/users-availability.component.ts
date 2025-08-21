import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DateItem } from '../../../../core/models/bussiness/calendar/dateItem';
import { Availability } from '../../../../core/models/bussiness/availability';
import { BlockedTime } from '../../../../core/models/bussiness/blocked-time';
import { User } from '../../../../core/models/bussiness/user';
import { UserService } from '../../../../core/services/http/user.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-users-availability',
  templateUrl: './users-availability.component.html',
  styleUrl: './users-availability.component.scss'
})
export class UsersAvailabilityComponent implements OnInit, OnDestroy {

  titleComponent: string = "Availability";
  dateNow: Date = new Date();
  tabs: string[] = ['Month', 'Week', 'Day', 'Stylists', 'Floor'];
  tabActive: string = 'Month';

  stylistId: string = "";
  stylist: User | null = null;
  loading: boolean = true;
  dates: DateItem[] = [];
  currentDate: Date = new Date();
  
  availabilities: Availability[] = [];
  blockedTimes: BlockedTime[] = [];
  
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private router: Router
  ) {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.stylistId = params['id'];
      }
    });
  }

  ngOnInit(): void {
    this.updateDates();
    this.loadStylistInfo();
    this.loadStylistAvailability();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }


  private updateDates(): void {
    this.dates = this.getDates();
  }


  getDates(): DateItem[] {
    const dates: DateItem[] = [];
    const today = new Date(this.currentDate);
    const dayOfWeek = today.getDay();
    
    const daysToMonday = dayOfWeek === 0 ? -6 : -(dayOfWeek - 1);
    const monday = new Date(today);
    monday.setDate(today.getDate() + daysToMonday);
    
    for (let i = 0; i < 7; i++) {
      const dateItem = new DateItem();
      const weekDate = new Date(monday);
      weekDate.setDate(monday.getDate() + i);
      
      dateItem.date = weekDate;
      dateItem.isToday = weekDate.toDateString() === new Date().toDateString();
      
      dates.push(dateItem);
    }
    
    return dates;
  }

  getHoursRange(): number[] {
    const hours: number[] = [];
    for (let i = 7; i <= 24; i++) {
      hours.push(i);
    }
    return hours;
  }

  formatHour(hour: string): string {
    const hourNumber = parseInt(hour);
    if (hourNumber === 0) {
      return '12 am';
    } else if (hourNumber < 12) {
      return `${hourNumber} am`;
    } else if (hourNumber === 12) {
      return '12 pm ';
    } else if (hourNumber === 24) {
      return '12 am';
    } else {
      return `${hourNumber - 12} pm`;
    }
  }

  onCellClick(date: Date, hour: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('Celda clickeada:', {
      date: date.toDateString(),
      hour: hour,
      stylistId: this.stylistId
    });
    
    this.toggleAvailability(date, hour);
  }

  private toggleAvailability(date: Date, hour: number): void {
    // TODO: Implementar lógica para alternar disponibilidad
    console.log('Toggling availability for:', date, hour);
  }

  private loadStylistInfo(): void {
    if (!this.stylistId) {
      this.loading = false;
      this.snackBar.open('ID del estilista no encontrado', 'Cerrar', {
        duration: 3000,
        panelClass: 'snackbar-error'
      });
      return;
    }

    this.loading = true;
    
    const subscription = this.userService.get(this.stylistId).subscribe({
      next: (response) => {
        this.stylist = response;
        this.loading = false;
        console.log('Información del estilista cargada:', this.stylist);
      },
      error: (error) => {
        this.loading = false;
        console.error('Error cargando información del estilista:', error);
        this.snackBar.open('Error al cargar la información del estilista', 'Cerrar', {
          duration: 3000,
          panelClass: 'snackbar-error'
        });
      }
    });
    
    this.subscriptions.push(subscription);
  }

  private loadStylistAvailability(): void {
    if (!this.stylistId) {
      return;
    }
    
    // TODO: Implementar carga de disponibilidad
    console.log('Cargando disponibilidad para estilista:', this.stylistId);
  }

  getStylistFullName(): string {
    if (!this.stylist) return '';
    return `${this.stylist.firstName} ${this.stylist.lastName}`.trim();
  }

  getStylistPhoto(): string {
    if (!this.stylist || !this.stylist.photo) {
      return 'assets/images/users/user1.jpg'; // Imagen por defecto
    }
    return this.stylist.photo;
  }

  hasAvailability(date: Date, hour: number): boolean {
    // TODO: Implementar lógica para verificar disponibilidad
    return false;
  }

  isBlocked(date: Date, hour: number): boolean {
    // TODO: Implementar lógica para verificar tiempo bloqueado
    return false;
  }
  
  private getDayOfWeekNumber(date: Date): number {
    const day = date.getDay();
    return day === 0 ? 7 : day;
  }


  previousWeek(): void {
    this.currentDate.setDate(this.currentDate.getDate() - 7);
    this.updateDates();
    this.loadStylistAvailability();
  }


  nextWeek(): void {
    this.currentDate.setDate(this.currentDate.getDate() + 7);
    this.updateDates();
    this.loadStylistAvailability();
  }


  goToCurrentWeek(): void {
    this.currentDate = new Date();
    this.updateDates();
    this.loadStylistAvailability();
  }

  return(){
    this.router.navigate([`/users`]);
  }

}
