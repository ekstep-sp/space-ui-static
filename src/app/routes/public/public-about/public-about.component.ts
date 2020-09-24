import { Component, OnInit, OnDestroy } from '@angular/core'
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'
import { DomSanitizer, SafeResourceUrl, SafeStyle } from '@angular/platform-browser'
import { map } from 'rxjs/operators'
import { ConfigurationsService, NsPage } from '@ws-widget/utils'
import { Subscription } from 'rxjs'
import { ActivatedRoute } from '@angular/router'
import { IAboutObject } from './about.model'
import { IWidgetsPlayerMediaData } from '../../../../../library/ws-widget/collection/src/public-api'
import { NsWidgetResolver } from '../../../../../library/ws-widget/resolver/src/public-api'
import {Overlay, OverlayConfig } from '@angular/cdk/overlay'
import { ComponentPortal } from '@angular/cdk/portal'
import { VideoRendererComponent } from '../video-renderer/video-renderer.component'
import { MatDialog } from '@angular/material'

@Component({
  selector: 'ws-public-about',
  templateUrl: './public-about.component.html',
  styleUrls: ['./public-about.component.scss'],
})
export class PublicAboutComponent implements OnInit, OnDestroy {
  objectKeys = Object.keys
  headerBanner: SafeStyle | null = null
  footerBanner: SafeStyle | null = null
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  aboutPage: IAboutObject | null = null
  private subscriptionAbout: Subscription | null = null

  isSmallScreen$ = this.breakpointObserver
    .observe(Breakpoints.XSmall)
    .pipe(map(breakPointState => breakPointState.matches))

  videoLink: SafeResourceUrl | null = null
  aboutImage: SafeStyle | null = null
  widgetResolverData: NsWidgetResolver.IRenderConfigWithTypedData<
    IWidgetsPlayerMediaData
  > = {
      widgetData: {
        url: 'assets/instances/space/videos/intro_video.mp4',
        autoplay: true,
        identifier: '',
      },
      widgetHostClass: 'video-full block',
      widgetSubType: 'playerVideo',
      widgetType: 'player',
      widgetHostStyle: {
        height: '100%',
        'max-width': '90%',
        'margin-left': 'auto',
        'margin-right': 'auto',
      },
    }

  constructor(
    private breakpointObserver: BreakpointObserver,
    private domSanitizer: DomSanitizer,
    private configSvc: ConfigurationsService,
    private activateRoute: ActivatedRoute,
    private readonly overlay: Overlay,
    private readonly dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.subscriptionAbout = this.activateRoute.data.subscribe(data => {
      this.aboutPage = data.pageData.data
      debugger
      if (this.aboutPage && this.aboutPage.banner && this.aboutPage.banner.videoLink) {
        this.videoLink = this.domSanitizer.bypassSecurityTrustResourceUrl(
          this.aboutPage.banner.videoLink,
        )
      }
    })

    if (this.configSvc.instanceConfig) {
      (this.headerBanner = this.domSanitizer.bypassSecurityTrustStyle(
        `url('${this.configSvc.instanceConfig.logos.aboutHeader}')`,
      )),
        (this.footerBanner = this.domSanitizer.bypassSecurityTrustStyle(
          `url('${this.configSvc.instanceConfig.logos.aboutFooter}')`,
        ))
      this.aboutImage = this.configSvc.instanceConfig.banners.aboutBanner
    }
  }

  ngOnDestroy() {
    if (this.subscriptionAbout) {
      this.subscriptionAbout.unsubscribe()
    }
  }

playTourVideo() {
  const config = new OverlayConfig({
    hasBackdrop: true,
    backdropClass: 'cdk-overlay-transparent-backdrop',
    positionStrategy: this.overlay.position().global().centerHorizontally(),
    height: '100%',
    width: '100%',
  })
  const overlayRef = this.overlay.create(config)
  const tourVideoPortal = new ComponentPortal(VideoRendererComponent)
  overlayRef.attach(tourVideoPortal)
}

openVideoDialog() {
  this.dialog.open(VideoRendererComponent, {
    width: '95%',
    height: '95%',
    data: this.aboutPage ? this.aboutPage.introVideo.en : null,
    panelClass: 'custom-padding',
  })
}
}
