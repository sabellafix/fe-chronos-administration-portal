import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarOcupationChartComponent } from './bar-ocupation-chart.component';

describe('BarOcupationChartComponent', () => {
  let component: BarOcupationChartComponent;
  let fixture: ComponentFixture<BarOcupationChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BarOcupationChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BarOcupationChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
