import { Component, OnInit } from '@angular/core'
import { ConfigurationsService, NsPage, AuthKeycloakService } from '@ws-widget/utils'
import { SafeUrl, DomSanitizer } from '@angular/platform-browser'
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'ws-assetguidelines',
  templateUrl: './assetguidelines.component.html',
  styleUrls: ['./assetguidelines.component.scss'],
})
export class AssetguidelinesComponent implements OnInit {
  assetguidelines: SafeUrl | null = null
  assetGuidelinesDetails: any
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar

  constructor(private configSvc: ConfigurationsService, private domSanitizer: DomSanitizer,
              public authSvc: AuthKeycloakService,
              private activateRoute: ActivatedRoute) {
    const instanceConfig = this.configSvc.instanceConfig
    if (instanceConfig) {
      this.assetguidelines = this.domSanitizer.bypassSecurityTrustResourceUrl(
        instanceConfig.banners.assetguidelines,
      )
    }
  }

  ngOnInit() {
    this.activateRoute.data.subscribe(data => {
      if (data) {
        this.assetGuidelinesDetails = data.pageData.data
      }
    })
  }

}
