import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { SalonStateService } from '@app/core/services/shared/salon-state.service';
import { Salon } from '@app/core/models/bussiness/salon';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  selectedSalon: Salon | null = null;
  dateFilter: Date = new Date();
  currentView: 'calendar' | 'chart' = 'chart';
  loading: boolean = false;

  private destroy$: Subject<void> = new Subject<void>();

  constructor(private salonStateService: SalonStateService) {
  }

  ngOnInit(): void {
    this.salonStateService.selectedSalon$
      .pipe(takeUntil(this.destroy$))
      .subscribe(salon => {
        if(salon != null){
          this.selectedSalon = salon;
          this.selectedSalon.name = this.selectedSalon.name;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  switchView(view: 'calendar' | 'chart'): void {
    this.currentView = view;
  }

  onDateChange(date: Date): void {
    this.dateFilter = date;
  }
}
