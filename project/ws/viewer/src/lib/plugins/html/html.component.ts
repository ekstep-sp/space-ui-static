import { Component, ElementRef, Input, OnInit, ViewChild, OnChanges, OnDestroy } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { Router } from '@angular/router'
import { NsContent } from '@ws-widget/collection'
import { ConfigurationsService } from '@ws-widget/utils'
import { TFetchStatus } from '@ws-widget/utils/src/public-api'
import { SharedViewerDataService } from '@ws/author/src/lib/modules/shared/services/shared-viewer-data.service'
import { Subscription } from 'rxjs'
import { MobileAppsService } from '../../../../../../../src/app/services/mobile-apps.service'

@Component({
  selector: 'viewer-plugin-html',
  templateUrl: './html.component.html',
  styleUrls: ['./html.component.scss'],
})
export class HtmlComponent implements OnInit, OnChanges, OnDestroy {

  // private mobileOpenInNewTab!: any

  @ViewChild('mobileOpenInNewTab', { read: ElementRef, static: false }) mobileOpenInNewTab !: ElementRef<HTMLAnchorElement>
  @Input() htmlContent: NsContent.IContent | null = null
  @Input() customUrl: string | null = null
  iframeUrl: SafeResourceUrl | null = null

  showIframeSupportWarning = false
  showIsLoadingMessage = false
  showUnBlockMessage = false
  pageFetchStatus: TFetchStatus | 'artifactUrlMissing' = 'fetching'
  isUserInIntranet = false
  intranetUrlPatterns: string[] | undefined = []
  isIntranetUrl = false
  progress = 100
  loaderIntervalTimeout: any
  techResourceSub: Subscription | null = null
  constructor(
    private domSanitizer: DomSanitizer,
    public mobAppSvc: MobileAppsService,
    // private http: HttpClient,
    private router: Router,
    private configSvc: ConfigurationsService,
    private snackBar: MatSnackBar,
    private readonly sharedViewSrvc: SharedViewerDataService,
  ) { }

  ngOnInit() {
    // this.mobAppSvc.simulateMobile()
  }

  ngOnChanges() {
    if (this.techResourceSub) {
      this.techResourceSub.unsubscribe()
    }
    this.techResourceSub = this.sharedViewSrvc.techUrlChangeSubject$.subscribe(newUrl => {
      this.openInNewTab(false, newUrl)
    })

    this.isIntranetUrl = false
    this.progress = 100
    this.pageFetchStatus = 'fetching'
    this.showIframeSupportWarning = false
    this.intranetUrlPatterns = this.configSvc.instanceConfig
      ? this.configSvc.instanceConfig.intranetIframeUrls
      : []
    if (this.htmlContent && !this.htmlContent.hasOwnProperty('isIframeSupported')) {
      // for technology assetType, this key is not coming, so setting it as default to No for code to work,
      // originally, the key should be there in the content itself
      this.htmlContent['isIframeSupported'] = 'No'
    }
    let iframeSupport: boolean | string | null =
      this.htmlContent && this.htmlContent.isIframeSupported
    if (this.htmlContent && this.htmlContent.artifactUrl) {
      if (this.htmlContent.artifactUrl.startsWith('http://')) {
        this.htmlContent.isIframeSupported = 'No'
      }
      if (typeof iframeSupport !== 'boolean') {
        iframeSupport = (this.htmlContent && this.htmlContent.isIframeSupported) ? this.htmlContent.isIframeSupported.toLowerCase() : 'no'
        if (iframeSupport === 'no') {
          this.showIframeSupportWarning = true
          this.loaderIntervalTimeout = setTimeout(() => this.openInNewTab(), 3000)
          setInterval(() => this.progress -= 1, 30)
        } else if (iframeSupport === 'maybe') {
          this.showIframeSupportWarning = true
        } else {
          this.showIframeSupportWarning = false
        }
      }
      if (this.intranetUrlPatterns && this.intranetUrlPatterns.length) {
        this.intranetUrlPatterns.forEach(iup => {
          if (this.htmlContent && this.htmlContent.artifactUrl) {
            if (this.htmlContent.artifactUrl.startsWith(iup)) {
              this.isIntranetUrl = true
            }
          }
        })
      }
      this.showIsLoadingMessage = false
      if (this.htmlContent.isIframeSupported !== 'No') {
        setTimeout(
          () => {
            if (this.pageFetchStatus === 'fetching') {
              this.showIsLoadingMessage = true
            }
          },
          3000,
        )
      }
        const maybeYTUrl = this.parseForYoutube(this.htmlContent.artifactUrl) // it will convert a faulty youtube url into an embeddable url
       this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(
        maybeYTUrl,
      )
    } else if (this.htmlContent && this.htmlContent.artifactUrl === '') {
      this.iframeUrl = null
      this.pageFetchStatus = 'artifactUrlMissing'
    } else {
      this.iframeUrl = null
      this.pageFetchStatus = 'error'
    }
  }

  parseForYoutube(url: string) {
    return url.replace('watch?v=', 'embed/')
  }

  backToDetailsPage() {
    this.router.navigate([
      `/app/toc/${this.htmlContent ? this.htmlContent.identifier : ''}/overview`,
    ])
  }

  openInNewTab(triggeredManually = false, customUrl?: null | string) {
    if (triggeredManually) {
      window.clearTimeout(this.loaderIntervalTimeout)
      this.progress = -1
    }
    const redirecturl = this.prepare(customUrl)
    if (this.htmlContent) {
      if (this.mobAppSvc && this.mobAppSvc.isMobile) {
        // window.open(this.htmlContent.artifactUrl)
        setTimeout(
          () => {
            this.mobileOpenInNewTab.nativeElement.click()
          },
          0,
        )
      } else {
        const width = window.outerWidth
        const height = window.outerHeight
        const isWindowOpen = this.openWindow(width, height, redirecturl as string)
        if (isWindowOpen === null) {
          const msg = 'The pop up window has been blocked by your browser, please unblock to continue.'
          this.snackBar.open(msg)
        }
      }
    }
  }

  openWindow(width: any, height: any, redirecturl: string) {
    return window.open(
      redirecturl,
      '_blank',
      `toolbar=yes,
         scrollbars=yes,
         resizable=yes,
         menubar=no,
         location=no,
         addressbar=no,
         top=${(15 * height) / 100},
         left=${(2 * width) / 100},
         width=${(65 * width) / 100},
         height=${(70 * height) / 100}`,
    )
  }

  dismiss() {
    this.showIframeSupportWarning = false
    this.isIntranetUrl = false
  }

  onIframeLoadOrError(evt: 'load' | 'error', iframe?: HTMLIFrameElement, event?: any) {
    if (evt === 'error') {
      this.pageFetchStatus = evt
    }
    if (evt === 'load' && iframe && iframe.contentWindow) {
      if (event && iframe.onload) {
        iframe.onload(event)
      }
      iframe.onload = (data => {
        if (data.target) {
          this.pageFetchStatus = 'done'
          this.showIsLoadingMessage = false
        }
      })
    }
  }

  prepare(customLink?: null | string) {
    if (customLink) {
      return customLink
    }
    let link = ''
    if (this.htmlContent) {
      if (this.htmlContent.assetType === 'Knowledge') {
        link = this.htmlContent.artifactUrl

      } else if (this.htmlContent.assetType === 'Technology') {
        link = this.htmlContent.codebase

      } else if (this.htmlContent.assetType === 'Connection') {
        link = this.htmlContent.profile_link
      } else {
        link = (this.htmlContent.artifactUrl)
      }
    }
    return link
  }

  ngOnDestroy() {
    if (this.techResourceSub) {
      this.techResourceSub.unsubscribe()
    }
  }

}
