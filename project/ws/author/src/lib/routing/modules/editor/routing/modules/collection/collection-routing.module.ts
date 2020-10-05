import { CollectionComponent } from './components/collection/collection.component'
import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { PageResolve } from '@ws-widget/utils/src/public-api'

const routes: Routes = [
  {
    path: '',
    component: CollectionComponent,
  data: {
    pageType: 'feature',
    pageKey: 'auth-meta-form',
  },
  resolve: {
    pageData: PageResolve,
  },
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class CollectionRoutingModule { }
