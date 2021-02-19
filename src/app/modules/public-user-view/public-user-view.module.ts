import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { PublicUserViewRoutingModule } from './public-user-view-routing.module'
import { PublicUserViewComponent } from './components/public-user-view/public-user-view.component'
import { MatCardModule } from '@angular/material/card'
import { MatToolbarModule } from '@angular/material'

import { BtnPageBackModule } from '@ws-widget/collection'
import { MatIconModule } from '@angular/material/icon'
import { ReactiveFormsModule } from '@angular/forms'

@NgModule({
  declarations: [PublicUserViewComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    PublicUserViewRoutingModule,
    MatToolbarModule,
    BtnPageBackModule,
    ReactiveFormsModule,
  ],
})
export class PublicUserViewModule { }
