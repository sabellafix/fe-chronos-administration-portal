import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StylistsStatusComponent } from './stylists-status.component';

describe('StylistsStatusComponent', () => {
  let component: StylistsStatusComponent;
  let fixture: ComponentFixture<StylistsStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StylistsStatusComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StylistsStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load stylists on init', () => {
    expect(component.stylists.length).toBe(5);
  });

  it('should get correct stylist initials', () => {
    const initials = component.getStylistInitials('Ana López');
    expect(initials).toBe('AL');
  });

  it('should get correct status config', () => {
    const config = component.getStatusConfig('available');
    expect(config.label).toBe('Disponible');
    expect(config.variant).toBe('success');
  });

  it('should get correct status icon', () => {
    const icon = component.getStatusIcon('busy');
    expect(icon).toBe('bi-clock-fill');
  });
});
