import { Component, OnInit, Input } from '@angular/core'
import { NsContent } from '../../_services/widget-content.model'
import { ConfigurationsService, UtilityService } from '../../../../../utils'
import { Router } from '@angular/router'
import { WidgetContentService } from '../../_services/widget-content.service'
import { isIOS } from '../../player-amp/player-amp.utility'
// import { Subscription } from 'rxjs'

@Component({
  selector: 'ws-widget-player-brief',
  templateUrl: './player-brief.component.html',
  styleUrls: ['./player-brief.component.scss'],
})
export class PlayerBriefComponent implements OnInit {
  isDownloadMobile: any

  @Input()
  content: NsContent.IContent | null = null
  @Input()
  hasTocStructure = false
  @Input()
  tocStructure: any = null
  @Input()
  isPreviewMode = false
  @Input()
  forPreview = false
  @Input()
  askAuthorEnabled = true
  tocConfig: any = null
  enableRatings = false
  mailIcon = false

  contentTypes = NsContent.EContentTypes
  showMoreGlance = false
  isShowDownloadMobile = false
  isShowDownloadIOS = false
  isShowDownloadAndroid = false
  constructor(
    public configSvc: ConfigurationsService,
    private utilitySvc: UtilityService,
    private router: Router,
    private widgetContentSvc: WidgetContentService,

  ) { }
  isDownloadableDesktop = false
  isDownloadableIos = false
  isDownloadableAndroid = false
  hideRatings = false

  ngOnInit() {

    this.getTocConfig()
    if (this.configSvc.restrictedFeatures) {
      this.isDownloadableIos = this.configSvc.restrictedFeatures.has('iosDownload')
      this.isDownloadableAndroid = this.configSvc.restrictedFeatures.has('androidDownload')
      this.isDownloadableDesktop = this.configSvc.restrictedFeatures.has('downloadRequest')
    }
  }

  get isDownloadable() {
    if (this.configSvc.isGuestUser) {
      return false
    }
    if (this.content) {
      if (this.content.mimeType === 'application/pdf') {
        return true
      }
    }
    if (
      this.configSvc.instanceConfig &&
      this.configSvc.instanceConfig.isDownloadableSource &&
      this.configSvc.instanceConfig.isDownloadableAndroidResource &&
      this.content &&
      this.content.sourceName &&
      this.configSvc.instanceConfig.isDownloadableIosResource &&
      Object.keys(this.configSvc.instanceConfig.isDownloadableSource).includes(
        this.content.sourceName.toLowerCase(),
      )
    ) {
      const sourceShortName: string = this.content.sourceName || ''
      // tslint:disable-next-line:max-line-length
      if (
        !this.utilitySvc.isMobile &&
        !this.isDownloadableDesktop &&
        this.configSvc.instanceConfig.isDownloadableSource[sourceShortName.toLowerCase()].includes(
          this.content.resourceType.toLowerCase(),
        )
      ) {
        return true
      }
      if (
        this.utilitySvc.isIos &&
        !this.isDownloadableIos &&
        // tslint:disable-next-line: ter-computed-property-spacing
        this.configSvc.instanceConfig.isDownloadableIosResource[
          sourceShortName.toLowerCase()
          // tslint:disable-next-line: ter-computed-property-spacing
        ].includes(this.content.resourceType.toLowerCase())
      ) {
        return true
      }
      if (
        this.utilitySvc.isAndroid &&
        !this.isDownloadableAndroid &&
        // tslint:disable-next-line: ter-computed-property-spacing
        this.configSvc.instanceConfig.isDownloadableAndroidResource[
          sourceShortName.toLowerCase()
          // tslint:disable-next-line: ter-computed-property-spacing
        ].includes(this.content.resourceType.toLowerCase())
      ) {
        return true
      }
      return false
    }
    return false
  }

  goToContent(id: string) {
    this.router.navigate([`/app/toc/${id}/overview`])
  }

  getTocConfig() {
    const url = `${this.configSvc.sitePath}/feature/toc.json`
    this.widgetContentSvc.fetchConfig(url).subscribe(data => {
      this.tocConfig = data
      // console.log("configdata", data)
      this.isShowDownloadMobile = data.isMobileDownloadable
      this.isShowDownloadIOS = data.isIOSDownloadable
      this.isShowDownloadAndroid = data.isAndroidDownloadable
      // tslint:disable-next-line: max-line-length
      this.enableRatings = this.widgetContentSvc.isVisibileAccToRoles(this.tocConfig.rolesAllowed.rateContent, this.tocConfig.rolesNotAllowed.rateContent)
      // tslint:disable-next-line: max-line-length
      this.mailIcon = this.widgetContentSvc.isVisibileAccToRoles(this.tocConfig.rolesAllowed.mail, this.tocConfig.rolesNotAllowed.mail)
      if (this.configSvc.isGuestUser) {
        this.extractFeaturesForGuest()
      }

    })
  }
  // function for disabling download button for ios and android
  get showDownloadMobile() {
    if (!this.utilitySvc.isMobile) {
      return true
    }
    if (this.isShowDownloadMobile) {
      if (this.utilitySvc.isIos && this.isShowDownloadIOS) {
        return true
      }
      if (this.utilitySvc.isAndroid && this.isShowDownloadAndroid) {
        return true
      }

    }
    return false
  }
  extractFeaturesForGuest() {
    this.hideRatings = true
    this.enableRatings = false
    this.mailIcon = false
  }

  download() {
    if (this.content && !this.forPreview) {
      const link = document.createElement('a')
      if (!isIOS) {
        link.download = this.content.artifactUrl.split('/').pop() || 'resource.pdf'
      }
      link.target = '_self'
      // Construct the URI
      link.href = this.content.artifactUrl || ''
      document.body.appendChild(link)
      link.click()
      // Cleanup the DOM
      document.body.removeChild(link)
    }
  }
}
