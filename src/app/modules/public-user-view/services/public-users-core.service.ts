import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { IFormattedUserProperties, IPublicUsersResponse, IRawUserProperties } from '../models/public-users.interface'
import { ENDPOINT_URL, BATCH_SIZE, DEFAULT_OFFSET } from './../constants'
@Injectable({
  providedIn: 'root',
})
export class PublicUsersCoreService {

  constructor(private readonly http: HttpClient) { }

  getApiData(searchQuery: string, offset = DEFAULT_OFFSET, searchSize = BATCH_SIZE): Observable<IPublicUsersResponse> {
    let requestParams = new HttpParams().set('searchSize', `${searchSize}`)
    requestParams = requestParams.append('offSet', `${offset}`)
    if (searchQuery && searchQuery.length) {
      requestParams = requestParams.append('search_query', searchQuery)
    }
    return this.http.get<IPublicUsersResponse>(ENDPOINT_URL, { params: requestParams })
  }

  extractUserProperties(rawObj: IRawUserProperties | IFormattedUserProperties): IFormattedUserProperties {
    const rawData = rawObj ? { ...rawObj } : rawObj
    if (rawData && Object.keys(rawData).length) {
      rawData.value = (typeof rawObj.value === 'string' ? JSON.parse(rawObj.value) : rawObj.value) as any
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
}
