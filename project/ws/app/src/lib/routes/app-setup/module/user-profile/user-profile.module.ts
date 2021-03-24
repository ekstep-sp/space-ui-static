import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { EditProfileModule } from '../../../profile/routes/edit-profile/edit-profile.module'
import { UserProfileComponent } from './user-profile.component'
import { MatCardModule, MatProgressSpinnerModule, MatCheckboxModule, MatButtonModule, MatIconModule, MatToolbarModule, MatChipsModule, MatFormFieldModule, MatAutocompleteModule, MatSelectModule, MatExpansionModule } from '@angular/material'
import { BtnPageBackModule } from '@ws-widget/collection/src/public-api'
import { HorizontalScrollerModule, PipeLimitToModule } from '@ws-widget/utils/src/public-api'

@NgModule({
  declarations: [UserProfileComponent],
  imports: [
    EditProfileModule,
    CommonModule,
    HorizontalScrollerModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    BtnPageBackModule,
    MatChipsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    PipeLimitToModule,
    MatExpansionModule,
  ],
})
export class UserProfileModule { }
