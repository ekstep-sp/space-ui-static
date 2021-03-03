import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { PublicUserInvitationComponent } from './components/public-user-invitation/public-user-invitation.component'
import { PublicUserViewComponent } from './components/public-user-view/public-user-view.component'

const routes: Routes = [
  {
    path: 'invitation/:requestId',
    component: PublicUserInvitationComponent,
  },
  {
    path: 'list',
    component: PublicUserViewComponent,
  },
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PublicUserViewRoutingModule { }
