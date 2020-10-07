import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { ConfigurationsService, NsPage, LogoutComponent, NsAppsConfig } from '@ws-widget/utils'
import { Subscription } from 'rxjs'
import { ROOT_WIDGET_CONFIG } from '../collection.config'
import { IBtnAppsConfig } from './btn-apps.model'
import { ActivatedRoute } from '@angular/router'
import { MatDialog, MatExpansionPanel } from '@angular/material'
import { FormControl } from '@angular/forms'
import { distinctUntilChanged, startWith, debounceTime } from 'rxjs/operators'
import { AppBtnFeatureService } from '../app-btn-feature/service/app-btn-feature.service'

interface IGroupWithFeatureWidgets extends NsAppsConfig.IGroup {
  featureWidgets: NsWidgetResolver.IRenderConfigWithTypedData<NsPage.INavLink>[]
}

@Component({
  selector: 'ws-widget-btn-apps',
  templateUrl: './btn-apps.component.html',
  styleUrls: ['./btn-apps.component.scss'],
})
export class BtnAppsComponent extends WidgetBaseComponent
  implements OnInit, OnDestroy, NsWidgetResolver.IWidgetData<IBtnAppsConfig> {
  queryControl = new FormControl(this.activateRoute.snapshot.queryParamMap.get('q'))
  private readonly featuresConfig: IGroupWithFeatureWidgets[] = []
  featureGroups: IGroupWithFeatureWidgets[] | null = null
  rolesBasedFeatureGroups: IGroupWithFeatureWidgets[] = []
  @Input() widgetData!: IBtnAppsConfig
  isPinFeatureAvailable = true
  instanceVal = ''
  isUrlOpened = false
  expansion$: Subscription | null = null
  allOpenedPanel: [] | any
  object !: MatExpansionPanel
  pinnedApps: NsWidgetResolver.IRenderConfigWithTypedData<NsPage.INavLink>[] = []
  featuredApps: NsWidgetResolver.IRenderConfigWithTypedData<NsPage.INavLink>[] = []

  private pinnedAppsSubs?: Subscription
  constructor(
    private dialog: MatDialog,
    private configSvc: ConfigurationsService,
    private activateRoute: ActivatedRoute,
    private readonly featureSrvc: AppBtnFeatureService
  ) {
    super()
    if (this.configSvc.appsConfig) {
      const appsConfig = this.configSvc.appsConfig
      this.featuresConfig = appsConfig.groups.map(
        (group: NsAppsConfig.IGroup): IGroupWithFeatureWidgets => ({
          ...group,
          featureWidgets: group.featureIds.map(
            (id: string): NsWidgetResolver.IRenderConfigWithTypedData<NsPage.INavLink> =>
              ({
                widgetType: ROOT_WIDGET_CONFIG.actionButton._type,
                widgetSubType: ROOT_WIDGET_CONFIG.actionButton.feature,
                widgetHostClass: 'my-2 px-2 w-1/2 sm:w-1/3 md:w-1/6 w-lg-1-8 box-sizing-box',
                widgetData: {
                  config: {
                    type: 'feature-item',
                    useShortName: false,
                    treatAsCard: true,
                  },
                  actionBtn: appsConfig.features[id],
                },
              }),
          ),
        }),
      )
    }
    // existing code, removed because app/features is no longer available
    /* this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (this.router.url === '/app/features') {
          this.isUrlOpened = true
        } else {
          this.isUrlOpened = false
        }
      } else if (event instanceof NavigationEnd) {
        if (this.router.url === '/app/features') {
          this.isUrlOpened = true
        } else {
          this.isUrlOpened = false
        }
      }
    }) */
  }

  ngOnInit() {
    // this.expansion$ = this.featureSrvc.triggerExpansionPanel.subscribe((newExpansion: MatExpansionPanel[] | null) => {
    //  this.allOpenedPanel = newExpansion
    // })
    this.instanceVal = this.configSvc.rootOrg || ''
    if (this.configSvc.restrictedFeatures) {
      this.isPinFeatureAvailable = !this.configSvc.restrictedFeatures.has('pinFeatures')
    }
    this.queryControl.valueChanges
      .pipe(
        startWith(this.activateRoute.snapshot.queryParamMap.get('q')),
        debounceTime(500),
        distinctUntilChanged(),
      )
      .subscribe((query: string) => {
        // this.router.navigate([], { queryParams: { q: query || null } })
        this.featureGroups = this.filteredFeatures(query)
        this.rolesBasedFeatureGroups = this.featureGroups
        this.isAllowedForDisplay()
      })
    this.setPinnedApps()
    this.setFeaturedApps()
  }
  ngOnDestroy() {
    if (this.pinnedAppsSubs) {
      this.pinnedAppsSubs.unsubscribe()
    }
  }

  setPinnedApps() {
    this.pinnedAppsSubs = this.configSvc.pinnedApps.subscribe(pinnedApps => {
      const appsConfig = this.configSvc.appsConfig
      if (!appsConfig) {
        return
      }
      this.pinnedApps = Array.from(pinnedApps)
        .filter(id => id in appsConfig.features)
        .map(id => ({
          widgetType: ROOT_WIDGET_CONFIG.actionButton._type,
          widgetSubType: ROOT_WIDGET_CONFIG.actionButton.feature,
          widgetHostClass: 'w-1/3 px-2 py-3 box-sizing-box',
          widgetData: {
            config: {
              type: 'feature-item',
              useShortName: true,
            },
            actionBtn: appsConfig.features[id],
          },
        }))
    })
  }
  private filteredFeatures(query: string): IGroupWithFeatureWidgets[] {
    if (!query && this.featuresConfig) {
      return this.featuresConfig
    }
    if (this.featuresConfig === null) {
      return []
    }
    const q = query.toLowerCase()
    return this.featuresConfig
      .map(g => ({
        ...g,
        featureWidgets: g.featureWidgets.filter(featureWidget =>
          this.queryMatchForFeature(featureWidget.widgetData.actionBtn, q),
        ),
      }))
      .filter(group => group.featureWidgets && group.featureWidgets.length > 0)
  }

  private queryMatchForFeature(feature: NsAppsConfig.IFeature | undefined, query: string): boolean {
    if (feature) {
      return Boolean(
        feature.name.includes(query) ||
        feature.keywords.some(keyword => keyword.includes(query)) ||
        (feature.description && feature.description.includes(query)),
      )
    }
    return false
  }

  setFeaturedApps() {
    const instanceConfig = this.configSvc.instanceConfig
    const appsConfig = this.configSvc.appsConfig

    if (instanceConfig && instanceConfig.featuredApps && appsConfig) {
      this.featuredApps = instanceConfig.featuredApps
        .filter(id => id in appsConfig.features)
        .map(
          (id: string): NsWidgetResolver.IRenderConfigWithTypedData<NsPage.INavLink> => ({
            widgetType: ROOT_WIDGET_CONFIG.actionButton._type,
            widgetSubType: ROOT_WIDGET_CONFIG.actionButton.feature,
            widgetHostClass: 'w-1/3 px-2 py-3 box-sizing-box',
            widgetData: {
              config: {
                type: 'feature-item',
                useShortName: true,
                hidePin: true,
              },
              actionBtn: appsConfig.features[id],
            },
          }),
        )
    }
  }

  logout() {
    this.dialog.open<LogoutComponent>(LogoutComponent)
  }
  isAllowedForDisplay() {
    if (this.featureGroups) {
      this.rolesBasedFeatureGroups = []
      this.featureGroups.forEach(data => {
        if (data.allowedRoles) {
          const requiredRolePreset = data.allowedRoles.some(item =>
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
  triggerExpansion() {
     this.featureSrvc.triggerAppsExpansion(false)
      // this.featureSrvc.triggerAppsExpansionStatus(true)
    }
}
