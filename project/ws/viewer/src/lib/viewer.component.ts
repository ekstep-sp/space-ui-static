import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { NsContent } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ConfigurationsService, UtilityService, ValueService } from '@ws-widget/utils'
import { Subscription } from 'rxjs'
import { RootService } from '../../../../../src/app/component/root/root.service'
import { AppTocService } from '@ws/app/src/lib/routes/app-toc/services/app-toc.service'
import { TStatus, SharedViewerDataService } from '@ws/author/src/lib/modules/shared/services/shared-viewer-data.service'

export enum ErrorType {
  accessForbidden = 'accessForbidden',
  notFound = 'notFound',
  internalServer = 'internalServer',
  serviceUnavailable = 'serviceUnavailable',
  somethingWrong = 'somethingWrong',
  mimeTypeMismatch = 'mimeTypeMismatch',
  previewUnAuthorised = 'previewUnAuthorised',
}

@Component({
  selector: 'viewer-container',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss'],
})
export class ViewerComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {
  fullScreenContainer: HTMLElement | null = null
  guestUser = false
  content: NsContent.IContent | null = null
  errorType = ErrorType
  private isLtMedium$ = this.valueSvc.isLtMedium$
  sideNavBarOpened = false
  mode: 'over' | 'side' = 'side'
  forPreview = window.location.href.includes('/author/')
  isTypeOfCollection = true
  collectionId = this.activatedRoute.snapshot.queryParamMap.get('collectionId')
  status: TStatus = 'none'
  error: any | null = null
  isNotEmbed = true
  renderingPDF = false
  errorWidgetData: NsWidgetResolver.IRenderConfigWithTypedData<any> = {
    widgetType: 'errorResolver',
    widgetSubType: 'errorResolver',
    widgetData: {
      errorType: '',
    },
  }
  private screenSizeSubscription: Subscription | null = null
  private resourceChangeSubscription: Subscription | null = null
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private valueSvc: ValueService,
    private dataSvc: SharedViewerDataService,
    private rootSvc: RootService,
    private utilitySvc: UtilityService,
    private changeDetector: ChangeDetectorRef,
    private tocSharedSvc: AppTocService,
    private readonly configService: ConfigurationsService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.rootSvc.showNavbarDisplay$.next(false)
    this.rootSvc.showBottomNav$.next(true)
  }

  getContentData(e: any, sentDirectly = false) {
    if (!sentDirectly) {
      if (!this.configService.isGuestUser && e.hasOwnProperty('activatedRoute')) {
        e.activatedRoute.data.subscribe((data: { content: { data: NsContent.IContent } }) => {
          debugger
          if (data.content && data.content.data) {
            this.content = data.content.data
            this.tocSharedSvc.fetchEmails(this.content ? this.content.creatorContacts : []).then((newIDS: any) => {
              if (this.content) {
                this.content.creatorContacts = [
                  ...newIDS,
                ]
              }
            })
          }
        })
      }
    } else {
      this.guestUser = true
      window.setTimeout(() => {
        // this.utilitySvc.emitCurrentContentForBriefPlayer(e)
        this.content = e
      })
    }
    if (this.content && this.content.mimeType.includes('pdf')) {
      this.renderingPDF = true
    } else {
      this.renderingPDF = false
    }
  }

  ngOnInit() {
    this.isNotEmbed = !(
      window.location.href.includes('/embed/') ||
      this.activatedRoute.snapshot.queryParams.embed === 'true'
    )
    this.isTypeOfCollection = this.activatedRoute.snapshot.queryParams.collectionType ? true : false
    this.screenSizeSubscription = this.isLtMedium$.subscribe(isSmall => {
      // this.sideNavBarOpened = !isSmall
      this.sideNavBarOpened = isSmall ? false : true
      this.mode = isSmall ? 'over' : 'side'
    })
    this.resourceChangeSubscription = this.dataSvc.changedSubject.subscribe(_ => {
      debugger
      this.status = this.dataSvc.status
      this.error = this.dataSvc.error
      if (this.error && this.error.status) {
        switch (this.error.status) {
          case 403: {
            this.errorWidgetData.widgetData.errorType = ErrorType.accessForbidden
            break
          }
          case 404: {
            this.errorWidgetData.widgetData.errorType = ErrorType.notFound
            break
          }
          case 500: {
            this.errorWidgetData.widgetData.errorType = ErrorType.internalServer
            break
          }
          case 503: {
            this.errorWidgetData.widgetData.errorType = ErrorType.serviceUnavailable
            break
          }
          default: {
            this.errorWidgetData.widgetData.errorType = ErrorType.somethingWrong
            break
          }
        }
      }
      if (this.error && this.error.errorType === this.errorType.mimeTypeMismatch) {
        setTimeout(() => {
          this.router.navigate([this.error.probableUrl])
          // tslint:disable-next-line: align
        }, 3000)
      }
      if (this.error && this.error.errorType === this.errorType.previewUnAuthorised) {
      }
      // //console.log(this.error)
    })
  }

  ngAfterViewInit() {
    if (!this.guestUser) {
      const container = document.getElementById('fullScreenContainer')
      if (container) {
        this.fullScreenContainer = container
      } else {
        this.fullScreenContainer = null
      }
      this.changeDetector.detectChanges()
    }
  }

  ngAfterViewChecked() {
    this.guestUser = this.guestUser
    this.cdr.detectChanges()
  }

  ngOnDestroy() {
    this.rootSvc.showNavbarDisplay$.next(true)
    if (this.screenSizeSubscription) {
      this.screenSizeSubscription.unsubscribe()
    }
    if (this.resourceChangeSubscription) {
      this.resourceChangeSubscription.unsubscribe()
    }
  }

  toggleSideBar() {
    this.sideNavBarOpened = !this.sideNavBarOpened
  }

  minimizeBar() {
    if (this.utilitySvc.isMobile) {
      this.sideNavBarOpened = false
    }
  }
}
