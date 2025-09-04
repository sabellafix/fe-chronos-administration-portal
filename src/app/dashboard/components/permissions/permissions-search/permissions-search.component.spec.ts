import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionsSearchComponent } from './permissions-search.component';

describe('PermissionsSearchComponent', () => {
  let component: PermissionsSearchComponent;
  let fixture: ComponentFixture<PermissionsSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PermissionsSearchComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PermissionsSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
