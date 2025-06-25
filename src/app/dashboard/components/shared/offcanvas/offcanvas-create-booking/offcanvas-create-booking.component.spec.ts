import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffcanvasCreateBookingComponent } from './offcanvas-create-booking.component';

describe('OffcanvasCreateBookingComponent', () => {
  let component: OffcanvasCreateBookingComponent;
  let fixture: ComponentFixture<OffcanvasCreateBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OffcanvasCreateBookingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OffcanvasCreateBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
