import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { IPublicUsersResponse } from '../models/public-users.interface'
import { ENDPOINT_URL, BATCH_SIZE, DEFAULT_OFFSET } from './../constants'
@Injectable({
  providedIn: 'root',
})
export class PublicUsersCoreService {

  static loadingData$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)

  constructor(private readonly http: HttpClient) { }

  getApiData(searchQuery: string, offset = DEFAULT_OFFSET, searchSize = BATCH_SIZE) {
    let requestParams = new HttpParams().set('searchSize', searchSize)
    requestParams = requestParams.append('offset',offset )
    if (searchQuery && searchQuery.length) {
      requestParams = requestParams.append('search_query', searchQuery)
    }
    this.http.get<[IPublicUsersResponse]>(ENDPOINT_URL, { params: requestParams })
  }
}
