import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalonsUpdateComponent } from './salons-update.component';

describe('SalonsUpdateComponent', () => {
  let component: SalonsUpdateComponent;
  let fixture: ComponentFixture<SalonsUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SalonsUpdateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SalonsUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
