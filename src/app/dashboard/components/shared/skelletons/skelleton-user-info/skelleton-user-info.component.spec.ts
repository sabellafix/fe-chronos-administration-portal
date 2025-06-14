import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkelletonUserInfoComponent } from './skelleton-user-info.component';

describe('SkelletonUserInfoComponent', () => {
  let component: SkelletonUserInfoComponent;
  let fixture: ComponentFixture<SkelletonUserInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SkelletonUserInfoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SkelletonUserInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
