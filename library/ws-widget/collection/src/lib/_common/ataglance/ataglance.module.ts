import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AtaglanceComponent } from './ataglance.component'
import { PipeCountTransformModule, PipeDurationTransformModule } from '@ws-widget/utils'
import { DisplayContentTypeModule } from '../display-content-type/display-content-type.module'
import { UserContentRatingModule } from '../user-content-rating/user-content-rating.module'
import { UserImageModule } from '../user-image/user-image.module'
import { BtnMailUserModule } from '../../btn-mail-user/btn-mail-user.module'
import { MarkAsCompleteModule } from '../mark-as-complete/mark-as-complete.module'
import { MatDividerModule, MatChipsModule, MatIconModule, MatCardModule, MatButtonModule } from '@angular/material'

@NgModule({
  declarations: [AtaglanceComponent],
  imports: [
    CommonModule,
    PipeCountTransformModule,
    PipeDurationTransformModule,
    DisplayContentTypeModule,
    MatDividerModule,
    MatChipsModule,
    MatIconModule,
    UserContentRatingModule,
    MatCardModule,
    UserImageModule,
    BtnMailUserModule,
    MatButtonModule,
    MarkAsCompleteModule,
  ],
  exports: [AtaglanceComponent],
})
export class AtaglanceModule { }
