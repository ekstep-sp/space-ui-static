import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { MatCardModule, MatInputModule, MatButtonModule, MatIconModule, MatToolbarModule, MatFormFieldModule, MatSnackBarModule, MatProgressSpinnerModule } from '@angular/material'
import { EditProfileComponent } from './edit-profile.component'
import { UploadService } from '../../../../../../../author/src/lib/routing/modules/editor/shared/services/upload.service'
import { ApiService, AccessControlService } from '../../../../../../../author/src/public-api'
import { WidgetResolverModule } from '@ws-widget/resolver'
@NgModule({
  declarations: [EditProfileComponent],
  imports: [
    CommonModule, MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    FormsModule,
    WidgetResolverModule
  ],
  providers: [AccessControlService, ApiService, UploadService],
  exports: [EditProfileComponent],
})
export class EditProfileModule { }
