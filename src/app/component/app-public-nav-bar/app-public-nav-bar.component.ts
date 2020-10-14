import { Component, OnInit, OnDestroy } from '@angular/core'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'
import { ConfigurationsService, NsPage, AuthKeycloakService } from '@ws-widget/utils'
import { IWSPublicLoginConfig } from '../login/login.model'
import { ActivatedRoute, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { filter } from 'rxjs/operators'

@Component({
  selector: 'ws-app-public-nav-bar',
  templateUrl: './app-public-nav-bar.component.html',
  styleUrls: ['./app-public-nav-bar.component.scss'],
})
export class AppPublicNavBarComponent implements OnInit, OnDestroy {
  appIcon: SafeUrl | null = null
  logo = ''
  appName = ''
  navBar: Partial<NsPage.INavBackground> | null = null
  loginConfig: IWSPublicLoginConfig | null = null
  private subscriptionLogin: Subscription | null = null
  // todo what to do for client login
  isClientLogin = false
  private redirectUrl = ''
  objectKeys = Object.keys
  clicked = false

  constructor(
    private domSanitizer: DomSanitizer,
    private configSvc: ConfigurationsService,
    private activateRoute: ActivatedRoute,
    private authSvc: AuthKeycloakService,
    private router: Router,
  ) { }

  public get showPublicNavbar(): boolean {
    return true
  }

  ngOnInit() {
    if (this.configSvc.instanceConfig) {
      this.appIcon = this.domSanitizer.bypassSecurityTrustResourceUrl(
        this.configSvc.instanceConfig.logos.app,
      )
      this.appName = this.configSvc.instanceConfig.details.appName
      this.navBar = this.configSvc.primaryNavBar
    }
    const paramsMap = this.activateRoute.snapshot.queryParamMap
    if (paramsMap.has('ref')) {
      this.redirectUrl = document.baseURI + paramsMap.get('ref')
    } else {
      this.redirectUrl = document.baseURI
    }
    this.router.events.pipe(filter((_: any) => _.url)).subscribe((navigationEvent: any) => {
      if (!navigationEvent.url.split('content-share') && !navigationEvent.url.split('contentshare')) {
        // delete the session data, if any (if user tries to move out of reserved sharable url)
        if (this.configSvc.isGuestUser) {
          this.configSvc.removeGuestUser()
          // alert('removed guest user access')
        }
      }
    })

  }
  ngOnDestroy() {
    if (this.subscriptionLogin) {
      this.subscriptionLogin.unsubscribe()
    }
  }
  gotoHashtag(prodID: string) {
    this.router.navigate(['public/collaborators'], { fragment: prodID })
  }
  login(key: 'E' | 'N' | 'S') {
    if (key === 'S' && this.configSvc.isGuestUser) {
      this.configSvc.removeGuestUser()
      // alert('removed guest user from signin button')
    }
    this.authSvc.login(key, this.redirectUrl)
  }
}
