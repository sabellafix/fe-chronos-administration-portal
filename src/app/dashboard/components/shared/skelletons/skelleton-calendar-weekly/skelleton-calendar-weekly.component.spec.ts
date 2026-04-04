import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkelletonCalendarWeeklyComponent } from './skelleton-calendar-weekly.component';

describe('SkelletonCalendarWeeklyComponent', () => {
  let component: SkelletonCalendarWeeklyComponent;
  let fixture: ComponentFixture<SkelletonCalendarWeeklyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SkelletonCalendarWeeklyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SkelletonCalendarWeeklyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
