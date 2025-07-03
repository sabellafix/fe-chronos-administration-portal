import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-bookings-calendar',
  templateUrl: './bookings-calendar.component.html',
  styleUrl: './bookings-calendar.component.scss'
})
export class BookingsCalendarComponent implements OnInit, OnDestroy {

  tabs: string[] = ['Month', 'Week', 'Day', 'Floor'];
  tabActive: string = 'Week';
  tabIndex: number = 1;
  dateNow: Date = new Date();
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
}
