import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { PublicUserViewRoutingModule } from './public-user-view-routing.module'
import { PublicUserViewComponent } from './components/public-user-view/public-user-view.component'
import { MatToolbarModule } from '@angular/material'

import { BtnPageBackModule } from '@ws-widget/collection'


@NgModule({
  declarations: [PublicUserViewComponent],
  imports: [
    CommonModule,
    PublicUserViewRoutingModule,
    MatToolbarModule,
    BtnPageBackModule
  ],
})
export class PublicUserViewModule { }
