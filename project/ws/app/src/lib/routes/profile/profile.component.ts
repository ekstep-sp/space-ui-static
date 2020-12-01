import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material'
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import { ConfigurationsService, LogoutComponent, NsPage, ValueService } from '@ws-widget/utils'
import { Subscription } from 'rxjs'
import { map } from 'rxjs/operators'
import { ProfileService } from './services/profile.service'

@Component({
  selector: 'ws-app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy, AfterViewInit {
  tabName = ''
  private defaultSideNavBarOpenedSubscription: Subscription | null = null
  isLtMedium$ = this.valueSvc.isLtMedium$
  mode$ = this.isLtMedium$.pipe(map((isMedium: boolean) => (isMedium ? 'over' : 'side')))
  screenSizeIsLtMedium = false
  showText = true
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  enabledTabs = this.activatedRoute.snapshot.data.pageData.data.enabledTabs
  private routerSubscription: Subscription | null = null
  clickedOnArrow = false
  navElement: any
  leftValue: any
  defaultleftValue = '0px'
  status = true

  constructor(
    private dialog: MatDialog,
    private valueSvc: ValueService,
    private configSvc: ConfigurationsService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public profileSvc: ProfileService,
  ) {}

  ngOnInit() {
    // tslint:disable-next-line: max-line-length
    this.router.events.subscribe((data: any) => {
      if (data.hasOwnProperty('routerEvent') && data.routerEvent instanceof NavigationEnd) {
        this.assignTabName([...data.routerEvent.urlAfterRedirects.split('/')].pop())
      } else if (data instanceof NavigationEnd) {
        this.assignTabName([...data.urlAfterRedirects.split('/')].pop())
      }
    })
    this.defaultSideNavBarOpenedSubscription = this.isLtMedium$.subscribe((isLtMedium: boolean) => {
      this.screenSizeIsLtMedium = isLtMedium
    })
  }
  tabUpdate(tab: string) {
    this.tabName = tab
    // if (!this.screenSizeIsLtMedium) {
    //   this.showText = !this.showText
    //  }
  }
  tabUpdateWithBackBtn() {
    if (this.routerSubscription) {

      this.routerSubscription.unsubscribe()
    }
    this.routerSubscription = this.router.events.subscribe((event: any) => {
      if (event.url) {
        const tab = event.url.split('/')[3]
        this.assignTabName(tab)
      }
    })
  }
  assignTabName(tab: String = '') {
    if (tab === 'dashboard') {
      this.tabName = this.enabledTabs.dashboard.displayName
    } else if (tab === 'edit-profile') {
      this.tabName = this.enabledTabs.dashboard.editProfile.displayName
    }  else if (tab === 'learning.*' || tab === 'history' || tab  === 'time') {
      this.tabName = this.enabledTabs.learning.displayName
    } else if (tab === 'competency') {
      this.tabName = this.enabledTabs.achievements.displayName
    } else if (tab === 'interest') {
      this.tabName = this.enabledTabs.interests.displayName
    } else if (tab === 'plans') {
      this.tabName = this.enabledTabs.plans.displayName
    } else if (tab === 'collaborators') {
      this.tabName = this.enabledTabs.collaborators.displayName
    } else if (tab === 'feature-usage') {
      this.tabName = this.enabledTabs.featureUsage.displayName
    } else if (tab === 'settings') {
      this.tabName = this.enabledTabs.settings.displayName
    } else if (tab.match('settings.*')) {
      this.tabName = this.enabledTabs.settings.displayName
    }
  }

  ngOnDestroy() {
    if (this.defaultSideNavBarOpenedSubscription) {
      this.defaultSideNavBarOpenedSubscription.unsubscribe()
    }
  }
  logout() {
    this.dialog.open<LogoutComponent>(LogoutComponent)
  }
  triggerToggle(toggleVariable: any) {
   toggleVariable.toggle()
  }
  triggerNav() {
    this.profileSvc.updateNavStatus(!status)
  }

  handleRouteChange() {
//  const toggleElement = document.getElementsByClassName('toggle-span')[0]
//  toggleElement['style']['left'] = '0px'
  }
ngAfterViewInit(): void {
  // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
  // Add 'implements AfterViewInit' to the class.
  this.navElement = document.getElementsByClassName('mat-nav-list')[0]
  this.leftValue = `${this.navElement['offsetWidth'] + 10}px`
  this.defaultleftValue = '0px'
}
}
