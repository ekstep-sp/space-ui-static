import { Component, OnInit } from '@angular/core'
import { SafeUrl, DomSanitizer } from '@angular/platform-browser'
import { ConfigurationsService, AuthKeycloakService } from '../../../../library/ws-widget/utils/src/public-api'
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'ws-app-home',
  templateUrl: './app-home.component.html',
  styleUrls: ['./app-home.component.scss'],
})
export class AppHomeComponent implements OnInit {
  appBanner: SafeUrl | null = null
  appMobileBanner: SafeUrl | null = null
  loadText = false
  private redirectUrl = ''
  constructor(
    private configSvc: ConfigurationsService,
    private domSanitizer: DomSanitizer,
    private authSvc: AuthKeycloakService,
    private activateRoute: ActivatedRoute,
    ) {
    const instanceConfig = this.configSvc.instanceConfig
    if (instanceConfig) {
      this.appBanner = this.domSanitizer.bypassSecurityTrustResourceUrl(
        instanceConfig.banners.mainBanner,
      )
      this.appMobileBanner = this.domSanitizer.bypassSecurityTrustResourceUrl(
        instanceConfig.banners.mobileBanner,
      )
      this.loadText = true
    }
  }
  ngOnInit() {
    const paramsMap = this.activateRoute.snapshot.queryParamMap
    if (paramsMap.has('ref')) {
      this.redirectUrl = document.baseURI + paramsMap.get('ref')
    } else {
      this.redirectUrl = document.baseURI
    }
  }
  login(key: 'E' | 'N' | 'S') {
    this.authSvc.login(key, this.redirectUrl)
  }
  signup() {
    this.authSvc.register(this.redirectUrl)
  }

}
