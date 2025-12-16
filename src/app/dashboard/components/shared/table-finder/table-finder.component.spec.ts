import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableFinderComponent } from './table-finder.component';

describe('TableFinderComponent', () => {
  let component: TableFinderComponent;
  let fixture: ComponentFixture<TableFinderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableFinderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TableFinderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
