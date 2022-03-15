import { Injectable } from '@angular/core'
import { BehaviorSubject, ReplaySubject } from 'rxjs'
import { environment } from '../../../../../../src/environments/environment'
import { NsPage } from '../resolvers/page.model'
import { NsAppsConfig, NsInstanceConfig, NsUser } from './configurations.model'
import { IUserPreference } from './user-preference.model'

let instanceConfigPath: string | null = window.location.host
let locationHost: string | null = window.location.host

if (!environment.production && Boolean(environment.sitePath)) {
  locationHost = environment.sitePath
  instanceConfigPath = environment.sitePath
}
@Injectable({
  providedIn: 'root',
})
export class ConfigurationsService {
  // update as the single source of truth

  appSetup = true
  // The url the user tried to access while landing in the app before accepting tnc
  userUrl = ''
  baseUrl = `assets/configurations/${(locationHost || window.location.host).replace(':', '_')}`
  sitePath = `assets/configurations/${(instanceConfigPath || window.location.host).replace(
    ':',
    '_',
  )}`
  hostPath = (instanceConfigPath || window.location.host).replace(':', '_')

  userRoles: Set<string> | null = null
  userGroups: Set<string> | null = null
  restrictedFeatures: Set<string> | null = null
  restrictedWidgets: Set<string> | null = null
  instanceConfig: NsInstanceConfig.IConfig | null = null
  appsConfig: NsAppsConfig.IAppsConfig | null = null
  rootOrg: string | null = null
  org: string[] | null = null
  activeOrg: string | null = ''
  isProduction = false
  hasAcceptedTnc = false
  userPreference: IUserPreference | null = null
  userProfile: NsUser.IUserProfile | null = null
  // created to store complete user details sent by pid
  unMappedUser: any
  isAuthenticated = false
  isNewUser = false

  // pinnedApps
  pinnedApps = new BehaviorSubject<Set<string>>(new Set())

  // Notifier
  prefChangeNotifier = new ReplaySubject<Partial<IUserPreference>>(1)
  tourGuideNotifier = new ReplaySubject<boolean>()
  authChangeNotifier = new ReplaySubject<boolean>(1)

  // Preference Related Values
  activeThemeObject: NsInstanceConfig.ITheme | null = null
  activeFontObject: NsInstanceConfig.IFontSize | null = null
  isDarkMode = false
  isIntranetAllowed = false
  isRTL = false
  activeLocale: NsInstanceConfig.ILocalsConfig | null = null
  activeLocaleGroup = ''
  completedActivity: string[] | null = null
  completedTour = false
  profileSettings = ['profilePicture', 'learningTime', 'learningPoints']

  primaryNavBar: Partial<NsPage.INavBackground> = {
    color: 'primary',
  }
  pageNavBar: Partial<NsPage.INavBackground> = {
    color: 'primary',
  }
  primaryNavBarConfig: NsInstanceConfig.IPrimaryNavbarConfig | null = null
  defaultCredentials: { username?: string, password?: string } | null = null
  isGuestUser = !!sessionStorage.getItem('default-user')
  guestUserEnabled = false
  guestUser(){
    if(this.userProfile && this.userProfile.email === "guestspace2020@gmail.com" ){
      this.guestUserEnabled = true
    }
  }

  removeGuestUser = () => {
    sessionStorage.removeItem('default-user')
    this.isGuestUser = false
    this.defaultCredentials = null
  }
  setGuestUserSession = (sessionData: string) => {
    sessionStorage.setItem('default-user', sessionData)
    this.isGuestUser = true
  }
  getGuesUserDetails = () => {
    if (this.isGuestUser) {
      try {
        return JSON.parse(sessionStorage.getItem('default-user') as any)
      } catch (e) {
        // tslint:disable-next-line: no-console
        console.error('An Error occured while retrieving guest user details ', e)
        return null
      }
    }
    return null
  }
}
