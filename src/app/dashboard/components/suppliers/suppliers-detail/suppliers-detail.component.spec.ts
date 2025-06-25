import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuppliersDetailComponent } from './suppliers-detail.component';

describe('SuppliersDetailComponent', () => {
  let component: SuppliersDetailComponent;
  let fixture: ComponentFixture<SuppliersDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SuppliersDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SuppliersDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
