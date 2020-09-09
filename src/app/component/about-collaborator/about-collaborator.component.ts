import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core'
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'
import { DomSanitizer, SafeResourceUrl, SafeStyle } from '@angular/platform-browser'
import { map } from 'rxjs/operators'
import { ConfigurationsService, NsPage } from '@ws-widget/utils'
import { Subscription } from 'rxjs'
import { ActivatedRoute } from '@angular/router'
import { IAboutObject } from '../../routes/public/public-about/about.model'

@Component({
  selector: 'ws-about-collaborator',
  templateUrl: './about-collaborator.component.html',
  styleUrls: ['./about-collaborator.component.scss'],
})
export class AboutCollaboratorComponent implements OnInit, OnDestroy, AfterViewInit {
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
  forPreview = false

  constructor(
    private breakpointObserver: BreakpointObserver,
    private domSanitizer: DomSanitizer,
    private configSvc: ConfigurationsService,
    private activateRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.subscriptionAbout = this.activateRoute.data.subscribe(data => {
      this.aboutPage = data.pageData.data
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
  ngAfterViewInit(): void {
    // const about = document.getElementById('about') as any
    const collaborator = document.getElementById('collaborator') as any
    if (window.location.href.includes('/collaborators') && collaborator) {
      location.hash = '#view'
    }
  }
  ngOnDestroy() {
    if (this.subscriptionAbout) {
      this.subscriptionAbout.unsubscribe()
    }
  }
}
