import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  AbstractControl,
  ValidatorFn,
} from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { MatProgressBar } from '@angular/material/progress-bar';
import { of, timer } from 'rxjs';
import { take, delayWhen, delay, finalize, concatMap } from 'rxjs/operators';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { MAT_DATE_RANGE_SELECTION_STRATEGY } from '@angular/material/datepicker';
import { MaxRangeSelectionStrategy } from 'src/app/_share/app-material/date-range-picker-selection-strategy';
import { WebsocketService } from 'src/app/_services/websocket.service';
import { environment } from 'src/environments/environment';

export function timestampValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const timestamp = control.value;

    if (timestamp == null) {
      return null;
    }
    if (isNaN(timestamp) || timestamp < 0 || timestamp > new Date().getTime()) {
      return { invalidTimestamp: { value: control.value } };
    }
    const timestampString = timestamp.toString();
    if (timestampString.length !== 13) {
      return { invalidTimestampFormat: { value: control.value } };
    }
    return null;
  };
}

@Component({
  selector: 'app-download-rawdata',
  templateUrl: './download-rawdata.component.html',
  styleUrls: ['./download-rawdata.component.scss'],
  providers: [
    { provide: 'rangeMax', useValue: 30 },
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: MaxRangeSelectionStrategy,
    },
  ],
})
export class DownloadRawdataComponent implements OnInit {
  formgp!: FormGroup;

  startDateFilter = (d: Date | null): boolean => {
    const day = d || new Date();
    const today = new Date();
    return day <= today;
  };

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private webSocketService: WebsocketService
  ) {
    this.formgp = fb.group({
      uuId: new FormControl('', [Validators.required, Validators.min(1)]),
      start: new FormControl(new Date(new Date().setHours(0, 0, 0, 0))),
      end: new FormControl(new Date()),
    });
  }

  fieldType: 'text' | 'date' = 'date';
  toggleFieldType() {
    this.formgp.reset();
    this.fieldType = this.fieldType === 'text' ? 'date' : 'text';

    if (this.fieldType === 'date') {
      this.formgp = this.fb.group({
        uuId: new FormControl('', [Validators.required, Validators.min(1)]),
        start: [''],
        end: [''],
      });
    } else if (this.fieldType === 'text') {
      this.formgp = this.fb.group({
        uuId: new FormControl('', [Validators.required, Validators.min(1)]),
        start: ['', [Validators.required, timestampValidator()]],
      });
    }
  }

  updateQueryForm(event: any) {
    this.startQuery = false;
    this.queryEnd = false;
    this.queryResult = false;
    this.queryDateArray = [];
    this.startDownloadFlag = false;
    this.downloadEnd = false;
  }

  color: ThemePalette = 'primary';
  value = 0;
  progressMax = 0;
  startQuery = false;
  queryEnd = false;
  startDownloadFlag = false;
  downloadEnd = false;
  queryResult = false;
  subTest: any;
  queryDateArray: Array<string> = [];
  queryTsArray: Array<number> = [];
  startswithStr: string = '';
  downloadFilename = '';

  resetParams() {
    this.startQuery = false;
    this.queryEnd = false;
    this.queryResult = false;
    this.queryDateArray = [];
    this.queryTsArray = [];
    this.startDownloadFlag = false;
    this.downloadEnd = false;
    this.value = 0;
    this.startswithStr = '';
    this.downloadFilename = '';
  }

  query() {
    this.startQuery = true;
    if (this.fieldType === 'date') {
      this.postQueryData();
    } else if (this.fieldType === 'text') {
      this.getQueryData();
    }
  }

  startDownload() {
    if (this.fieldType === 'date') {
      this.postDownloadData(false);
    } else if (this.fieldType === 'text') {
      this.postDownloadData(true);
    }
    this.startDownloadFlag = true;
  }

  stop() {
    this.subTest.unsubscribe();
  }
  getQueryData() {
    const params = new HttpParams()
      .set('uuId', this.formgp.value.uuId)
      .set('start_tt', this.formgp.value.start);
    const url = `${environment.apiUrl}/download_rawdata/query/`;
    this.http.get<any>(url, { params: params }).subscribe((res) => {
      this.queryEnd = true;
      if (res.status) {
        res.data.forEach((element: any) => {
          this.queryTsArray.push(element);
        });
        this.startswithStr = res.startswith_str;
        this.queryResult = true;
      }
    });
  }

  postQueryData() {
    const url = `${environment.apiUrl}/download_rawdata/query/`;
    let data = JSON.parse(JSON.stringify(this.formgp.value));
    data.start = new Date(data.start).getTime();
    data.end = new Date(data.end).getTime() + (1 * 24 * 60 * 60 * 1000 - 1); // to 23:59 of end day
    let body = data;
    this.http.post<any>(url, body).subscribe((res) => {
      this.queryEnd = true;
      if (res.status) {
        res.data.forEach((element: any) => {
          this.queryDateArray.push(element);
        });
        this.startswithStr = res.startswith_str;
        this.queryResult = true;
      }
    });
  }

  postDownloadData(byEvent: boolean) {
    let body = {
      uuId: '',
      start_dt: '',
      start_ts: 0,
      end_dt: '',
      end_ts: 0,
      startswith_str: this.startswithStr,
      byEvent: byEvent,
    };
    body.uuId = this.formgp.value.uuId;
    if (byEvent) {
      body.start_ts = this.queryTsArray[0];
      body.end_ts = this.queryTsArray[this.queryTsArray.length - 1];
    } else {
      body.start_dt = this.queryDateArray[0];
      body.end_dt = this.queryDateArray[this.queryDateArray.length - 1];
    }
    const url = `${environment.apiUrl}/download_rawdata/download/`;
    this.http.post<any>(url, body).subscribe((res) => {
      this.progressMax = res.progress_bar_max;
    });
  }

  getDownloadFile() {
    const params = new HttpParams().set('filename', this.downloadFilename);
    const url = `${environment.apiUrl}/download_rawdata/download/`;
    this.http
      .get(url, { params: params, responseType: 'blob', observe: 'response' })
      .subscribe((res: HttpResponse<Blob>) => {
        const blob = new Blob([res.body!], { type: 'application/zip' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.downloadFilename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      });
  }

  setProgressBarValue() {
    const smoothPara = 30;
    const step = 1000 / smoothPara;
    const stepCostTime = 6 * smoothPara;
    timer(0, step)
      .pipe(
        take(stepCostTime),
        finalize(() => {
          if (Number(this.value.toFixed(2)) == 100) {
            this.downloadEnd = true;
          }
        })
      )
      .subscribe((i) => {
        this.value = this.value + ((1 / this.progressMax) * 100) / stepCostTime;
      });
  }

  ngOnInit(): void {
    this.webSocketService.getMessage().subscribe(
      (msg) => {
        if (msg.message.hasOwnProperty('process')) {
          const testSub = this.setProgressBarValue();
        }
        if (msg.message.hasOwnProperty('final_filename')) {
          this.downloadFilename = msg.message.final_filename;
        }
      },
      (error) => {}
    );
  }
}
