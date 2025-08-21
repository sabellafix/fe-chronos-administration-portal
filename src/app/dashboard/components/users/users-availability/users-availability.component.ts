import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DateItem } from '../../../../core/models/bussiness/calendar/dateItem';
import { Availability, DateOnly, TimeOnly } from '../../../../core/models/bussiness/availability';
import { BlockedTime } from '../../../../core/models/bussiness/blocked-time';
import { CreateBlockedTimeDto } from '../../../../core/models/bussiness/create-dtos';
import { User } from '../../../../core/models/bussiness/user';
import { UserService } from '../../../../core/services/http/user.service';
import { MockBlockedTimeService } from '../../../../core/services/mock/mock-blocked-time.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-users-availability',
  templateUrl: './users-availability.component.html',
  styleUrl: './users-availability.component.scss'
})
export class UsersAvailabilityComponent implements OnInit, OnDestroy {

  titleComponent: string = "Availability";
  dateNow: Date = new Date();
  tabs: string[] = ['Available', 'Blocked'];
  tabActive: string = 'Available';

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
    private blockedTimeService: MockBlockedTimeService,
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
    if (this.tabActive === 'Blocked') {
      this.toggleBlockedTime(date, hour);
    } else {
      // TODO: Implementar lógica para alternar disponibilidad normal
      console.log('Toggling availability for:', date, hour);
    }
  }

  private toggleBlockedTime(date: Date, hour: number): void {
    const existingBlockedTime = this.findBlockedTime(date, hour);
    
    if (existingBlockedTime) {
      // Remover tiempo bloqueado existente
      this.removeBlockedTime(existingBlockedTime);
    } else {
      // Agregar nuevo tiempo bloqueado
      this.addBlockedTime(date, hour);
    }
  }

  private findBlockedTime(date: Date, hour: number): BlockedTime | undefined {
    return this.blockedTimes.find(bt => {
      const blockedDate = new Date(bt.blockedDate.year, bt.blockedDate.month - 1, bt.blockedDate.day);
      return blockedDate.toDateString() === date.toDateString() && 
             bt.startTime.hour === hour && 
             bt.isActive;
    });
  }

  private addBlockedTime(date: Date, hour: number): void {
    const newBlockedTime = new BlockedTime();
    newBlockedTime.blockedTimeId = this.generateTempId();
    newBlockedTime.userId = this.stylistId;
    
    // Configurar fecha
    newBlockedTime.blockedDate = new DateOnly();
    newBlockedTime.blockedDate.year = date.getFullYear();
    newBlockedTime.blockedDate.month = date.getMonth() + 1;
    newBlockedTime.blockedDate.day = date.getDate();
    newBlockedTime.blockedDate.dayOfWeek = date.getDay();
    
    // Configurar hora (bloquear toda la hora)
    newBlockedTime.startTime = new TimeOnly();
    newBlockedTime.startTime.hour = hour;
    newBlockedTime.startTime.minute = 0;
    
    newBlockedTime.endTime = new TimeOnly();
    newBlockedTime.endTime.hour = hour;
    newBlockedTime.endTime.minute = 59;
    
    newBlockedTime.reason = 'Bloqueado desde calendario';
    newBlockedTime.isActive = true;
    newBlockedTime.createdAt = new Date().toISOString();
    
    // Agregar a la lista local
    this.blockedTimes.push(newBlockedTime);
    
    // Crear DTO para enviar al servidor
    const createDto = new CreateBlockedTimeDto();
    createDto.userId = this.stylistId;
    createDto.blockedDate = newBlockedTime.blockedDate;
    createDto.startTime = newBlockedTime.startTime;
    createDto.endTime = newBlockedTime.endTime;
    createDto.reason = newBlockedTime.reason;
    
    // Enviar al servidor
    const subscription = this.blockedTimeService.createBlockedTime(createDto).subscribe({
      next: (response) => {
        // Actualizar el ID temporal con el ID real del servidor
        const index = this.blockedTimes.findIndex(bt => bt.blockedTimeId === newBlockedTime.blockedTimeId);
        if (index !== -1) {
          this.blockedTimes[index] = response;
        }
        
       
      },
      error: (error) => {
        // Remover de la lista local si falla el servidor
        const index = this.blockedTimes.findIndex(bt => bt.blockedTimeId === newBlockedTime.blockedTimeId);
        if (index !== -1) {
          this.blockedTimes.splice(index, 1);
        }
        
        console.error('Error creando tiempo bloqueado:', error);
        this.snackBar.open('Error al bloquear el tiempo', 'Cerrar', {
          duration: 3000,
          panelClass: 'snackbar-error'
        });
      }
    });
    
    this.subscriptions.push(subscription);
  }

  private removeBlockedTime(blockedTime: BlockedTime): void {
    // Remover de la lista local inmediatamente
    const index = this.blockedTimes.findIndex(bt => bt.blockedTimeId === blockedTime.blockedTimeId);
    if (index !== -1) {
      this.blockedTimes.splice(index, 1);
    }
    
    // Si tiene un ID real (no temporal), eliminar del servidor
    if (!blockedTime.blockedTimeId.startsWith('temp-')) {
      const subscription = this.blockedTimeService.deleteBlockedTime(blockedTime.blockedTimeId).subscribe({
        next: () => {
         
        },
        error: (error) => {
          // Volver a agregar a la lista si falla la eliminación
          this.blockedTimes.push(blockedTime);
          
          console.error('Error eliminando tiempo bloqueado:', error);
          this.snackBar.open('Error al remover el tiempo bloqueado', 'Cerrar', {
            duration: 3000,
            panelClass: 'snackbar-error'
          });
        }
      });
      
      this.subscriptions.push(subscription);
    }
  }

  private generateTempId(): string {
    return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
    
    // Cargar tiempos bloqueados del servidor
    this.loadBlockedTimes();
    
    // TODO: Implementar carga de disponibilidad normal
    console.log('Cargando disponibilidad para estilista:', this.stylistId);
  }

  private loadBlockedTimes(): void {
    const subscription = this.blockedTimeService.getBlockedTimesByUser(this.stylistId).subscribe({
      next: (blockedTimes) => {
        this.blockedTimes = blockedTimes.filter(bt => bt.isActive);
      },
      error: (error) => {
        console.error('Error cargando tiempos bloqueados:', error);
        this.snackBar.open('Error al cargar tiempos bloqueados', 'Cerrar', {
          duration: 3000,
          panelClass: 'snackbar-error'
        });
      }
    });
    
    this.subscriptions.push(subscription);
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
    return this.blockedTimes.some(bt => {
      if (!bt.isActive) return false;
      
      const blockedDate = new Date(bt.blockedDate.year, bt.blockedDate.month - 1, bt.blockedDate.day);
      const isSameDate = blockedDate.toDateString() === date.toDateString();
      
      if (!isSameDate) return false;
      
      // Verificar si la hora está dentro del rango bloqueado
      const startHour = bt.startTime.hour;
      const endHour = bt.endTime.hour;
      
      return hour >= startHour && hour <= endHour;
    });
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
