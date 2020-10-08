import { Component, OnInit, Input, OnDestroy, ViewChild, Output } from '@angular/core'
import { NsAppsConfig, NsPage, ConfigurationsService, AuthKeycloakService, UtilityService } from '../../../../utils/src/public-api'
import { NsWidgetResolver } from '../../../../resolver/src/public-api'
import { AppBtnFeatureService } from './service/app-btn-feature.service'
import { Router } from '@angular/router'
import { Subscription, BehaviorSubject } from 'rxjs'
import { MatExpansionPanel, MatAccordion } from '@angular/material'

interface IGroupWithFeatureWidgets extends NsAppsConfig.IGroup {
  featureWidgets: NsWidgetResolver.IRenderConfigWithTypedData<NsPage.INavLink>[],
  name: string
}
export const typeMap = {
  cardFull: 'card-full',
  cardMini: 'card-mini',
  cardSmall: 'card-small',
  matButton: 'mat-button',
  matFabButton: 'mat-fab',
  matFlatButton: 'mat-flat-button',
  matIconButton: 'mat-icon-button',
  matMiniFabButton: 'mat-mini-fab',
  matRaisedButton: 'mat-raised-button',
  matStrokedButton: 'mat-stroked-button',
  menuItem: 'mat-menu-item',
  featureItem: 'feature-item',
  externalLinkButton: 'external-link-button',
}
@Component({
  selector: 'ws-widget-app-btn-feature',
  templateUrl: './app-btn-feature.component.html',
  styleUrls: ['./app-btn-feature.component.scss'],
})
export class AppBtnFeatureComponent implements OnInit, OnDestroy {
  @ViewChild('panel', { static: true }) expansionPanel!: MatExpansionPanel
  @ViewChild('accordion', { static: true }) mAccordion!: MatAccordion
  @Output() mataccordion!: BehaviorSubject<MatAccordion>
  @Input() widget: IGroupWithFeatureWidgets[] | any = []
  rolesBasedFeatureGroups: IGroupWithFeatureWidgets[] = []
  readonly displayType = typeMap
  allowedToFeedback = true
  allowedToAuthor = true
  featuredWidget: IGroupWithFeatureWidgets[] | any = []
  expand = false
  openedPanels: any = []
  expansion$: Subscription | null = null

  constructor(
    public configSvc: ConfigurationsService,
    private authSvc: AuthKeycloakService,
    public featureService: AppBtnFeatureService,
    public router: Router,
    public utilitySvc: UtilityService,
  ) { }

  ngOnInit() {
    this.expansion$ = this.featureService.triggerExpansion.subscribe((newExpansion: boolean) => {
      this.expand = newExpansion
      // console.log('expanded now is ', this.expand)
    })
    this.setUpPermission()
    this.isAllowedForDisplay(this.widget)
    this.featuredWidget = this.widget
  }

  setUpPermission() {
    if (this.widget) {
      const allowed = this.widget.rolesAllowed || []
      const notAllowed = this.widget.rolesNotAllowed || []
      if (this.featureService.isVisibileAccToRoles(allowed, notAllowed)) {
        this.widget.show = true
      } else {
        this.widget.show = false
      }
    }
    if (this.widget.show && this.widget.expand && this.widget.featureWidgets.length) {
      this.widget.featureWidgets.forEach((widget: any) => {
        const allowed = widget.widgetData.actionBtn.allowedRoles || []
        const notAllowed = this.widget.rolesNotAllowed || []
        widget.widgetData.actionBtn.show = this.featureService.isVisibileAccToRoles(allowed, notAllowed)
      })
    }
  }
  maintainState(panel: MatExpansionPanel, accordion: MatAccordion) {
    this.expansionPanel = panel
    this.mAccordion = accordion
    // this.featureService.triggerAppsExpansionClose(this.expansionPanel)
  }
  navigate(key: any, _e: any, _actionBtn: any) {
    // if (actionBtn !== 'Profile' && actionBtn !== 'Settings') {
    // this.expansionPanel.expanded = false
    // }
    this.router.navigateByUrl(key)
  }
  maintainPropagation(event: any) {
    if (!event.target.className.split(' ').includes('innerSpan')) {
      event.preventDefault()
      event.stopPropagation()
    }
  }
  isMobile(name: string): boolean {
    if (this.utilitySvc.isMobile && name === 'Contribute') {
      return true
    }
    return false
  }
  logout() {
    this.authSvc.logout()
  }
  isAllowedForDisplay(feature: any) {
    if (feature) {
      this.rolesBasedFeatureGroups = []
      feature.featureWidgets.forEach((data: any) => {
        if (data.allowedRoles) {
          const requiredRolePreset = data.allowedRoles.some((item: any) =>
            (this.configSvc.userRoles || new Set()).has(item),
          )
          if (requiredRolePreset) {
            this.rolesBasedFeatureGroups.push(data)
          }
        } else {
          this.rolesBasedFeatureGroups.push(data)
        }
      })
    }
  }

  // setExpansion(currentExpansion: boolean) {
  //   this.expand = currentExpansion
  // }

  ngOnDestroy() {
    if (this.expansion$) {
      this.expansion$.unsubscribe()
    }
  }
}
