import { Component, OnInit } from '@angular/core'
import { ConfigurationsService, NsPage } from '@ws-widget/utils'
import { SafeUrl, DomSanitizer } from '@angular/platform-browser'
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'ws-licencepolicy',
  templateUrl: './licencepolicy.component.html',
  styleUrls: ['./licencepolicy.component.scss'],
})
export class LicencepolicyComponent implements OnInit {
  licensePolicy: SafeUrl | null = null
  licencePolicyDetails: any | null= null
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar

  constructor(private configSvc: ConfigurationsService, private domSanitizer: DomSanitizer,
              private activateRoute: ActivatedRoute) {
    const instanceConfig = this.configSvc.instanceConfig
    if (instanceConfig) {
      this.licensePolicy = this.domSanitizer.bypassSecurityTrustResourceUrl(
        instanceConfig.banners.licensePolicy,
      )
    }
  }

  ngOnInit() {
    this.activateRoute.data.subscribe(data => {
      if (data) {
        this.licencePolicyDetails = data.pageData.data
      }
    })
  }

}
