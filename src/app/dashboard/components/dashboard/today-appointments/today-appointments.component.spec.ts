import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodayAppointmentsComponent } from './today-appointments.component';

describe('TodayAppointmentsComponent', () => {
  let component: TodayAppointmentsComponent;
  let fixture: ComponentFixture<TodayAppointmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TodayAppointmentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TodayAppointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load appointments on init', () => {
    expect(component.appointments.length).toBe(5);
  });

  it('should calculate total revenue correctly', () => {
    const total = component.getTotalRevenue();
    expect(total).toBe(245); // 45 + 85 + 25 + 35 + 55
  });

  it('should calculate remaining appointments correctly', () => {
    const remaining = component.getRemainingAppointments();
    expect(remaining).toBe(4); // confirmed + pending
  });

  it('should get correct status config', () => {
    const config = component.getStatusConfig('confirmed');
    expect(config.label).toBe('Confirmada');
    expect(config.variant).toBe('primary');
  });
});
