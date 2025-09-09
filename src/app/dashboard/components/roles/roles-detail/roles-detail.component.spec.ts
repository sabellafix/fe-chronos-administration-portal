import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesDetailComponent } from './roles-detail.component';

describe('RolesDetailComponent', () => {
  let component: RolesDetailComponent;
  let fixture: ComponentFixture<RolesDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RolesDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RolesDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
