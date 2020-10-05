import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PublicHeaderComponent } from './public-header.component'
import { BtnPageBackMobileModule } from '@ws-widget/collection/src/lib/btn-page-back-mobile/btn-page-back-mobile.module'
import { MatIconModule, MatToolbarModule, MatMenuModule, MatButtonModule, MatTooltipModule } from '@angular/material'
import { BtnFeatureModule } from '@ws-widget/collection/src/public-api'
import { RouterModule } from '@angular/router'

@NgModule({
  declarations: [PublicHeaderComponent],
  imports: [
    CommonModule,
    BtnPageBackMobileModule,
    MatIconModule,
    BtnFeatureModule,
    MatToolbarModule,
    MatMenuModule,
    MatButtonModule,
    MatTooltipModule,
    RouterModule,
  ],
  exports: [
    PublicHeaderComponent,
  ],
})
export class PublicHeaderModule {
 }
