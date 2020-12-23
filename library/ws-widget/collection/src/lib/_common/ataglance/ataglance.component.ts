import { Component, OnInit, Input, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { NsContent } from '../../_services/widget-content.model'
import { ConfigurationsService, UtilityService } from '../../../../../utils'
import { Router, ActivatedRoute, Data } from '@angular/router'
import { WidgetContentService } from '../../_services/widget-content.service'
import { isIOS } from '../../player-amp/player-amp.utility'
import { BehaviorSubject, Subscription } from 'rxjs'
import { distinctUntilChanged } from 'rxjs/operators'
import { AppTocService } from '@ws/app/src/lib/routes/app-toc/services/app-toc.service'

@Component({
  selector: 'ws-widget-ataglance',
  templateUrl: './ataglance.component.html',
  styleUrls: ['./ataglance.component.scss'],
})
export class AtaglanceComponent implements OnInit, OnDestroy {
  isDownloadMobile: any
  content$: Subscription | null = null
  @Input() viewer = false
  @Input()
  overview = false
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
  @Input()
  creatorContacts: any
  tocConfig: any = null
  enableRatings = false
  mailIcon = false
  mailIcon$ = new BehaviorSubject<boolean>(this.mailIcon)

  contentTypes = NsContent.EContentTypes
  showMoreGlance = true
  isShowDownloadMobile = false
  isShowDownloadIOS = false
  isShowDownloadAndroid = false
  routeParentSubscription: Subscription | null = null

  constructor(
    public configSvc: ConfigurationsService,
    private utilitySvc: UtilityService,
    private router: Router,
    private widgetContentSvc: WidgetContentService,
    private readonly cdr: ChangeDetectorRef,
    public activatedRoute: ActivatedRoute,
    private tocSharedSvc: AppTocService,
  ) { }
  isDownloadableDesktop = false
  isDownloadableIos = false
  isDownloadableAndroid = false
  hideRatings = false

  ngOnInit() {
    if (this.configSvc.isGuestUser) {
      // tslint:disable-next-line: max-line-length
      this.content$ = this.utilitySvc.currentPlayerContent$.pipe(distinctUntilChanged()).subscribe((currentContent: NsContent.IContent | null) => {
        if (currentContent) {
          this.content = { ...currentContent }
          // this.showMoreGlance = true
          // this.triggerDummyEvent()
        } else {
          this.content = null
          this.cdr.detectChanges()
        }
      })
    }
    if (!this.content) {
      if (this.activatedRoute && this.activatedRoute.parent) {
        const parentRoute = this.activatedRoute.parent
        this.routeParentSubscription = parentRoute.data.subscribe((data: Data) => {
          this.content = data.content.data
        })
      }
    }
    if (!this.tocStructure) {
      this.resetAndFetchTocStructure()
    }
    // console.log(this.content)
    this.getTocConfig()
    if (this.configSvc.restrictedFeatures) {
      this.isDownloadableIos = this.configSvc.restrictedFeatures.has('iosDownload')
      this.isDownloadableAndroid = this.configSvc.restrictedFeatures.has('androidDownload')
      this.isDownloadableDesktop = this.configSvc.restrictedFeatures.has('downloadRequest')
    }
  }
  resetAndFetchTocStructure() {
    this.tocStructure = {
      assessment: 0,
      course: 0,
      handsOn: 0,
      interactiveVideo: 0,
      learningModule: 0,
      other: 0,
      pdf: 0,
      podcast: 0,
      quiz: 0,
      video: 0,
      webModule: 0,
      webPage: 0,
      youtube: 0,
    }
    if (this.content) {
      this.hasTocStructure = false
      this.tocStructure.learningModule = this.content.contentType === 'Collection' ? -1 : 0
      this.tocStructure.course = this.content.contentType === 'Course' ? -1 : 0
      this.tocStructure = this.tocSharedSvc.getTocStructure(this.content, this.tocStructure)
      for (const progType in this.tocStructure) {
        if (this.tocStructure[progType] > 0) {
          this.hasTocStructure = true
          break
        }
      }
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
      this.isShowDownloadMobile = data.isMobileDownloadable
      this.isShowDownloadIOS = data.isIOSDownloadable
      this.isShowDownloadAndroid = data.isAndroidDownloadable

      // tslint:disable-next-line: max-line-length
      this.enableRatings = this.widgetContentSvc.isVisibileAccToRoles(this.tocConfig.rolesAllowed.rateContent, this.tocConfig.rolesNotAllowed.rateContent)
      // tslint:disable-next-line: max-line-length
      this.mailIcon = this.widgetContentSvc.isVisibileAccToRoles(this.tocConfig.rolesAllowed.mail, this.tocConfig.rolesNotAllowed.mail)
      this.mailIcon$.next(this.mailIcon)
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
  get showDownloadGuest() {
    if (this.configSvc.userRoles) {
      if (this.configSvc.userRoles.size === 3
        && this.configSvc.userRoles.has('my-analytics')
        && this.configSvc.userRoles.has('privileged')) {
        return true
      }
    }
    return false
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

  ngOnDestroy() {
    if (this.content$) {
      this.content$.unsubscribe()
    }
    if (this.mailIcon$) {
      this.mailIcon$.unsubscribe()
    }
  }

  /* triggerDummyEvent() {
    this.showMoreGlance = true
    // tslint:disable-next-line: no-console
    console.log('content data to send is ', this.content)
    const dummyEl = document.createElement('p')
    const dummyEvent = document.createEvent('Event')
    dummyEvent.initEvent('dummy', true, true)
    dummyEl.addEventListener('dummy', (e) => {
      // e.target matches elem
    }, false)
    dummyEl.dispatchEvent(dummyEvent)

    return true
  } */
}

/* else if (e.hasOwnProperty('route')) {
  // this will occur for sharable routes
  e.route.data.subscribe((_data: { content: NsContent.IContent }) => {
    try {
      // this.content = data.content
      throw new Error('A random error to make default login work unintrupted')
    } catch (err) {
      alert('in error block')
      console.log(e)
    }
  })
} */
