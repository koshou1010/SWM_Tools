import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeatinfotoolsComponent } from './beatinfotools.component';

describe('BeatinfotoolsComponent', () => {
  let component: BeatinfotoolsComponent;
  let fixture: ComponentFixture<BeatinfotoolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BeatinfotoolsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BeatinfotoolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
