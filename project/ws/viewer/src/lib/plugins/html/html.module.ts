import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import {
  MatCardModule,
  MatButtonModule,
  MatDividerModule,
  MatProgressSpinnerModule,
  MatProgressBarModule,
  MatSnackBarModule,
  MatIconModule,
  MatTooltipModule,
} from '@angular/material'

import { HtmlComponent } from './html.component'
import { RouterModule } from '@angular/router'
import { SharedModule } from '@ws/author/src/lib/modules/shared/shared.module'

@NgModule({
  declarations: [HtmlComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatIconModule,
    RouterModule,
    MatTooltipModule,
    SharedModule,
  ],
  exports: [
    HtmlComponent,
  ],
})
export class HtmlModule { }
