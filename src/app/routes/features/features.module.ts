import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FeaturesComponent } from './features.component'
import {
  MatToolbarModule,
  MatIconModule,
  MatFormFieldModule,
  MatTooltipModule,
  MatButtonModule,
  MatInputModule,
  MatCardModule,
} from '@angular/material'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { BtnFeatureModule, BtnPageBackModule } from '@ws-widget/collection'
import { WidgetResolverModule } from '@ws-widget/resolver'
import { LogoutModule } from '@ws-widget/utils'

@NgModule({
  declarations: [FeaturesComponent],
  imports: [
    CommonModule,
    FormsModule,
    BtnFeatureModule,
    BtnPageBackModule,
    LogoutModule,
    WidgetResolverModule,
    ReactiveFormsModule,
    RouterModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatTooltipModule,
    MatCardModule,
  ],
  exports: [FeaturesComponent],
  entryComponents: [FeaturesComponent],
})
export class FeaturesModule { }
