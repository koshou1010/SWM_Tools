import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EchartsWrapperComponent } from './echarts-wrapper.component';

describe('EchartsWrapperComponent', () => {
  let component: EchartsWrapperComponent;
  let fixture: ComponentFixture<EchartsWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EchartsWrapperComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EchartsWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
