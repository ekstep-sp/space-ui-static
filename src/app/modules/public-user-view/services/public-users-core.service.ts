import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, of } from 'rxjs'
import { delay } from 'rxjs/operators'
import { IFormattedUserProperties, IPublicUsersResponse, IRawUserProperties } from '../models/public-users.interface'
import { ENDPOINT_URL, BATCH_SIZE, DEFAULT_OFFSET, DUMMY_DATA } from './../constants'
@Injectable({
  providedIn: 'root',
})
export class PublicUsersCoreService {
  dummy = true
  counter = 0

  constructor(private readonly http: HttpClient) { }

  getApiData(searchQuery: string, offset = DEFAULT_OFFSET, searchSize = BATCH_SIZE): Observable<IPublicUsersResponse> {
    if (this.dummy) {
      let result = {} as IPublicUsersResponse
      if (this.counter < 3) {
        this.counter += 1
        result = DUMMY_DATA
      } else {
        result = { ...DUMMY_DATA, DATA: [] }
      }
      return of(result).pipe(delay(1000))
    }
    let requestParams = new HttpParams().set('searchSize', `${searchSize}`)
    requestParams = requestParams.append('offset', `${offset}`)
    if (searchQuery && searchQuery.length) {
      requestParams = requestParams.append('search_query', searchQuery)
    }
    return this.http.get<IPublicUsersResponse>(ENDPOINT_URL, { params: requestParams })
  }

  extractUserProperties(rawObj: IRawUserProperties | IFormattedUserProperties): IFormattedUserProperties {
    const rawData = { ...rawObj }
    rawData.value = (typeof rawObj.value === 'string' ? JSON.parse(rawObj.value) : rawObj.value) as any
    return rawData as IFormattedUserProperties
  }
}
