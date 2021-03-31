import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard.component'
import { ContentMigrationDashboardComponent } from '../content-migration-ui/components/content-migration-dashboard/content-migration-dashboard.component'

const routes: Routes = [
  {
    path: '',
    component: UserDashboardComponent,
  },
  {
    path: '/migratecontent',
    component: ContentMigrationDashboardComponent,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserDashboardRoutingModule { }
