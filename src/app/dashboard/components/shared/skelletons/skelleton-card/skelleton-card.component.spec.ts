import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkelletonCardComponent } from './skelleton-card.component';

describe('SkelletonCardComponent', () => {
  let component: SkelletonCardComponent;
  let fixture: ComponentFixture<SkelletonCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SkelletonCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SkelletonCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
