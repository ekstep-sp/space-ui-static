import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PublicContactComponent } from './public-contact.component'
import {
  MatToolbarModule,
  MatCardModule,
  MatDividerModule,
  MatIconModule,
  MatExpansionModule,
} from '@angular/material'
import { BtnPageBackModule } from '@ws-widget/collection'
import { PipeSafeSanitizerModule } from '@ws-widget/utils'
import { PublicHeaderModule } from '../public-header/public-header.module'

@NgModule({
  declarations: [PublicContactComponent],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatCardModule,
    BtnPageBackModule,
    MatDividerModule,
    MatIconModule,
    MatExpansionModule,
    PipeSafeSanitizerModule,
    PublicHeaderModule,
  ],
  exports: [PublicContactComponent],
})
export class PublicContactModule { }
