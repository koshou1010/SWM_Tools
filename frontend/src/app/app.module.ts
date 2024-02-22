import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './home/home.component';
import { AppMaterialModule } from './_share/app-material/app-material.module';
import { BeatinfotoolsComponent } from './beatinfotools/beatinfotools.component';
import { DownloadRawdataComponent } from './beatinfotools/download-rawdata/download-rawdata.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { WebsocketService } from './_services/websocket.service';
import { ButtonDirective } from './_components/button.directive';
import { PhysiologicalMonitorComponent } from './physiological-monitor/physiological-monitor.component';
import { EchartsWrapperComponent } from './echarts-wrapper/echarts-wrapper.component';



@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    BeatinfotoolsComponent,
    DownloadRawdataComponent,
    ButtonDirective,
    PhysiologicalMonitorComponent,
    EchartsWrapperComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AppMaterialModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [WebsocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
