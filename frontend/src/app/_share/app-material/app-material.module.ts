import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatNativeDateModule} from '@angular/material/core';
import {MatCardModule} from '@angular/material/card'
import {MatSliderModule} from '@angular/material/slider'
import {MatTabsModule} from '@angular/material/tabs'
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatGridListModule} from '@angular/material/grid-list';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatSelectModule,
    MatFormFieldModule,
    MatListModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatCardModule,
    MatSliderModule,
    MatTabsModule,
    MatTooltipModule,
    MatGridListModule,
  ],
  exports: [
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatSelectModule,
    MatFormFieldModule,
    MatListModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatCardModule,
    MatSliderModule,
    MatTabsModule,
    MatTooltipModule,
    MatGridListModule,
  ],
  providers: [

  ],
})
export class AppMaterialModule { }
