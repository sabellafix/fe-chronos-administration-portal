import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkelletonIconComponent } from './skelleton-icon.component';

describe('SkelletonIconComponent', () => {
  let component: SkelletonIconComponent;
  let fixture: ComponentFixture<SkelletonIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SkelletonIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SkelletonIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
