import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkelletonBarRevenueChartComponent } from './skelleton-bar-revenue-chart.component';

describe('SkelletonBarRevenueChartComponent', () => {
  let component: SkelletonBarRevenueChartComponent;
  let fixture: ComponentFixture<SkelletonBarRevenueChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SkelletonBarRevenueChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SkelletonBarRevenueChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
