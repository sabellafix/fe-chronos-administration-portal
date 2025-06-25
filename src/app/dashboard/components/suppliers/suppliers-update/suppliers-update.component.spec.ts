import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuppliersUpdateComponent } from './suppliers-update.component';

describe('SuppliersUpdateComponent', () => {
  let component: SuppliersUpdateComponent;
  let fixture: ComponentFixture<SuppliersUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SuppliersUpdateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SuppliersUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
