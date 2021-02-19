import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { PublicUserViewRoutingModule } from './public-user-view-routing.module'
import { PublicUserViewComponent } from './components/public-user-view/public-user-view.component'


@NgModule({
  declarations: [PublicUserViewComponent],
  imports: [
    CommonModule,
    PublicUserViewRoutingModule,
  ],
})
export class PublicUserViewModule { }
