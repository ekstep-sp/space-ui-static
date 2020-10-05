import { CurateComponent } from './components/curate/curate.component'
import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { InitResolver } from '@ws/author/src/lib/services/init-resolve.service'
import { PageResolve } from '@ws-widget/utils/src/public-api'

const routes: Routes = [
  {
    path: '',
    data: {
      load: ['meta', 'license'],
      pageType: 'feature',
      pageKey: 'auth-meta-form',
    },
    resolve: {
      script: InitResolver,
      pageData: PageResolve,
    },
    component: CurateComponent,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CurateRoutingModule { }
