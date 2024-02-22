import { Component, OnInit, ViewChild } from '@angular/core';
import {ChangeDetectorRef, OnDestroy} from '@angular/core';
import {MediaMatcher} from '@angular/cdk/layout';
import {MatSidenav} from '@angular/material/sidenav';
import { MatExpansionPanel } from '@angular/material/expansion';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('_panel') _panel!: MatExpansionPanel;
  mobileQuery: MediaQueryList;
  listItems = [
    { linkTitle: 'Beatinfo 小工具', childList:["Rawdata下載器", "報告產生器"], link: ['/beatinfoTools/downloadRawdata', ''] },
    { linkTitle: '休閒娛樂', childList:[], link: [] },
  ];
  isPhysiologicalMonitorActive: boolean = false;
  private _mobileQueryListener: () => void;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private router: Router
    ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isPhysiologicalMonitorActive = event.url === '/';
      }
    });
  }

  @ViewChild('snav') sidenav!: MatSidenav;
  close() {
    this._panel.close();
    this.sidenav.close();
  }
  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  ngOnInit(): void {

  }

}
