import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { UserMigrationUiModule } from '@ws/app/src/lib/routes/content-migration-ui/user-migration-ui.module'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    UserMigrationUiModule,
  ],
})
export class RouteUserMigrationModule { }
