import { Component, Input, OnInit } from '@angular/core'
import { NsContent, NsDiscussionForum } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ActivatedRoute } from '@angular/router'
import { ConfigurationsService } from '../../../../../../../library/ws-widget/utils/src/public-api'
import { SharedViewerDataService } from '@ws/author/src/lib/modules/shared/services/shared-viewer-data.service'
// import { ViewerDataService } from '../../viewer-data.service'

@Component({
  selector: 'viewer-pdf-container',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.scss'],
})
export class PdfComponent implements OnInit {
  @Input() isFetchingDataComplete = false
  @Input() pdfData: NsContent.IContent | null = null
  @Input() forPreview = false
  @Input() widgetResolverPdfData: any = {
    widgetType: 'player',
    widgetSubType: 'playerPDF',
    widgetData: {
      pdfUrl: '',
      identifier: '',
      disableTelemetry: false,
      hideControls: true,
    },
  }
  @Input() isPreviewMode = false
  @Input() discussionForumWidget: NsWidgetResolver.IRenderConfigWithTypedData<
    NsDiscussionForum.IDiscussionForumInput
  > | null = null
  isTypeOfCollection = false
  isRestricted = false
  allowedToPdf = true
  allowToLike = true
  constructor(
    private activatedRoute: ActivatedRoute,
    private configSvc: ConfigurationsService,
    private viewerService: SharedViewerDataService
) { }

  ngOnInit() {
    this.activatedRoute.data.subscribe(_data => {
      // console.log(_data)
      // tslint:disable: max-line-length
      if (this.configSvc.isGuestUser) {
        this.extractFeaturesForGuestUser()
      } else {
        if (this.viewerService.isVisibileAccToRoles(_data.pageData.data.enableDisscussionForum.rolesAllowed.disscussionForum, _data.pageData.data.enableDisscussionForum.rolesNotAllowed.disscussionForum)) {
          this.allowedToPdf = true
        } else {
          this.allowedToPdf = false
        }
      }
    })
    if (this.configSvc.restrictedFeatures && !this.configSvc.isGuestUser) {
      this.isRestricted =
        !this.configSvc.restrictedFeatures.has('disscussionForum')
    }
    this.isTypeOfCollection = this.activatedRoute.snapshot.queryParams.collectionType ? true : false
  }

  extractFeaturesForGuestUser() {
    this.allowedToPdf = false
    this.isRestricted = true
    this.allowToLike = false
  }
}
