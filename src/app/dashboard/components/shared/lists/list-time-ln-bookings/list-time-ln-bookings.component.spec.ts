import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTimeLnBookingsComponent } from './list-time-ln-bookings.component';

describe('ListTimeLnBookingsComponent', () => {
  let component: ListTimeLnBookingsComponent;
  let fixture: ComponentFixture<ListTimeLnBookingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListTimeLnBookingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListTimeLnBookingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
