import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { PublicUserViewComponent } from './components/public-user-view/public-user-view.component'

const routes: Routes = [
  {
    path: '',
    component: PublicUserViewComponent,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PublicUserViewRoutingModule { }
