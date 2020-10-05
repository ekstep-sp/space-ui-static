import { Component, OnInit } from '@angular/core'
import { SafeUrl, DomSanitizer } from '@angular/platform-browser'
import { ConfigurationsService, NsPage } from '@ws-widget/utils'
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'ws-contentpolicyandcommunication',
  templateUrl: './contentpolicyandcommunication.component.html',
  styleUrls: ['./contentpolicyandcommunication.component.scss'],
})
export class ContentpolicyandcommunicationComponent implements OnInit {
  contentpolicy: SafeUrl | null = null
  contentPolicyDetails: any | null = null
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar

  constructor(private configSvc: ConfigurationsService, private domSanitizer: DomSanitizer,
              private activateRoute: ActivatedRoute) {
    const instanceConfig = this.configSvc.instanceConfig
    if (instanceConfig) {
      this.contentpolicy = this.domSanitizer.bypassSecurityTrustResourceUrl(
        instanceConfig.banners.contentpolicy,
      )
    }

  }

  ngOnInit() {
    this.activateRoute.data.subscribe(data => {
      if (data) {
        this.contentPolicyDetails = data.pageData.data
      }
    })
  }

}
