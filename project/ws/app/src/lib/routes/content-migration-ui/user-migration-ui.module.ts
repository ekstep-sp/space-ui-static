import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
// import { ContentMigrationDialogComponent } from './components/content-migration-dialog/content-migration-dialog.component'
import { ContentMigrationDashboardComponent } from './components/content-migration-dashboard/content-migration-dashboard.component'

import { LoaderService } from '@ws/author/src/lib/services/loader.service'
import { UserMigrationUiRoutingModule } from './user-migration-ui-routing.module'
import { UserMigrationUtilsService } from './services/user-migration-utils/user-migration-utils.service'
import { UserMigrationCoreService } from './services/user-migration-core/user-migration-core.service'
import { HttpClientModule } from '@angular/common/http'

@NgModule({
  declarations: [
    ContentMigrationDashboardComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    UserMigrationUiRoutingModule,
  ],
  providers: [
    LoaderService,
    UserMigrationUtilsService,
    UserMigrationCoreService,
  ],
})
export class UserMigrationUiModule { }
