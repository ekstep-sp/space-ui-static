import { Component, OnInit } from '@angular/core'
import { ConfigurationsService, NsPage } from '@ws-widget/utils'
import { SafeUrl, DomSanitizer } from '@angular/platform-browser'
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'ws-termsofuse',
  templateUrl: './termsofuse.component.html',
  styleUrls: ['./termsofuse.component.scss'],
})
export class TermsofuseComponent implements OnInit {

  termsOfUse: SafeUrl | null = null
  termsOfUseDetails: any | null = null

  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar

  constructor(private configSvc: ConfigurationsService, private domSanitizer: DomSanitizer,
              private activateRoute: ActivatedRoute) {
    const instanceConfig = this.configSvc.instanceConfig
    if (instanceConfig) {
      this.termsOfUse = this.domSanitizer.bypassSecurityTrustResourceUrl(
        instanceConfig.banners.termsOfUse,
      )
    }
  }

  ngOnInit() {
    this.activateRoute.data.subscribe(data => {
      if (data) {
        this.termsOfUseDetails = data.pageData.data
      }
    })
  }

}
