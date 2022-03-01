import { APP_BASE_HREF } from '@angular/common'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Inject, Injectable } from '@angular/core'
import { MatIconRegistry } from '@angular/material'
import { DomSanitizer } from '@angular/platform-browser'
import { BtnSettingsService, WidgetContentService } from '@ws-widget/collection'
import {
  hasPermissions,
  hasUnitPermission,
  NsWidgetResolver,
  WidgetResolverService,
} from '@ws-widget/resolver'
import {
  AuthKeycloakService,
  ConfigurationsService,
  LoggerService,
  NsAppsConfig,
  NsInstanceConfig,
  NsUser,
  UserPreferenceService,
} from '@ws-widget/utils'
import { environment } from '../../environments/environment'
import { NsUserDashboard } from '../../../project/ws/app/src/lib/routes/user-dashboard/models/user-dashboard.model'
interface IDetailsResponse {
  tncStatus: boolean
  roles: string[]
  group: string[]
}

interface IResponse {
  ok: boolean
  error?: string | null,
  DATA?: string
  STATUS?: string,
  MESSAGE: string,
  ErrorResponseData?: string,
  API_ID?: string,
  STATUS_CODE?: number,
  TIME_STAMP?: any,
  wid?: string,
  email?: string,
}

interface IFeaturePermissionConfigs {
  [id: string]: Omit<NsWidgetResolver.IPermissions, 'feature'>
}

const endpoint = {
  profilePid: '/apis/protected/v8/user/details/wtoken',
  details: `/apis/protected/v8/user/details?ts=${Date.now()}`,
}

@Injectable({
  providedIn: 'root',
})
export class InitService {
  private baseUrl = this.configSvc.baseUrl
  private token = ''
  userData: NsUserDashboard.IUserData = {} as NsUserDashboard.IUserData
  widUser = ''
  constructor(
    private logger: LoggerService,
    private configSvc: ConfigurationsService,
    private authSvc: AuthKeycloakService,
    private widgetResolverService: WidgetResolverService,
    private settingsSvc: BtnSettingsService,
    private userPreference: UserPreferenceService,
    private http: HttpClient,
    private widgetContentSvc: WidgetContentService,

    @Inject(APP_BASE_HREF) private baseHref: string,
    // private router: Router,
    domSanitizer: DomSanitizer,
    iconRegistry: MatIconRegistry,
  ) {
    this.configSvc.isProduction = environment.production

    // Register pin icon for use in Knowledge Board
    // Usage: <mat-icon svgIcon="pin"></mat-icon>

    iconRegistry.addSvgIcon(
      'pin',
      domSanitizer.bypassSecurityTrustResourceUrl('fusion-assets/icons/pin.svg'),
    )
    iconRegistry.addSvgIcon(
      'facebook',
      domSanitizer.bypassSecurityTrustResourceUrl('fusion-assets/icons/facebook.svg'),
    )
    iconRegistry.addSvgIcon(
      'linked-in',
      domSanitizer.bypassSecurityTrustResourceUrl('fusion-assets/icons/linked-in.svg'),
    )
    iconRegistry.addSvgIcon(
      'twitter',
      domSanitizer.bypassSecurityTrustResourceUrl('fusion-assets/icons/twitter.svg'),
    )
  }

  getUserProfile() {
    return this.configSvc.userProfile
  }

  async init() {
    // this.logger.removeConsoleAccess()
    await this.fetchDefaultConfig()
    const authenticated = await this.authSvc.initAuth()
    if (!authenticated) {
      this.settingsSvc.initializePrefChanges(environment.production)
      this.updateNavConfig()
      this.logger.info('Not Authenticated')
      return false
    }
    // Invalid User
    try {
      await this.fetchStartUpDetails() // detail: depends only on userID
    } catch (e) {
      this.settingsSvc.initializePrefChanges(environment.production)
      this.updateNavConfig()
      this.logger.info('Not Authenticated')
      return false
    }
    try {
      // this.logger.info('User Authenticated', authenticated)
      const userPrefPromise = await this.userPreference.fetchUserPreference() // pref: depends on rootOrg
      this.configSvc.userPreference = userPrefPromise
      this.reloadAccordingToLocale()
      if (this.configSvc.userPreference.pinnedApps) {
        const pinnedApps = this.configSvc.userPreference.pinnedApps.split(',')
        this.configSvc.pinnedApps.next(new Set(pinnedApps))
      }
      if (this.configSvc.userPreference.profileSettings) {
        this.configSvc.profileSettings = this.configSvc.userPreference.profileSettings
      }
      const appsConfigPromise = this.fetchAppsConfig()
      const instanceConfigPromise = this.fetchInstanceConfig() // config: depends only on details
      const widgetStatusPromise = this.fetchWidgetStatus() // widget: depends only on details & feature
      await this.fetchFeaturesStatus() // feature: depends only on details

      /**
       * Wait for the widgets and get the list of restricted widgets
       */
      const widgetConfig = await widgetStatusPromise
      this.processWidgetStatus(widgetConfig)
      this.widgetResolverService.initialize(
        this.configSvc.restrictedWidgets,
        this.configSvc.userRoles,
        this.configSvc.userGroups,
        this.configSvc.restrictedFeatures,
      )
      /**
       * Wait for the instance config and after that
       */
      await instanceConfigPromise
      /*
       * Wait for the apps config and after that
       */
      const appsConfig = await appsConfigPromise
      this.configSvc.appsConfig = this.processAppsConfig(appsConfig)
      if (this.configSvc.instanceConfig) {
        this.configSvc.instanceConfig.featuredApps = this.configSvc.instanceConfig.featuredApps.filter(
          id => appsConfig.features[id],
        )
      }

      // Apply the settings using settingsService
      this.settingsSvc.initializePrefChanges(environment.production)
      this.userPreference.initialize()
    } catch (e) {
      this.logger.warn(
        'Initialization process encountered some error. Application may not work as expected',
        e,
      )
      this.settingsSvc.initializePrefChanges(environment.production)
    }
    this.updateNavConfig()
    await this.widgetContentSvc
      .setS3ImageCookie()
      .toPromise()
      .catch(() => {
        // throw new DataResponseError('COOKIE_SET_FAILURE')
      })
    return true
  }

  private reloadAccordingToLocale() {
    if (window.location.origin.indexOf('http://localhost:') > -1) {
      return
    }
    let pathName = window.location.href.replace(window.location.origin, '')
    const runningAppLang = this.locale
    if (pathName.startsWith(`//${runningAppLang}//`)) {
      pathName = pathName.replace(`//${runningAppLang}//`, '/')
    }
    const instanceLocales = this.configSvc.instanceConfig && this.configSvc.instanceConfig.locals
    if (Array.isArray(instanceLocales) && instanceLocales.length) {
      const foundInLocales = instanceLocales.some(locale => {
        return locale.path !== runningAppLang
      })
      if (foundInLocales) {
        if (
          this.configSvc.userPreference &&
          this.configSvc.userPreference.selectedLocale &&
          runningAppLang !== this.configSvc.userPreference.selectedLocale
        ) {
          let languageToLoad = this.configSvc.userPreference.selectedLocale
          languageToLoad = `\\${languageToLoad}`
          if (this.configSvc.userPreference.selectedLocale === 'en') {
            languageToLoad = ''
          }
          location.assign(`${location.origin}${languageToLoad}${pathName}`)
        }
      }
    }
  }

  private async fetchDefaultConfig(): Promise<NsInstanceConfig.IConfig> {
    const publicConfig: NsInstanceConfig.IConfig = await this.http
      .get<NsInstanceConfig.IConfig>(`${this.baseUrl}/host.config.json`)
      .toPromise()
    this.configSvc.instanceConfig = publicConfig
    this.configSvc.rootOrg = publicConfig.rootOrg
    this.configSvc.org = publicConfig.org
    // TODO: set one org as default org :: use user preference
    this.configSvc.activeOrg = publicConfig.org[0]
    this.configSvc.appSetup = publicConfig.appSetup
    return publicConfig
  }

  get locale(): string {
    return this.baseHref && this.baseHref.replace(/\//g, '')
      ? this.baseHref.replace(/\//g, '')
      : 'en'
  }

  private async fetchAppsConfig(): Promise<NsAppsConfig.IAppsConfig> {
    const appsConfig = await this.http
      .get<NsAppsConfig.IAppsConfig>(`${this.baseUrl}/feature/apps.json`)
      .toPromise()
    return appsConfig
  }

  updatePidDetails() {
     return this.fetchStartUpDetails()
   }
  private async fetchStartUpDetails(): Promise<IDetailsResponse> {
    if (this.configSvc.instanceConfig && !Boolean(this.configSvc.instanceConfig.disablePidCheck)) {
      let userPidProfile: NsUser.IUserPidProfile | null = null
      try {
        userPidProfile = await this.http
          .get<NsUser.IUserPidProfile>(endpoint.profilePid)
          .toPromise()
      } catch (e) {
        this.configSvc.userProfile = null
        throw new Error('Invalid user')
      }
      if (userPidProfile) {
        this.configSvc.unMappedUser = userPidProfile.user
        this.configSvc.userProfile = {
          country: userPidProfile.user.organization_location_country || null,
          departmentName: userPidProfile.user.department_name || '',
          areaOfWork: userPidProfile.user.area_of_work || '',
          areaOfExpertise: userPidProfile.user.area_of_expertise || '',
          isSubscribedToSpace: userPidProfile.user.is_subscribed_to_space || false,
          email: userPidProfile.user.email,
          givenName: userPidProfile.user.first_name,
          userId: userPidProfile.user.wid,
          unit: userPidProfile.user.unit_name,
          // tslint:disable-next-line:max-line-length
          userName: `${userPidProfile.user.first_name ? userPidProfile.user.first_name : ' '} ${
            userPidProfile.user.last_name ? userPidProfile.user.last_name : ' '
            }`,
          source_profile_picture: userPidProfile.user.source_profile_picture || '',
          dealerCode:
            userPidProfile &&
              userPidProfile.user.json_unmapped_fields &&
              userPidProfile.user.json_unmapped_fields.dealer_code
              ? userPidProfile.user.json_unmapped_fields.dealer_code
              : null,
          lastName: userPidProfile.user.last_name,
          userProperties: userPidProfile.user.user_properties,
          isManager:
            userPidProfile &&
              userPidProfile.user.json_unmapped_fields &&
              userPidProfile.user.json_unmapped_fields.is_manager
              ? userPidProfile.user.json_unmapped_fields.is_manager
              : false,
          // userName: `${userPidProfile.user.first_name} ${userPidProfile.user.last_name}`,
          currentRole: userPidProfile.user.job_role || '',
        }
        this.userData = await this.fetchUserDataFromConfigAndUpdateUser()
        if (this.userData) {
          this.assignDetailsForUser(this.userData)
        }
      }
    }
    const details: IDetailsResponse = await this.http
      .get<IDetailsResponse>(endpoint.details)
      .toPromise()
    this.configSvc.userGroups = new Set(details.group)
    this.configSvc.userRoles = new Set(details.roles)
    if (this.configSvc.userProfile && this.configSvc.userProfile.isManager) {
      this.configSvc.userRoles.add('is_manager')
    }
    this.configSvc.hasAcceptedTnc = details.tncStatus
    return details
  }
  private async fetchUserDataFromConfigAndUpdateUser(): Promise<NsUserDashboard.IUserData> {
    const userConfig = await this.http
      .get<NsUserDashboard.IUserData>(`${this.baseUrl}/feature/user-dashboard.json`)
      .toPromise()
    return userConfig
  }
  private async fetchInstanceConfig(): Promise<NsInstanceConfig.IConfig> {
    // TODO: use the rootOrg and org to fetch the instance
    const publicConfig = await this.http
      .get<NsInstanceConfig.IConfig>(`${this.configSvc.sitePath}/site.config.json`)
      .toPromise()
    this.configSvc.instanceConfig = publicConfig
    this.configSvc.rootOrg = publicConfig.rootOrg
    this.configSvc.org = publicConfig.org
    this.configSvc.activeOrg = publicConfig.org[0]
    this.updateAppIndexMeta()
    return publicConfig
  }

  private async fetchFeaturesStatus(): Promise<Set<string>> {
    // TODO: use the rootOrg and org to fetch the features
    const featureConfigs = await this.http
      .get<IFeaturePermissionConfigs>(`${this.baseUrl}/features.config.json`)
      .toPromise()
    this.configSvc.restrictedFeatures = new Set(
      Object.entries(featureConfigs)
        .filter(
          ([_k, v]) => !hasPermissions(v, this.configSvc.userRoles, this.configSvc.userGroups),
        )
        .map(([k]) => k),
    )
    return this.configSvc.restrictedFeatures
  }
  private async fetchWidgetStatus(): Promise<NsWidgetResolver.IRegistrationsPermissionConfig[]> {
    const widgetConfigs = await this.http
      .get<NsWidgetResolver.IRegistrationsPermissionConfig[]>(`${this.baseUrl}/widgets.config.json`)
      .toPromise()
    return widgetConfigs
  }

  private processWidgetStatus(widgetConfigs: NsWidgetResolver.IRegistrationsPermissionConfig[]) {
    this.configSvc.restrictedWidgets = new Set(
      widgetConfigs
        .filter(u =>
          hasPermissions(
            u.widgetPermission,
            this.configSvc.userRoles,
            this.configSvc.userGroups,
            this.configSvc.restrictedFeatures,
          ),
        )
        .map(u => WidgetResolverService.getWidgetKey(u)),
    )
    return this.configSvc.restrictedWidgets
  }

  private processAppsConfig(appsConfig: NsAppsConfig.IAppsConfig): NsAppsConfig.IAppsConfig {
    const tourGuide = appsConfig.tourGuide
    const features: { [id: string]: NsAppsConfig.IFeature } = Object.values(
      appsConfig.features,
    ).reduce((map: { [id: string]: NsAppsConfig.IFeature }, feature: NsAppsConfig.IFeature) => {
      if (hasUnitPermission(feature.permission, this.configSvc.restrictedFeatures, true)) {
        map[feature.id] = feature
      }
      return map
      // tslint:disable-next-line: align
    }, {})
    const groups = appsConfig.groups
      .map((group: NsAppsConfig.IGroup) => ({
        ...group,
        featureIds: group.featureIds.filter(id => Boolean(features[id])),
      }))
      .filter(group => group.featureIds.length)
    return { features, groups, tourGuide }
  }
  private updateNavConfig() {
    if (this.configSvc.instanceConfig) {
      const background = this.configSvc.instanceConfig.backgrounds
      if (background.primaryNavBar) {
        this.configSvc.primaryNavBar = background.primaryNavBar
      }
      if (background.pageNavBar) {
        this.configSvc.pageNavBar = background.pageNavBar
      }
      if (this.configSvc.instanceConfig.primaryNavBarConfig) {
        this.configSvc.primaryNavBarConfig = this.configSvc.instanceConfig.primaryNavBarConfig
      }
    }
  }

  private updateAppIndexMeta() {
    if (this.configSvc.instanceConfig) {
      document.title = this.configSvc.instanceConfig.details.appName
      try {
        if (this.configSvc.instanceConfig.indexHtmlMeta.description) {
          const manifestElem = document.getElementById('id-app-description')
          if (manifestElem) {
            // tslint:disable-next-line: semicolon // tslint:disable-next-line: whitespace
            ; (manifestElem as HTMLMetaElement).setAttribute(
              'content',
              this.configSvc.instanceConfig.indexHtmlMeta.description,
            )
          }
        }
        if (this.configSvc.instanceConfig.indexHtmlMeta.webmanifest) {
          const manifestElem = document.getElementById('id-app-webmanifest')
          if (manifestElem) {
            // tslint:disable-next-line: semicolon // tslint:disable-next-line: whitespace
            ; (manifestElem as HTMLLinkElement).setAttribute(
              'href',
              this.configSvc.instanceConfig.indexHtmlMeta.webmanifest,
            )
          }
        }
        if (this.configSvc.instanceConfig.indexHtmlMeta.pngIcon) {
          const pngIconElem = document.getElementById('id-app-fav-icon')
          if (pngIconElem) {
            // tslint:disable-next-line: semicolon // tslint:disable-next-line: whitespace
            ; (pngIconElem as HTMLLinkElement).href = this.configSvc.instanceConfig.indexHtmlMeta.pngIcon
          }
        }
        if (this.configSvc.instanceConfig.indexHtmlMeta.xIcon) {
          const xIconElem = document.getElementById('id-app-x-icon')
          if (xIconElem) {
            // tslint:disable-next-line: semicolon // tslint:disable-next-line: whitespace
            ; (xIconElem as HTMLLinkElement).href = this.configSvc.instanceConfig.indexHtmlMeta.xIcon
          }
        }
        if (this.configSvc.instanceConfig.indexHtmlMeta.appleTouchIcon180) {
          const xIconx180Elem = document.getElementById('id-app-appleTouchIcon180')
          if (xIconx180Elem) {
            // tslint:disable-next-line: semicolon // tslint:disable-next-line: whitespace
            ; (xIconx180Elem as HTMLLinkElement).href = this.configSvc.instanceConfig.indexHtmlMeta.appleTouchIcon180
          }
        }
        if (this.configSvc.instanceConfig.indexHtmlMeta.icon16) {
          const xIconx16Elem = document.getElementById('id-app-icon16')
          if (xIconx16Elem) {
            // tslint:disable-next-line: semicolon // tslint:disable-next-line: whitespace
            ; (xIconx16Elem as HTMLLinkElement).href = this.configSvc.instanceConfig.indexHtmlMeta.icon16
          }
        } if (this.configSvc.instanceConfig.indexHtmlMeta.icon32) {
          const xIconx32Elem = document.getElementById('id-app-icon32')
          if (xIconx32Elem) {
            // tslint:disable-next-line: semicolon // tslint:disable-next-line: whitespace
            ; (xIconx32Elem as HTMLLinkElement).href = this.configSvc.instanceConfig.indexHtmlMeta.icon32
          }
        }
      } catch (error) {
        this.logger.error('Error updating index html meta >', error)
      }
    }
  }
  assignDetailsForUser(userData: NsUserDashboard.IUserData) {
    const url = userData.API_END_POINT + userData.API_FOR_USER_DETAILS
    this.updateDepartmentDetails(url)
  }
  async updateDepartmentDetails(url: string) {
    if (this.configSvc.userProfile) {
      if (this.configSvc.userProfile.userId) {
        this.widUser = this.configSvc.userProfile.userId
      }
    }
    if (this.authSvc.token) {
      this.token = this.authSvc.token
    }
    const httpOptions = {
      headers: new HttpHeaders({
        authorization: this.token,
      }),
    }

    try {
      const updatedUserData = await this.http.patch<IResponse>(url + this.widUser, '', httpOptions).toPromise()
      this.token = ''
      if (updatedUserData && updatedUserData.STATUS === 'OK') {
        return Promise.resolve({
          ok: true,
          DATA: updatedUserData.DATA,
          MESSAGE: updatedUserData.MESSAGE,
        })
      }
      return { ok: false, error: updatedUserData.MESSAGE, MESSAGE: updatedUserData.MESSAGE }
    } catch (ex) {
      if (ex) {
        return Promise.resolve({
          ok: false, error: ex,
        })
      }
      return Promise.resolve({ ok: false, error: null })
    }
  }

}
