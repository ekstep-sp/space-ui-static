import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
// import { ContentMigrationDialogComponent } from './components/content-migration-dialog/content-migration-dialog.component'
import { ContentMigrationDashboardComponent } from './components/content-migration-dashboard/content-migration-dashboard.component'

import { LoaderService } from '@ws/author/src/lib/services/loader.service'
import { UserMigrationUiRoutingModule } from './user-migration-ui-routing.module'
import { MatSelectModule } from '@angular/material/select'
import { MatToolbarModule, MatProgressSpinnerModule, MatButtonModule } from '@angular/material'
import { BtnPageBackModule } from '@ws-widget/collection/src/public-api'

@NgModule({
  declarations: [
    ContentMigrationDashboardComponent],
  imports: [
    CommonModule,
    UserMigrationUiRoutingModule,
    MatSelectModule,
    MatButtonModule,
    BtnPageBackModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
  ],
  providers: [
    LoaderService,
  ],
})
export class UserMigrationUiModule { }
