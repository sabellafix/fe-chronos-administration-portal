import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompaniesUpdateComponent } from './companies-update.component';

describe('CompaniesUpdateComponent', () => {
  let component: CompaniesUpdateComponent;
  let fixture: ComponentFixture<CompaniesUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CompaniesUpdateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CompaniesUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
