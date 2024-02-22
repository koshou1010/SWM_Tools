import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysiologicalMonitorComponent } from './physiological-monitor.component';

describe('PhysiologicalMonitorComponent', () => {
  let component: PhysiologicalMonitorComponent;
  let fixture: ComponentFixture<PhysiologicalMonitorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhysiologicalMonitorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PhysiologicalMonitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
