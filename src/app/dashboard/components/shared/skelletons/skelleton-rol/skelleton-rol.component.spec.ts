import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkelletonRolComponent } from './skelleton-rol.component';

describe('SkelletonRolComponent', () => {
  let component: SkelletonRolComponent;
  let fixture: ComponentFixture<SkelletonRolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SkelletonRolComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SkelletonRolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
