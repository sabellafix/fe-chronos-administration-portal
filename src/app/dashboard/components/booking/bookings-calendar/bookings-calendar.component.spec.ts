import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingsCalendarComponent } from './bookings-calendar.component';

describe('BookingsCalendarComponent', () => {
  let component: BookingsCalendarComponent;
  let fixture: ComponentFixture<BookingsCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BookingsCalendarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BookingsCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
