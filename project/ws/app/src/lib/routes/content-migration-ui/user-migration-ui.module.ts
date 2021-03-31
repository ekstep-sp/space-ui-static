import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentMigrationDialogComponent } from './components/content-migration-dialog/content-migration-dialog.component';
import { ContentMigrationDashboardComponent } from './components/content-migration-dashboard/content-migration-dashboard.component'

import { LoaderService } from '@ws/author/src/lib/services/loader.service'
import { UserMigrationUiRoutingModule } from './user-migration-ui-routing.module'

@NgModule({
  declarations: [ContentMigrationDialogComponent, ContentMigrationDashboardComponent],
  imports: [
    CommonModule,
    UserMigrationUiRoutingModule,
  ],
  entryComponents: [ ContentMigrationDialogComponent, ContentMigrationDashboardComponent ],
  providers: [
    LoaderService,
  ],
})
export class UserMigrationUiModule { }
