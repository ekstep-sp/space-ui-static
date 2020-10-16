import { Component } from '@angular/core'
import { ConfigurationsService, ValueService } from '@ws-widget/utils'
@Component({
  selector: 'ws-app-footer-inside',
  templateUrl: './app-footer-inside.component.html',
  styleUrls: ['./app-footer-inside.component.scss'],
})
export class AppFooterInsideComponent {

  isXSmall = false
  termsOfUser = true

  constructor(
    private configSvc: ConfigurationsService,
    private valueSvc: ValueService
  ) {
    if (this.configSvc.restrictedFeatures) {
      if (this.configSvc.restrictedFeatures.has('termsOfUser')) {
        this.termsOfUser = false
      }
    }
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      this.isXSmall = isXSmall
    })
  }
  navigateToOuterSource(url: string) {
    window.open(url, '_blank')
  }

}
