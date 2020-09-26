import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { AppBtnFeatureComponent } from './app-btn-feature.component'
import { MatButtonModule, MatIconModule, MatMenuModule, MatRippleModule, MatExpansionModule, MatTooltipModule, MatCardModule, MatBadgeModule } from '@angular/material'
import { WidgetResolverModule } from '@ws-widget/resolver'
import { WidgetUrlResolverDirective } from '../btn-feature/widget-url-resolver.directive'

@NgModule({
  declarations: [AppBtnFeatureComponent, WidgetUrlResolverDirective],
  imports: [
    CommonModule,
    RouterModule,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatRippleModule,
    WidgetResolverModule,
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatCardModule,
    MatMenuModule,
    MatRippleModule,
    MatBadgeModule,
  ],
  exports: [AppBtnFeatureComponent],
})
export class AppBtnFeatureModule { }
