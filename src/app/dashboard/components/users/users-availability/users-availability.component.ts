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
  
  // Arrays para manejar cambios temporales
  blockedTimesToCreate: BlockedTime[] = [];
  blockedTimesToDelete: BlockedTime[] = [];
  
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
    
    this.toggleIndividualAvailability(date, hour);
  }

  onHourCellClick(hour: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (this.tabActive === 'Blocked') {
      this.toggleWeeklyBlockedTime(hour);
    }
  }

  onDayHeaderClick(date: Date, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (this.tabActive === 'Blocked') {
      this.toggleDailyBlockedTime(date);
    }
  }

  private toggleIndividualAvailability(date: Date, hour: number): void {
    if (this.tabActive === 'Blocked') {
      this.toggleBlockedTime(date, hour);
    } else {
    }
  }

  private toggleWeeklyBlockedTime(hour: number): void {
    const hasAnyBlockedTimeForHour = this.dates.some(dateItem => 
      this.findBlockedTime(dateItem.date, hour) !== undefined
    );

    if (hasAnyBlockedTimeForHour) {
      this.removeWeeklyBlockedTime(hour);
    } else {
      this.addWeeklyBlockedTime(hour);
    }
  }

  private toggleBlockedTime(date: Date, hour: number): void {
    const existingBlockedTime = this.findBlockedTime(date, hour);
    
    if (existingBlockedTime) {
      this.removeBlockedTime(existingBlockedTime);
    } else {
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
    
    newBlockedTime.blockedDate = new DateOnly();
    newBlockedTime.blockedDate.year = date.getFullYear();
    newBlockedTime.blockedDate.month = date.getMonth() + 1;
    newBlockedTime.blockedDate.day = date.getDate();
    newBlockedTime.blockedDate.dayOfWeek = date.getDay();
    
    newBlockedTime.startTime = new TimeOnly();
    newBlockedTime.startTime.hour = hour;
    newBlockedTime.startTime.minute = 0;
    
    newBlockedTime.endTime = new TimeOnly();
    newBlockedTime.endTime.hour = hour;
    newBlockedTime.endTime.minute = 59;
    
    newBlockedTime.reason = 'Bloqueado desde calendario';
    newBlockedTime.isActive = true;
    newBlockedTime.createdAt = new Date().toISOString();
    
    // Solo actualizar lista local
    this.blockedTimes.push(newBlockedTime);
    this.blockedTimesToCreate.push(newBlockedTime);
  }

  private removeBlockedTime(blockedTime: BlockedTime): void {
    // Remover de la lista local
    const index = this.blockedTimes.findIndex(bt => bt.blockedTimeId === blockedTime.blockedTimeId);
    if (index !== -1) {
      this.blockedTimes.splice(index, 1);
    }
    
    // Si es un tiempo bloqueado temporal (recién creado), solo removerlo de la lista de creación
    if (blockedTime.blockedTimeId.startsWith('temp-')) {
      const createIndex = this.blockedTimesToCreate.findIndex(bt => bt.blockedTimeId === blockedTime.blockedTimeId);
      if (createIndex !== -1) {
        this.blockedTimesToCreate.splice(createIndex, 1);
      }
    } else {
      // Si es un tiempo bloqueado existente, agregarlo a la lista de eliminación
      this.blockedTimesToDelete.push(blockedTime);
    }
  }

  private addWeeklyBlockedTime(hour: number): void {
    this.dates.forEach(dateItem => {
      const existingBlockedTime = this.findBlockedTime(dateItem.date, hour);
      if (!existingBlockedTime) {
        this.addBlockedTime(dateItem.date, hour);
      }
    });
  }

  private removeWeeklyBlockedTime(hour: number): void {
    const blockedTimesToRemove: BlockedTime[] = [];
    
    this.dates.forEach(dateItem => {
      const existingBlockedTime = this.findBlockedTime(dateItem.date, hour);
      if (existingBlockedTime) {
        blockedTimesToRemove.push(existingBlockedTime);
      }
    });

    blockedTimesToRemove.forEach(blockedTime => {
      this.removeBlockedTime(blockedTime);
    });
  }

  private toggleDailyBlockedTime(date: Date): void {
    const hasAnyBlockedTimeForDay = this.getHoursRange().some(hour => 
      this.findBlockedTime(date, hour) !== undefined
    );

    if (hasAnyBlockedTimeForDay) {
      this.removeDailyBlockedTime(date);
    } else {
      this.addDailyBlockedTime(date);
    }
  }

  private addDailyBlockedTime(date: Date): void {
    this.getHoursRange().forEach(hour => {
      const existingBlockedTime = this.findBlockedTime(date, hour);
      if (!existingBlockedTime) {
        this.addBlockedTime(date, hour);
      }
    });
  }

  private removeDailyBlockedTime(date: Date): void {
    const blockedTimesToRemove: BlockedTime[] = [];
    
    this.getHoursRange().forEach(hour => {
      const existingBlockedTime = this.findBlockedTime(date, hour);
      if (existingBlockedTime) {
        blockedTimesToRemove.push(existingBlockedTime);
      }
    });

    blockedTimesToRemove.forEach(blockedTime => {
      this.removeBlockedTime(blockedTime);
    });
  }

  saveBlockedTimes(): void {
    const totalChanges = this.blockedTimesToCreate.length + this.blockedTimesToDelete.length;
    
    if (totalChanges === 0) {
      this.snackBar.open('No hay cambios para guardar', 'Cerrar', {
        duration: 2000,
        panelClass: 'snackbar-info'
      });
      return;
    }

    let completedOperations = 0;
    let hasErrors = false;

    const checkCompletion = () => {
      completedOperations++;
      if (completedOperations === totalChanges) {
        if (!hasErrors) {
          this.snackBar.open('Cambios guardados exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: 'snackbar-success'
          });
          // Limpiar arrays temporales
          this.blockedTimesToCreate = [];
          this.blockedTimesToDelete = [];
        }
      }
    };

    // Crear nuevos tiempos bloqueados
    this.blockedTimesToCreate.forEach(blockedTime => {
      const createDto = new CreateBlockedTimeDto();
      createDto.userId = this.stylistId;
      createDto.blockedDate = blockedTime.blockedDate;
      createDto.startTime = blockedTime.startTime;
      createDto.endTime = blockedTime.endTime;
      createDto.reason = blockedTime.reason || 'Bloqueado desde calendario';

      const subscription = this.blockedTimeService.createBlockedTime(createDto).subscribe({
        next: (response) => {
          // Actualizar el ID temporal con el ID real
          const index = this.blockedTimes.findIndex(bt => bt.blockedTimeId === blockedTime.blockedTimeId);
          if (index !== -1) {
            this.blockedTimes[index] = response;
          }
          checkCompletion();
        },
        error: (error) => {
          hasErrors = true;
          console.error('Error creando tiempo bloqueado:', error);
          this.snackBar.open('Error al guardar algunos cambios', 'Cerrar', {
            duration: 3000,
            panelClass: 'snackbar-error'
          });
          checkCompletion();
        }
      });

      this.subscriptions.push(subscription);
    });

    // Eliminar tiempos bloqueados
    this.blockedTimesToDelete.forEach(blockedTime => {
      const subscription = this.blockedTimeService.deleteBlockedTime(blockedTime.blockedTimeId).subscribe({
        next: () => {
          checkCompletion();
        },
        error: (error) => {
          hasErrors = true;
          // Restaurar el tiempo bloqueado en caso de error
          this.blockedTimes.push(blockedTime);
          console.error('Error eliminando tiempo bloqueado:', error);
          this.snackBar.open('Error al eliminar algunos tiempos bloqueados', 'Cerrar', {
            duration: 3000,
            panelClass: 'snackbar-error'
          });
          checkCompletion();
        }
      });

      this.subscriptions.push(subscription);
    });
  }

  hasPendingChanges(): boolean {
    return this.blockedTimesToCreate.length > 0 || this.blockedTimesToDelete.length > 0;
  }

  getPendingChangesCount(): number {
    return this.blockedTimesToCreate.length + this.blockedTimesToDelete.length;
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
    this.loadBlockedTimes();
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
      return 'assets/images/users/user1.jpg'; 
    }
    return this.stylist.photo;
  }

  hasAvailability(date: Date, hour: number): boolean {
    return false;
  }

  isBlocked(date: Date, hour: number): boolean {
    return this.blockedTimes.some(bt => {
      if (!bt.isActive) return false;
      
      const blockedDate = new Date(bt.blockedDate.year, bt.blockedDate.month - 1, bt.blockedDate.day);
      const isSameDate = blockedDate.toDateString() === date.toDateString();
      
      if (!isSameDate) return false;
      
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
