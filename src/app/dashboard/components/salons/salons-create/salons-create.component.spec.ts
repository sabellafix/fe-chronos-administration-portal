import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalonsCreateComponent } from './salons-create.component';

describe('SalonsCreateComponent', () => {
  let component: SalonsCreateComponent;
  let fixture: ComponentFixture<SalonsCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SalonsCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SalonsCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
