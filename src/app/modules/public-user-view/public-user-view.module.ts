import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { InfiniteScrollModule } from 'ngx-infinite-scroll'
import { PublicUserViewRoutingModule } from './public-user-view-routing.module'
import { PublicUserViewComponent } from './components/public-user-view/public-user-view.component'
import { MatCardModule } from '@angular/material/card'
import { MatToolbarModule, MatProgressSpinnerModule } from '@angular/material'

import { BtnPageBackModule } from '@ws-widget/collection'
import { MatIconModule } from '@angular/material/icon'
import { ReactiveFormsModule } from '@angular/forms'
import { PublicUsersCoreService } from './services/public-users-core.service'
import { UserlistComponent } from './components/userlist/userlist.component'
import {

  MatButtonModule,
  MatFormFieldModule,
  MatInputModule,
} from '@angular/material'
import { UserViewSearchPipe } from './pipes/user-view-search.pipe'
@NgModule({
  declarations: [PublicUserViewComponent, UserlistComponent, UserViewSearchPipe],
  providers: [PublicUsersCoreService, UserViewSearchPipe],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    InfiniteScrollModule,
    PublicUserViewRoutingModule,
    MatToolbarModule,
    BtnPageBackModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
})
export class PublicUserViewModule { }
