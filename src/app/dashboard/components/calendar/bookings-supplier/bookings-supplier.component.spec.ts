import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingsSupplierComponent } from './bookings-supplier.component';

describe('BookingsSupplierComponent', () => {
  let component: BookingsSupplierComponent;
  let fixture: ComponentFixture<BookingsSupplierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BookingsSupplierComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BookingsSupplierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
