import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { PublicUserViewRoutingModule } from './public-user-view-routing.module'
import { PublicUserViewComponent } from './components/public-user-view/public-user-view.component'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'

@NgModule({
  declarations: [PublicUserViewComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    PublicUserViewRoutingModule,
  ],
})
export class PublicUserViewModule { }
