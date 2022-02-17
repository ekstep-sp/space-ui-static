import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { WidgetResolverModule } from '@ws-widget/resolver'
import {
  MatButtonToggleModule,
  MatButtonModule,
  MatDividerModule,
  MatToolbarModule,
  MatIconModule,
  MatMenuModule,
  MatChipsModule,
  MatTooltipModule,
  MatProgressSpinnerModule,
} from '@angular/material'
import { QnaHomeComponent } from './components/qna-home/qna-home.component'
import { PipeLimitToModule, PipeCountTransformModule } from '@ws-widget/utils'
import { BtnPageBackModule, ErrorResolverModule, DialogSocialDeletePostModule } from '@ws-widget/collection'
import { QnaItemComponent } from './components/qna-item/qna-item.component'
import { QnaEditModule } from '../qna-edit/qna-edit.module'

@NgModule({
  declarations: [QnaHomeComponent, QnaItemComponent],
  imports: [
    CommonModule,
    RouterModule,
    WidgetResolverModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatDividerModule,
    MatToolbarModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    BtnPageBackModule,
    ErrorResolverModule,
    PipeLimitToModule,
    PipeCountTransformModule,
    DialogSocialDeletePostModule,
    QnaEditModule
  ],
})
export class QnaHomeModule { }
