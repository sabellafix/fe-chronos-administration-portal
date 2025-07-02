import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingsFloorComponent } from './bookings-floor.component';

describe('BookingsFloorComponent', () => {
  let component: BookingsFloorComponent;
  let fixture: ComponentFixture<BookingsFloorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BookingsFloorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BookingsFloorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
