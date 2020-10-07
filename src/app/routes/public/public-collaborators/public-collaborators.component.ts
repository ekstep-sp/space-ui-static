import { Component, OnInit, ViewChild } from '@angular/core'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'
import { ConfigurationsService, AuthKeycloakService } from '../../../../../library/ws-widget/utils/src/public-api'
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'ws-public-collaborators',
  templateUrl: './public-collaborators.component.html',
  styleUrls: ['./public-collaborators.component.scss'],
})
export class PublicCollaboratorsComponent implements OnInit {
  @ViewChild('carousel', { static: false }) carousel: any
  images: any[] = []

  collaboratorBanner: SafeUrl | null = null
  partner = {
    src: [],
    url: [],
  }

  constructor(
    private configSvc: ConfigurationsService,
    private domSanitizer: DomSanitizer,
    public authSvc: AuthKeycloakService,
    private router: ActivatedRoute) {
    const instanceConfig = this.configSvc.instanceConfig
    if (instanceConfig) {
      this.collaboratorBanner = this.domSanitizer.bypassSecurityTrustResourceUrl(
        instanceConfig.banners.collaboratorBanner,
      )
    }

  }
  ngOnInit() {
    this.router.data.subscribe(data => {
      this.partner.src = data.pageData.data.partner.src
      this.partner.url = data.pageData.data.partner.url
    })
  }

}
