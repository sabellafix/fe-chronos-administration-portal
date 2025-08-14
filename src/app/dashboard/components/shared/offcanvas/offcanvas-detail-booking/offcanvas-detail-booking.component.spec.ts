import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffcanvasDetailBookingComponent } from './offcanvas-detail-booking.component';

describe('OffcanvasDetailBookingComponent', () => {
  let component: OffcanvasDetailBookingComponent;
  let fixture: ComponentFixture<OffcanvasDetailBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OffcanvasDetailBookingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OffcanvasDetailBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
