import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenueActivityComponent } from './revenue-activity.component';

describe('RevenueActivityComponent', () => {
  let component: RevenueActivityComponent;
  let fixture: ComponentFixture<RevenueActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RevenueActivityComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RevenueActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
