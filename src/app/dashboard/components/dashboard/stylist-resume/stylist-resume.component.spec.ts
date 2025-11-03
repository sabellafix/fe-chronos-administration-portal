import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StylistResumeComponent } from './stylist-resume.component';

describe('StylistResumeComponent', () => {
  let component: StylistResumeComponent;
  let fixture: ComponentFixture<StylistResumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StylistResumeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StylistResumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
