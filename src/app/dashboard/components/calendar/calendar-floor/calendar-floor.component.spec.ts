import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarFloorComponent } from './calendar-floor.component';

describe('CalendarFloorComponent', () => {
  let component: CalendarFloorComponent;
  let fixture: ComponentFixture<CalendarFloorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CalendarFloorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CalendarFloorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
