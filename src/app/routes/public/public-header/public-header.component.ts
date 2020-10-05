import { Component, OnInit, Input } from '@angular/core'
import { NsPage } from '@ws-widget/utils/src/lib/resolvers/page.model'
import { SafeUrl, DomSanitizer } from '@angular/platform-browser'
import { ValueService, ConfigurationsService, AuthKeycloakService } from '@ws-widget/utils/src/public-api'

@Component({
  selector: 'ws-public-header',
  templateUrl: './public-header.component.html',
  styleUrls: ['./public-header.component.scss'],
})
export class PublicHeaderComponent implements OnInit {
 @Input()
  publicNavBarDetails: any | null = null
  navBackground: Partial<NsPage.INavBackground> | null = null
  publicData: any
  navbarIcon?: SafeUrl
  appIcon: SafeUrl | null = null
  isTourGuideAvailable = false
  isHlpMenuXs = false
  isXSmall$ = this.valueSvc.isXSmall$
  isXSmall = false
  constructor(private configSvc: ConfigurationsService,
              public authSvc: AuthKeycloakService,
              private domSanitizer: DomSanitizer,
              private valueSvc: ValueService,
              ) { }

    ngOnInit() {
      this.publicData = this.publicNavBarDetails
      if (this.configSvc.instanceConfig) {
        if (this.configSvc.instanceConfig.logos.navbarLogo) {
          this.navbarIcon = this.domSanitizer.bypassSecurityTrustResourceUrl(
            this.configSvc.instanceConfig.logos.navbarLogo,
          )
        }
        this.appIcon = this.domSanitizer.bypassSecurityTrustResourceUrl(
          this.configSvc.instanceConfig.logos.app,
        )
        if (this.configSvc.restrictedFeatures) {
          this.isHlpMenuXs = this.configSvc.restrictedFeatures.has('helpMenuXs')
        }
      }
      this.configSvc.tourGuideNotifier.subscribe(canShow => {
        if (
          this.configSvc.restrictedFeatures &&
          !this.configSvc.restrictedFeatures.has('tourGuide')
        ) {
          this.isTourGuideAvailable = canShow
        }
      })
        this.navBackground = this.publicData.navigationBar.background || this.configSvc.pageNavBar
      this.valueSvc.isXSmall$.subscribe(isXSmall => {
        this.isXSmall = isXSmall
      })
    }
}
