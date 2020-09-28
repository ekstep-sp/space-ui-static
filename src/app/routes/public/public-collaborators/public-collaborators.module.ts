import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PublicCollaboratorsComponent } from './public-collaborators.component'
import { MatIconModule } from '@angular/material/icon'
import { HorizontalScrollerModule } from '../../../../../library/ws-widget/utils/src/public-api'
import { Ng2CarouselamosModule } from 'ng2-carouselamos'

@NgModule({
  declarations: [PublicCollaboratorsComponent],
  imports: [
    CommonModule,
    MatIconModule,
    HorizontalScrollerModule,
    Ng2CarouselamosModule,
  ],
  exports: [PublicCollaboratorsComponent],
})
export class PublicCollaboratorsModule { }
