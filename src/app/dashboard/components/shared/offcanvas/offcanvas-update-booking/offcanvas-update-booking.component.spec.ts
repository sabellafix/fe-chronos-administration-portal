import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffcanvasUpdateBookingComponent } from './offcanvas-update-booking.component';

describe('OffcanvasUpdateBookingComponent', () => {
  let component: OffcanvasUpdateBookingComponent;
  let fixture: ComponentFixture<OffcanvasUpdateBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OffcanvasUpdateBookingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OffcanvasUpdateBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
