import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { BeatinfotoolsComponent } from '../beatinfotools/beatinfotools.component';
import { DownloadRawdataComponent } from './../beatinfotools/download-rawdata/download-rawdata.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: 'beatinfoTools',
        component: BeatinfotoolsComponent,
        children: [
          {
            path: 'downloadRawdata',
            component: DownloadRawdataComponent,
          },
        ]
      },
    ]
  }
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
