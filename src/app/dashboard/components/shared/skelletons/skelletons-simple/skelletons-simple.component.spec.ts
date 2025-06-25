import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkelletonsSimpleComponent } from './skelletons-simple.component';

describe('SkelletonsSimpleComponent', () => {
  let component: SkelletonsSimpleComponent;
  let fixture: ComponentFixture<SkelletonsSimpleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SkelletonsSimpleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SkelletonsSimpleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
