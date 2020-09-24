import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PublicAboutComponent } from './public-about.component'
import {
  MatToolbarModule,
  MatDividerModule,
  MatExpansionModule,
  MatIconModule,
  MatCardModule,
  MatButtonModule,
  MatDialogModule,
} from '@angular/material'
import { BtnPageBackModule } from '@ws-widget/collection'
import { HorizontalScrollerModule, PipeSafeSanitizerModule } from '@ws-widget/utils'
import { WidgetResolverModule } from '../../../../../library/ws-widget/resolver/src/public-api'
import { FullscreenOverlayContainer, OverlayContainer, OverlayModule } from '@angular/cdk/overlay'
import { VideoRendererComponent } from '../video-renderer/video-renderer.component'

@NgModule({
  declarations: [PublicAboutComponent],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatDividerModule,
    MatExpansionModule,
    MatIconModule,
    MatCardModule,
    BtnPageBackModule,
    MatButtonModule,
    WidgetResolverModule,
    HorizontalScrollerModule,
    PipeSafeSanitizerModule,
    OverlayModule,
    MatDialogModule,
  ],
  entryComponents: [VideoRendererComponent],
  exports: [PublicAboutComponent],
  providers: [{ provide: OverlayContainer, useClass: FullscreenOverlayContainer }],
})
export class PublicAboutModule {}
