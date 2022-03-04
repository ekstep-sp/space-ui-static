import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { QnaSpacePlatformTextComponent } from './components/qna-space-platform-text.component';


@NgModule({
  declarations: [QnaSpacePlatformTextComponent],
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
  exports:[QnaSpacePlatformTextComponent]
})
export class QnaSpacePlatformTextModule { }
