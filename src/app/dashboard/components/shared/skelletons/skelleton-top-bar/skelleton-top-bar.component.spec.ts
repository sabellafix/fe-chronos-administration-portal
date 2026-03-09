import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkelletonTopBarComponent } from './skelleton-top-bar.component';

describe('SkelletonTopBarComponent', () => {
  let component: SkelletonTopBarComponent;
  let fixture: ComponentFixture<SkelletonTopBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SkelletonTopBarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SkelletonTopBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
