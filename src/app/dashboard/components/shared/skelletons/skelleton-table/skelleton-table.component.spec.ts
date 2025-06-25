import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkelletonTableComponent } from './skelleton-table.component';

describe('SkelletonTableComponent', () => {
  let component: SkelletonTableComponent;
  let fixture: ComponentFixture<SkelletonTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SkelletonTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SkelletonTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
