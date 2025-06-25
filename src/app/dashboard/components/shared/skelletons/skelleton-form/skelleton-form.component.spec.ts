import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkelletonFormComponent } from './skelleton-form.component';

describe('SkelletonFormComponent', () => {
  let component: SkelletonFormComponent;
  let fixture: ComponentFixture<SkelletonFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SkelletonFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SkelletonFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
