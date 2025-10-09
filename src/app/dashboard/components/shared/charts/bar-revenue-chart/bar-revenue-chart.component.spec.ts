import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarRevenueChartComponent } from './bar-revenue-chart.component';

describe('BarRevenueChartComponent', () => {
  let component: BarRevenueChartComponent;
  let fixture: ComponentFixture<BarRevenueChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BarRevenueChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BarRevenueChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
