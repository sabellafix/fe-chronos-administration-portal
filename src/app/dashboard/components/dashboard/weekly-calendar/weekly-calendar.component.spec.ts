import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WeeklyCalendarComponent } from './weekly-calendar.component';

describe('WeeklyCalendarComponent', () => {
  let component: WeeklyCalendarComponent;
  let fixture: ComponentFixture<WeeklyCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WeeklyCalendarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WeeklyCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate 16 time slots', () => {
    expect(component.timeSlots.length).toBe(16);
    expect(component.timeSlots[0]).toBe('06:00');
    expect(component.timeSlots[15]).toBe('21:00');
  });

  it('should generate 7 week days', () => {
    expect(component.weekDays.length).toBe(7);
  });

  it('should navigate to next week', () => {
    const currentWeek = new Date(component.currentWeek);
    component.navigateWeek('next');
    const daysDiff = Math.floor((component.currentWeek.getTime() - currentWeek.getTime()) / (1000 * 60 * 60 * 24));
    expect(daysDiff).toBe(7);
  });

  it('should navigate to previous week', () => {
    const currentWeek = new Date(component.currentWeek);
    component.navigateWeek('prev');
    const daysDiff = Math.floor((currentWeek.getTime() - component.currentWeek.getTime()) / (1000 * 60 * 60 * 24));
    expect(daysDiff).toBe(7);
  });
});
