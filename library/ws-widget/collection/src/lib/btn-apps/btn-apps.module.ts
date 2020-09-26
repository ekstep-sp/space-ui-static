import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { BtnAppsComponent } from './btn-apps.component'
import { MatButtonModule, MatIconModule, MatMenuModule, MatRippleModule, MatExpansionModule } from '@angular/material'
import { WidgetResolverModule } from '@ws-widget/resolver'
import { AppBtnFeatureComponent } from '../app-btn-feature/app-btn-feature.component'
import { BtnFeatureModule } from '../btn-feature/btn-feature.module'
// import { FeaturesModule } from '../../../../../../src/app/routes/features/features.module'
// import { FeaturesComponent } from '../../../../../../src/app/routes/features/features.component'

@NgModule({
  declarations: [BtnAppsComponent, AppBtnFeatureComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatRippleModule,
    WidgetResolverModule,
    MatExpansionModule,
    BtnFeatureModule,
  ],
  exports: [BtnAppsComponent],
  entryComponents: [BtnAppsComponent],
})
export class BtnAppsModule { }
