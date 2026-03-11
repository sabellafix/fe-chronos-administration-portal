import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalonsDetailComponent } from './salons-detail.component';

describe('SalonsDetailComponent', () => {
  let component: SalonsDetailComponent;
  let fixture: ComponentFixture<SalonsDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SalonsDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SalonsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
