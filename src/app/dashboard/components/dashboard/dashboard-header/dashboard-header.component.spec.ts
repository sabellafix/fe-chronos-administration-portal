import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardHeaderComponent } from './dashboard-header.component';
import { KpiCardComponent } from '../kpi-card/kpi-card.component';

describe('DashboardHeaderComponent', () => {
  let component: DashboardHeaderComponent;
  let fixture: ComponentFixture<DashboardHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardHeaderComponent, KpiCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit salon change', () => {
    spyOn(component.salonChange, 'emit');
    component.onSalonChange('salon-2');
    expect(component.salonChange.emit).toHaveBeenCalledWith('salon-2');
  });

  it('should format date correctly', () => {
    const date = new Date('2025-09-30');
    const formatted = component.formatDate(date);
    expect(formatted).toContain('30');
    expect(formatted).toContain('9');
  });
});
