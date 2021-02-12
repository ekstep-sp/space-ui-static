import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core'
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router'
// import { interval, concat, timer } from 'rxjs'
import { BtnPageBackService } from '@ws-widget/collection'
import {
  AuthKeycloakService,
  ConfigurationsService,
  TelemetryService,
  ValueService,
  WsEvents,
} from '@ws-widget/utils'
import { delay, filter } from 'rxjs/operators'
import { MobileAppsService } from '../../services/mobile-apps.service'
import { RootService } from './root.service'
import { combineLatest } from 'rxjs'
import { GoogleAnalyticsCoreService } from 'src/app/modules/google-analytics/services/google-analytics-core.service'

@Component({
  selector: 'ws-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
})
export class RootComponent implements OnInit {
  @ViewChild('previewContainer', { read: ViewContainerRef, static: true })
  previewContainerViewRef: ViewContainerRef | null = null
  @ViewChild('appUpdateTitle', { static: true })
  appUpdateTitleRef: ElementRef | null = null
  @ViewChild('appUpdateBody', { static: true })
  appUpdateBodyRef: ElementRef | null = null

  isXSmall$ = this.valueSvc.isXSmall$
  routeChangeInProgress = false
  showNavbar = false
  currentUrl!: string
  isNavBarRequired = false
  isInIframe = false
  appStartRaised = false
  isSetupPage = false
  showBottomNavbar = true
  constructor(
    private router: Router,
    public authSvc: AuthKeycloakService,
    public configSvc: ConfigurationsService,
    private valueSvc: ValueService,
    private telemetrySvc: TelemetryService,
    private mobileAppsSvc: MobileAppsService,
    private rootSvc: RootService,
    private btnBackSvc: BtnPageBackService,
    private changeDetector: ChangeDetectorRef,
    private readonly googleAnalyticsCoreSrvc: GoogleAnalyticsCoreService,
  ) {
    this.mobileAppsSvc.init()
    // enable google analytics
    const analyticsObj = this.getGAObjFromConfig()
    // tslint:disable-next-line: max-line-length
    if (analyticsObj && analyticsObj.type === 'GA' && analyticsObj.trackingID) {
      this.googleAnalyticsCoreSrvc.init(analyticsObj.trackingID)
    }
  }

  ngOnInit() {
    try {
      this.isInIframe = window.self !== window.top
    } catch (_ex) {
      this.isInIframe = false
    }

    this.btnBackSvc.initialize()
    // Application start telemetry
    if (this.authSvc.isAuthenticated) {
      this.telemetrySvc.start('app', 'view', '')
      this.appStartRaised = true

    }
    this.router.events.pipe(filter((_: any) => {
      if (this.configSvc.isGuestUser) {
        // to not show loader in guest mode
        this.routeChangeInProgress = false
      }
      return !this.configSvc.isGuestUser
    })).subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        if (event.url.includes('/setup/')) {
          this.isSetupPage = true
        }
      }
      if (event instanceof NavigationStart) {
        if (event.url.includes('preview') || event.url.includes('embed')) {
          this.isNavBarRequired = false
        } else if (event.url.includes('author/') && this.isInIframe) {
          this.isNavBarRequired = false
        } else {
          this.isNavBarRequired = true
        }
        this.routeChangeInProgress = true
        this.changeDetector.detectChanges()
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.routeChangeInProgress = false
        this.currentUrl = event.url
        this.changeDetector.detectChanges()
      }

      if (event instanceof NavigationEnd) {
        this.telemetrySvc.impression()
        if (this.appStartRaised) {
          this.telemetrySvc.audit(WsEvents.WsAuditTypes.Created, 'Login', {})
          this.appStartRaised = false
        }
      }
    })
    this.rootSvc.showNavbarDisplay$.pipe(delay(500)).subscribe(display => {
      this.showNavbar = display
    })
    combineLatest([this.rootSvc.showNavbarDisplay$, this.rootSvc.showBottomNav$]).pipe(delay(500)).subscribe(display => {
      this.showNavbar = display[0]
      this.showBottomNavbar = display[1]
    })
  }

  getGAObjFromConfig() {
    // look for analytics key in either site config or host config,
    return this.configSvc.instanceConfig && this.configSvc.instanceConfig.analytics ? this.configSvc.instanceConfig.analytics : null
  }
}
