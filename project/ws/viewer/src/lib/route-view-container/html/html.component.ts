import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core'
import { NsContent, NsDiscussionForum, WidgetContentService, NsGoal } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ActivatedRoute } from '@angular/router'
import { SafeHtml, DomSanitizer } from '@angular/platform-browser'
import { PipeLimitToPipe } from '@ws-widget/utils/src/lib/pipes/pipe-limit-to/pipe-limit-to.pipe'
import { ValueService, ConfigurationsService } from '@ws-widget/utils'
import { ViewerDataService } from '../../viewer-data.service'
@Component({
  selector: 'viewer-html-container',
  templateUrl: './html.component.html',
  styleUrls: ['./html.component.scss'],
})
export class HtmlComponent implements OnInit, OnChanges {
  @Input() isNotEmbed = true
  @Input() isFetchingDataComplete = false
  @Input() htmlData: NsContent.IContent | null = null
  @Input() discussionForumWidget: NsWidgetResolver.IRenderConfigWithTypedData<
    NsDiscussionForum.IDiscussionForumInput
  > | null = null
  @Input() isPreviewMode = false
  @Input() forPreview = false
  isTypeOfCollection = false
  learningObjective: SafeHtml = ''
  description: SafeHtml = ''
  isLtMedium = false
  isScormContent = false
  isRestricted = false
  allowedToDiscussionForum = true
  content: NsContent.IContent | null = null
  hideRatings = false
  enableRatings = false
  tocConfig: any = null
  mailIcon = false
  parentNode = 'viewer'
  btnGoalsConfig: NsGoal.IBtnGoal | null = null
  isGoalsEnabled = false

  constructor(
    private activatedRoute: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    private pipeLimitTo: PipeLimitToPipe,
    private valueSvc: ValueService,
    private configSvc: ConfigurationsService,
    private viewerService: ViewerDataService,
    private widgetContentSvc: WidgetContentService
  ) { }

  ngOnInit() {
    this.activatedRoute.data.subscribe(_data => {
      this.content = _data.content.data
      this.tocConfig = _data.pageData.data.viewerConfig
      // tslint:disable-next-line: max-line-length
      this.enableRatings = this.widgetContentSvc.isVisibileAccToRoles(this.tocConfig.rolesAllowed.rateContent, this.tocConfig.rolesNotAllowed.rateContent)
      // console.log(_data)
      // tslint:disable-next-line: max-line-length
      if (!this.configSvc.isGuestUser && this.viewerService.isVisibileAccToRoles(_data.pageData.data.enableDisscussionForum.rolesAllowed.disscussionForum, _data.pageData.data.enableDisscussionForum.rolesNotAllowed.disscussionForum)) {
        this.allowedToDiscussionForum = true
      } else {
        this.allowedToDiscussionForum = false
      }
    })
    this.isTypeOfCollection = this.activatedRoute.snapshot.queryParams.collectionType ? true : false
    if (this.configSvc.restrictedFeatures) {
      this.isRestricted =
        !this.configSvc.restrictedFeatures.has('disscussionForum')
    }
    this.valueSvc.isLtMedium$.subscribe(isLtMd => {
      this.isLtMedium = isLtMd
    })
    if (this.configSvc.isGuestUser) {
      this.extractFeaturesForGuest()
    }
    if (this.content) {
    this.btnGoalsConfig = {
      contentId: this.content.identifier,
      contentName: this.content.name,
      contentType: this.content.contentType,
    }
  }
  if (this.configSvc.restrictedFeatures) {
    this.isGoalsEnabled = !this.configSvc.restrictedFeatures.has('goals')
  }
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const prop in changes) {
      if (prop === 'htmlData') {
        if (this.htmlData && this.htmlData.artifactUrl.startsWith('https://scorm.')) {
          this.isScormContent = true
        } else {
          this.isScormContent = false
        }
        if (this.htmlData && this.htmlData.learningObjective) {
          this.learningObjective = this.domSanitizer.bypassSecurityTrustHtml(
            this.htmlData.learningObjective,
          )
        }
        if (this.htmlData && this.htmlData.description) {
          const description = this.pipeLimitTo.transform(this.htmlData.description, 450)
          this.description = this.domSanitizer.bypassSecurityTrustHtml(description)
        }
      }
    }
  }
  get isRatingsDisabled() {
    if (this.configSvc.isGuestUser) {
      return true
    }
    return this.isPreviewMode || !this.enableRatings
  }
  extractFeaturesForGuest() {
    this.hideRatings = true
    this.enableRatings = false
    this.mailIcon = false
  }
}
