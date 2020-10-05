import { Component, OnInit } from '@angular/core'
import { ConfigurationsService, NsPage } from '@ws-widget/utils'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'ws-dataprivacy',
  templateUrl: './dataprivacy.component.html',
  styleUrls: ['./dataprivacy.component.scss'],
})
export class DataprivacyComponent implements OnInit {
  dataprivacy: SafeUrl | null = null
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  dataPrivacyDetails: any
  constructor(private configSvc: ConfigurationsService, private domSanitizer: DomSanitizer,
              private activateRoute: ActivatedRoute) {
    const instanceConfig = this.configSvc.instanceConfig
    if (instanceConfig) {
      this.dataprivacy = this.domSanitizer.bypassSecurityTrustResourceUrl(
        instanceConfig.banners.dataprivacy,
      )
    }
  }

  ngOnInit() {
    this.activateRoute.data.subscribe(data => {
      if (data) {
        this.dataPrivacyDetails = data.pageData.data
      }
    })
  }

}
