import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { IFormattedUserProperties, IPublicUsersResponse, IRawUserProperties } from '../models/public-users.interface'
import { ENDPOINT_URL, BATCH_SIZE, DEFAULT_OFFSET, CONNECTION_END_POINT, POST_INVITATION_ACTION_URL, SEND_REQUEST_CONNECTION_URL, REVOKE_REQUEST_CONNECTION_URL} from './../constants'
@Injectable({
  providedIn: 'root',
})
export class PublicUsersCoreService {

  dummy_response = true

  constructor(private readonly http: HttpClient) { }

  getApiData(searchQuery: string, offset = DEFAULT_OFFSET, searchSize = BATCH_SIZE): Observable<IPublicUsersResponse> {
    let requestParams = new HttpParams().set('searchSize', `${searchSize}`)
    requestParams = requestParams.append('offSet', `${offset}`)
    if (searchQuery && searchQuery.length) {
      requestParams = requestParams.append('search_query', searchQuery)
    }
    return this.http.get<IPublicUsersResponse>(ENDPOINT_URL, { params: requestParams })
  }

  parseProfileLink(url: String | null) {
    if (url && !(url.includes('http://') || url.includes('https://'))) {
      // reconstruct the changes
      return `http://${url}`
    }
    return url as any
  }

  extractUserProperties(rawObj: IRawUserProperties | IFormattedUserProperties): IFormattedUserProperties {
    const rawData = rawObj ? { ...rawObj } : rawObj
    if (rawData && Object.keys(rawData).length) {
      (rawData as IFormattedUserProperties).value = (typeof rawObj.value === 'string' ? JSON.parse(rawObj.value) : rawObj.value) as any
      if ((rawData as IFormattedUserProperties).value.profileLink) {
        // tslint:disable-next-line: max-line-length
        (rawData as IFormattedUserProperties).value.profileLink = (rawData as IFormattedUserProperties).value.profileLink && this.parseProfileLink((rawData as IFormattedUserProperties).value.profileLink)
      }
    }
    return rawData as IFormattedUserProperties
  }

  getAuthoringUrl(url: string): string {
    if (url && url !== 'null') {
      return `/apis/authContent/${url.includes('/content-store/') ? new URL(url).pathname.slice(1) : encodeURIComponent(url)}`
    }
    return ''
  }

  getSanitisedProfileUrl(url: string): string {
    return this.getAuthoringUrl(url)
  }
  getConnectionAPIResponse(requestParams:any):Observable<any>{
    return this.http.post( CONNECTION_END_POINT, { ...requestParams })
  }
  postInvitationAction(actionData: any) {
    return this.http.post(POST_INVITATION_ACTION_URL, { ...actionData })
  }
  sendRequestApi(requestBody: any){
   return this.http.post(SEND_REQUEST_CONNECTION_URL, { ...requestBody } )
  }
  revokeConnectionAPi(requestBody: any){
    return this.http.post(REVOKE_REQUEST_CONNECTION_URL, { ...requestBody } )
  }
}
