import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkelletonCalendarMonthlyComponent } from './skelleton-calendar-monthly.component';

describe('SkelletonCalendarMonthlyComponent', () => {
  let component: SkelletonCalendarMonthlyComponent;
  let fixture: ComponentFixture<SkelletonCalendarMonthlyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SkelletonCalendarMonthlyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SkelletonCalendarMonthlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
