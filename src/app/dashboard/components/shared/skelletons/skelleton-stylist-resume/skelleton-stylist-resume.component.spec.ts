import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkelletonStylistResumeComponent } from './skelleton-stylist-resume.component';

describe('SkelletonStylistResumeComponent', () => {
  let component: SkelletonStylistResumeComponent;
  let fixture: ComponentFixture<SkelletonStylistResumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SkelletonStylistResumeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SkelletonStylistResumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
