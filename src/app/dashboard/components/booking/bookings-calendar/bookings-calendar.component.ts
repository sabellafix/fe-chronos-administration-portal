import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-bookings-calendar',
  templateUrl: './bookings-calendar.component.html',
  styleUrl: './bookings-calendar.component.scss'
})
export class BookingsCalendarComponent implements OnInit, OnDestroy {

  tabs: string[] = ['Month', 'Week', 'Day', 'Suppliers', 'Floor'];
  tabActive: string = 'Suppliers';
  tabIndex: number = 1;
  dateNow: Date = new Date();
  dateCalendarDaily: Date = new Date();
  dateBookingsSupplier: Date = new Date();
  private scrollListener?: () => void;

  ngOnInit(): void {
    this.initStickyHeader();
  }

  ngOnDestroy(): void {
    if (this.scrollListener) {
      window.removeEventListener("scroll", this.scrollListener);
    }
  }

  private initStickyHeader(): void {
    const calendarHeader = document.getElementById("calendar-header");
    if (calendarHeader) {
      this.scrollListener = () => {
        const scrollPosition = window.scrollY;
        if (scrollPosition >= 30) {
          calendarHeader.classList.add("sticky");
        } else {
          calendarHeader.classList.remove("sticky");
        }
      };
      
      window.addEventListener("scroll", this.scrollListener);
    }
  }

  onTabChanged(tab: string): void {
    this.tabActive = tab;
    this.tabIndex = this.tabs.indexOf(tab);
  } 


   changeDateCalendarDaily(isLeft: boolean): void {
    if(isLeft){
      this.dateCalendarDaily = new Date(this.dateCalendarDaily.setDate(this.dateCalendarDaily.getDate() - 1));
    }else{
      this.dateCalendarDaily = new Date(this.dateCalendarDaily.setDate(this.dateCalendarDaily.getDate() + 1));
    }
   }  

   setTodayDateCalendarDaily(): void {
    this.dateCalendarDaily = new Date();
   }



   changeDateBookingsSupplier(isLeft: boolean): void {
    if(isLeft){
      this.dateBookingsSupplier = new Date(this.dateBookingsSupplier.setDate(this.dateBookingsSupplier.getDate() - 1));
    }else{
      this.dateBookingsSupplier = new Date(this.dateBookingsSupplier.setDate(this.dateBookingsSupplier.getDate() + 1));
    }
   }
   
   setTodayDateBookingsSupplier(): void {
    this.dateBookingsSupplier = new Date();
   }
}
