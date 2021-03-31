import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router'
import { ContentMigrationDashboardComponent } from './components/content-migration-dashboard/content-migration-dashboard.component'

const routes: Routes = [
  {
    path: '',
    component: ContentMigrationDashboardComponent,
  },
]

@NgModule({
  imports: [ RouterModule.forChild( routes ) ],
  exports: [ RouterModule ],
})
export class UserMigrationUiRoutingModule { }
