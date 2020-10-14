import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http'
import { ConfigurationsService } from '@ws-widget/utils/src/public-api'
@Component({
  selector: 'ws-public-share',
  templateUrl: './public-share.component.html',
  styleUrls: ['./public-share.component.scss'],
})
export class PublicShareComponent implements OnInit {

  currentStatus = 'preparing redirect url...'

  constructor(
    private http: HttpClient,
    private router: Router,
    private readonly configSrvc: ConfigurationsService,
    private readonly activatedRouteSS: ActivatedRoute,
  ) { }

  async ngOnInit() {
    try {
      const credentials = await this.loadDefaultCredentials()
      this.clearDefaultTokens()
      if (await this.loginWithDefaultUser(credentials)) {
        this.currentStatus = 'redirecting you to new url...'
        // tslint:disable-next-line: max-line-length
        const pageType = this.activatedRouteSS.snapshot.paramMap.get('pageType') || ''
        const sharableToken = this.activatedRouteSS.snapshot.paramMap.get('sharableToken') || ''
        const verifiedRoute = await this.verifyRoute(pageType, sharableToken)
        if (verifiedRoute) {
          this.redirectToOriginalRoute(verifiedRoute)
        } else {
          this.router.navigate([`/page/home`])
        }
      }
      // once token is recieved, hit another api to validate the sharableToken
      // generate proper redirect url from response and send the user there
      // update the uri details in resolver data too
    } catch (err) {
      this.currentStatus = 'redirection failed. Try again later'
      this.router.navigate([`/page/home`])
    }
  }
  async verifyRoute(pageType: string, sharableToken: string) {
    console.log('pagetype and sharable token are ', pageType, sharableToken)
    // verify the route using the new api and send the response to generate a proper url
    /* const verifyUrl = 'someVerificationurl'
    const body: {

    } */
    return {
      pageType,
      sharableToken,
      contentType: '',
      contentID: 'lex_auth_013105850887266304136',
    }
  }

  redirectToOriginalRoute(_routeSpecificData: any) {
    const url = `/app/toc/${_routeSpecificData.contentID}/overview`
    this.router.navigate([url])
  }

  async loginWithDefaultUser(credentials: any) {
    try {
      const body = new HttpParams()
      .set('username', credentials.username)
      .set('password', credentials.password)
      .set('client_id', credentials.client_id)
      .set('grant_type', credentials.grant_type)

      const headers = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded')

      const url = '/auth/realms/wingspan/protocol/openid-connect/token'

      const token = await this.http.post(url, body.toString(), { headers }).toPromise() as any
      return this.setDefaultTokens(token.access_token)
    } catch (e) {
      throw new Error('unable to login with default user, cannot allow')
    }
  }

  setDefaultTokens(token: string) {
    try {
      const sessionData = {
        token,
        org: 'space',
        rootOrg: 'space',
      }
      sessionStorage.setItem('default-user', JSON.stringify(sessionData))
      return true
    } catch (e) {
      return false
    }
  }

  clearDefaultTokens() {
    sessionStorage.removeItem('default-user')
    this.configSrvc.defaultCredentials = null
  }

  async loadDefaultCredentials() {
    if (this.configSrvc.defaultCredentials) {
      return this.configSrvc.defaultCredentials
    }
    this.configSrvc.defaultCredentials = this.activatedRouteSS.snapshot.data.pageData.data.credentials
    return this.configSrvc.defaultCredentials
  }

}
