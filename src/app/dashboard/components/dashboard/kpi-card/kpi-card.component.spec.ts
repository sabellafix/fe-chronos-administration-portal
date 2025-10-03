import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpiCardComponent } from './kpi-card.component';

describe('KpiCardComponent', () => {
  let component: KpiCardComponent;
  let fixture: ComponentFixture<KpiCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KpiCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KpiCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display title, value and change', () => {
    component.title = 'Test KPI';
    component.value = '100';
    component.change = '+10%';
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Test KPI');
    expect(compiled.textContent).toContain('100');
    expect(compiled.textContent).toContain('+10%');
  });

  it('should return correct icon class', () => {
    component.icon = 'revenue';
    expect(component.getIconClass()).toBe('bi-currency-dollar');
    
    component.icon = 'gauge';
    expect(component.getIconClass()).toBe('bi-speedometer2');
  });

  it('should return correct trend class', () => {
    component.trend = 'up';
    expect(component.getTrendClass()).toBe('text-success');
    
    component.trend = 'down';
    expect(component.getTrendClass()).toBe('text-danger');
  });
});
