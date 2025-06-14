import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkelletonLoginComponent } from './skelleton-login.component';

describe('SkelletonLoginComponent', () => {
  let component: SkelletonLoginComponent;
  let fixture: ComponentFixture<SkelletonLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkelletonLoginComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SkelletonLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
