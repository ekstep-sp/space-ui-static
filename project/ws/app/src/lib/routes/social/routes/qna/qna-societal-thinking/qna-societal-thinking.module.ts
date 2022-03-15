import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QnaSocietalThinkingComponent } from './components/qna-societal-thinking.component';
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
  MatExpansionModule,
} from '@angular/material'
import { WidgetResolverModule } from '@ws-widget/resolver'
import { BtnPageBackModule, ErrorResolverModule, DialogSocialDeletePostModule } from '@ws-widget/collection'


@NgModule({
  declarations: [QnaSocietalThinkingComponent],
  imports: [
    CommonModule,
    WidgetResolverModule,
    ErrorResolverModule,
    DialogSocialDeletePostModule,
    BtnPageBackModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatDividerModule,
    MatToolbarModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
  ],
  exports:[QnaSocietalThinkingComponent]
})
export class QnaSocietalThinkingModule { }
