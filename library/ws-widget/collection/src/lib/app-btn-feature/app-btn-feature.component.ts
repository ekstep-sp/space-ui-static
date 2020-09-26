import { Component, OnInit, Input } from '@angular/core'
import { NsAppsConfig, NsPage, ConfigurationsService, AuthKeycloakService } from '../../../../utils/src/public-api'
import { NsWidgetResolver } from '../../../../resolver/src/public-api'
import { AppBtnFeatureService } from './service/app-btn-feature.service'
import { Router } from '@angular/router'

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
export class AppBtnFeatureComponent implements OnInit {

  @Input() featuredWidget: IGroupWithFeatureWidgets[] | any = []
  rolesBasedFeatureGroups: IGroupWithFeatureWidgets[] = []
  readonly displayType = typeMap
  allowedToFeedback = true
  allowedToAuthor = true

  constructor(
    public configSvc: ConfigurationsService,
    private authSvc: AuthKeycloakService,
    public featureService: AppBtnFeatureService,
    public router: Router,
  ) { }

  ngOnInit() {
    this.setUpPermission()
    this.isAllowedForDisplay(this.featuredWidget)
  }
  setUpPermission() {
    if (this.featuredWidget) {
      const allowed = this.featuredWidget.rolesAllowed || []
      const notAllowed = this.featuredWidget.rolesNotAllowed || []
      if (this.featureService.isVisibileAccToRoles(allowed, notAllowed)) {
        this.featuredWidget.show = true
      } else {
        this.featuredWidget.show = false
      }
    }
    if (this.featuredWidget.show && this.featuredWidget.expand && this.featuredWidget.featureWidgets.length) {
      this.featuredWidget.featureWidgets.forEach((widget: any) => {
        const allowed = widget.widgetData.actionBtn.allowedRoles || []
        const notAllowed = this.featuredWidget.rolesNotAllowed || []
        widget.widgetData.actionBtn.show = this.featureService.isVisibileAccToRoles(allowed, notAllowed)
      })
    }
  }
  navigate(key: any, e: any) {
    e.preventDefault()
    e.stopPropagation()
    this.router.navigateByUrl(key)
  }
  // get desktopVisible() {
  //   if (this.widgetData.actionBtn && this.widgetData.actionBtn.mobileAppFunction) {
  //     if (!this.mobileSvc.isMobile) {
  //       return false
  //     }
  //     return true
  //   }
  //   return true
  // }
  // updateBadge() {
  //   if (this.widgetData.actionBtn && this.widgetData.actionBtn.badgeEndpoint) {
  //     this.btnFeatureSvc
  //       .getBadgeCount(this.widgetData.actionBtn.badgeEndpoint)
  //       .then(count => {
  //         if (count > 99) {
  //           this.badgeCount = '99+'
  //         } else if (count > 0) {
  //           this.badgeCount = count.toString()
  //         } else {
  //           this.badgeCount = ''
  //         }
  //       })
  //       .catch(_err => { })
  //   }
  // }
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
}
