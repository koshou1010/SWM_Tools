import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadRawdataComponent } from './download-rawdata.component';

describe('DownloadRawdataComponent', () => {
  let component: DownloadRawdataComponent;
  let fixture: ComponentFixture<DownloadRawdataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DownloadRawdataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadRawdataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
