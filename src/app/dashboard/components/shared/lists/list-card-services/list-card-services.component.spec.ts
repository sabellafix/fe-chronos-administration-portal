import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCardServicesComponent } from './list-card-services.component';

describe('ListCardServicesComponent', () => {
  let component: ListCardServicesComponent;
  let fixture: ComponentFixture<ListCardServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListCardServicesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListCardServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
