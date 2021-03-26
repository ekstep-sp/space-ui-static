import { Component, OnInit } from '@angular/core'
import { ConfigurationsService } from '../../../../../../../../../library/ws-widget/utils/src/public-api'
import { SafeUrl, DomSanitizer } from '@angular/platform-browser'
import { Event, NavigationEnd, Router } from '@angular/router'

enum STEPS {
  STEP_1 = 1,
  STEP_2,
  STEP_3,
  STEP_4,
}
@Component({
  selector: 'ws-app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  appIcon: SafeUrl = ''
  stepCount = STEPS.STEP_1
  appName = ''
  showStepCount = false
  totalSteps = Object.keys(STEPS).length / 2
  constructor(private configSvc: ConfigurationsService, private domSanitizer: DomSanitizer, private router: Router) {
    this.router.events.subscribe((e: Event) => {
      if (e instanceof NavigationEnd) {
        if (e.url.includes('lang')) {
          this.stepCount = STEPS.STEP_1
          this.showStepCount = true
        } else if (e.url.includes('tnc')) {
          this.stepCount = STEPS.STEP_2
          this.showStepCount = true
        } else if (e.url.includes('about-video')) {
          this.stepCount = STEPS.STEP_3
          this.showStepCount = true
        } else if (e.url.includes('interest')) {
          this.stepCount = STEPS.STEP_4
          this.showStepCount = true
        } else {
          this.showStepCount = false
        }

      }
    })
  }

  ngOnInit() {
    if (this.configSvc.instanceConfig) {
      this.appName = this.configSvc.instanceConfig.details.appName
      this.appIcon = this.domSanitizer.bypassSecurityTrustResourceUrl(
        this.configSvc.instanceConfig.logos.appTransparent,
      )
    }
  }

}
