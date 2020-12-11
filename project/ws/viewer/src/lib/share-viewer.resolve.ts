import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router'
import { Observable } from 'rxjs'
import { NsContent } from '@ws-widget/collection'
import { IResolveResponse, ConfigurationsService } from '@ws-widget/utils'
import { HttpHeaders, HttpClient } from '@angular/common/http'
import { AccessControlService, ApiService } from '@ws/author'
import { CONTENT_READ } from '@ws/author/src/lib/constants/apiEndpoints'
// import { ViewerDataService } from './viewer-data.service'
import { WidgetResolverService } from '@ws-widget/resolver/src/public-api'
import { SharedViewerDataService } from '@ws/author/src/lib/modules/shared/services/shared-viewer-data.service'

@Injectable()
export class ShareViewerResolve
  implements
    Resolve<
      Observable<IResolveResponse<NsContent.IContent>> | IResolveResponse<NsContent.IContent> | null
    > {
  constructor(
    private readonly configSrvc: ConfigurationsService,
    private http: HttpClient,
    private router: Router,
    private readonly apiService: ApiService,
    private readonly accessService: AccessControlService,
    private viewerDataSvc: SharedViewerDataService,
    private readonly widgetResolver: WidgetResolverService
  ) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<any> {
    try {
      return await this.handleDefaultUserLogin(route)
    } catch (err) {
      // tslint:disable-next-line: no-console
      // console.log('catched error in share view ', err)
      return this.router.navigate([`/page/home`])
    }
  }

  async handleDefaultUserLogin(route: any) {
    try {
      const credentials = this.loadDefaultCredentials(route)
      this.clearDefaultTokens()
      if (await this.loginWithDefaultUser(credentials)) {
        // tslint:disable-next-line: max-line-length
        const pageType = document.location.href.includes('/v/') ? 'v' : (document.location.href.includes('/o/') ? 'o' : '')
        const sharableToken = route.paramMap.get('sharableToken') || ''
        const verifiedRouteContentID = await this.verifyRoute(pageType, sharableToken)
        if (verifiedRouteContentID) {
          const fetchedContent = await this.fetchContent(verifiedRouteContentID)
          if (fetchedContent && !this.widgetResolver.isInitialized) {
            // make sure widgets are loaded properly for content to work
            await this.widgetResolver.initialize(null, null, null, null)
          }
          return fetchedContent
        }
        return this.router.navigate([`/page/home`])
      }
    } catch (e) {
      // tslint:disable-next-line: no-console
      // console.log('catched error while routing again ', e)
      this.router.navigate(['/'])
    }
  }

  async fetchContent(contentID: string) {
    if (!contentID) {
      throw new Error('contentID or contentType not fetched from verified url, cannot proceed')
    }
    // console.log('api to hit is ', `${CONTENT_READ}${contentID}${this.accessService.orgRootOrgAsQuery}`)
    const content =  await this.apiService.get<NsContent.IContent>(
      `${CONTENT_READ}${contentID}${this.accessService.orgRootOrgAsQuery}`,
    ).toPromise()
    // console.log('api hit successful')
    this.viewerDataSvc.reset(content.identifier)
    this.viewerDataSvc.updateResource(content, null)
    return content
  }

  async verifyRoute(pageType: string, sharableToken: string, dummytest = false) {
    if (!pageType || !sharableToken) {
      return new Error('Invalid url type information, cannot proceed')
    }
    // verify the route using the new api and send the response to generate a proper url
    // apis/public/v8/sharable-content/validate/${sharableToken}
    const verifyUrl = `/apis/public/v8/sharable-content/validate/${sharableToken}`
    const defaultDetails = this.configSrvc.getGuesUserDetails()
    if (defaultDetails) {
      const headers = new HttpHeaders().set('rootOrg', defaultDetails.rootOrg).set('org', defaultDetails.org)
      if (!dummytest) {
        const response = await this.http.get(verifyUrl, { headers }).toPromise() as any
        if (response && response.lexId) {
          return response.lexId
        }
        return new Error('response object recieved was not adequate, check the code')
      }
      return {
        pageType,
        sharableToken,
        contentType: 'resource',
        // tslint:disable-next-line: max-line-length
        contentID: 'lex_auth_013059607748190208213',
        // tslint:disable-next-line: max-line-length
        // lex_auth_013059468502269952171 lex_auth_0130885621037137924 video --> lex_auth_013080434001444864116 audio -> lex_auth_013119235237355520100 lex_auth_013059607748190208213
      }
    }
    return new Error('Did not recieve default user details from session, try again later')
  }

  async loginWithDefaultUser(credentials: any) {
    try {
      const body = {
        username: credentials.username,
        password: credentials.password,
        grant_type: credentials.grant_type,
        client_id: credentials.client_id,
      }

      const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')

      const url = credentials.authApi
      const token = await this.http.post(url, body, { headers }).toPromise() as any
      const defaultSessionData = {
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        wid: credentials.wid,
        org: credentials.org,
        rootOrg: credentials.rootOrg,
      }
      return this.setDefaultTokens(defaultSessionData)
    } catch (e) {
      throw new Error('unable to login with default user, cannot allow')
    }
  }

  setDefaultTokens(credentials: any) {
    try {
      const sessionData = {
        token: credentials.access_token,
        refreshToken: credentials.refresh_token,
        org: credentials.org,
        rootOrg: credentials.rootOrg,
        wid: credentials.wid,
      }
      this.configSrvc.setGuestUserSession(JSON.stringify(sessionData))
      return true
    } catch (e) {
      this.clearDefaultTokens()
      return false
    }
  }

  clearDefaultTokens() {
    // alert('removed guest from resolver')
    this.configSrvc.removeGuestUser()
    this.configSrvc.defaultCredentials = null
  }

  loadDefaultCredentials(route: any) {
    if (this.configSrvc.defaultCredentials) {
      return this.configSrvc.defaultCredentials
    }
    this.configSrvc.defaultCredentials = route.parent.data.pageData.data.credentials
    return this.configSrvc.defaultCredentials
  }
}
