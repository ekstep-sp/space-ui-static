import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { UserDashboardComponent } from './components/user-dashboard/user-dashboard.component'
import { UserDashboardRoutingModule } from './user-dashboard-routing.module'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatToolbarModule } from '@angular/material/toolbar'
import { BtnPageBackModule } from '@ws-widget/collection'
import { MatCardModule , MatTableModule, MatInputModule, MatSortModule, MatProgressSpinnerModule } from '@angular/material'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { DailogUserDashboardComponent } from './components/dailog-user-dashboard/dailog-user-dashboard.component'
import { MatDialogModule } from '@angular/material/dialog'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { AcceptUserDailogComponent } from './components/accept-user-dailog/accept-user-dailog.component'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatButtonModule } from '@angular/material/button'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { MatPaginatorModule } from '@angular/material/paginator'

import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { LoaderService } from '@ws/author/src/lib/services/loader.service'

@NgModule({
  declarations: [UserDashboardComponent, DailogUserDashboardComponent, AcceptUserDailogComponent],
  imports: [
    CommonModule,
    UserDashboardRoutingModule,
    MatButtonToggleModule,
    MatToolbarModule,
    BtnPageBackModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatAutocompleteModule,
    MatSortModule,
    ReactiveFormsModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
  ],
  entryComponents : [DailogUserDashboardComponent,
    AcceptUserDailogComponent],
    providers: [
      LoaderService,
  ],
})
export class UserDashboardModule { }
