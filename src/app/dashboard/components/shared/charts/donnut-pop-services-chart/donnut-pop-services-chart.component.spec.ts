import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonnutPopServicesChartComponent } from './donnut-pop-services-chart.component';

describe('DonnutPopServicesChartComponent', () => {
  let component: DonnutPopServicesChartComponent;
  let fixture: ComponentFixture<DonnutPopServicesChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DonnutPopServicesChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DonnutPopServicesChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
