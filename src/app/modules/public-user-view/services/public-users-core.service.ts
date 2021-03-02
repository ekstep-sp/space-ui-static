import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, of } from 'rxjs'
import { IFormattedUserProperties, IPublicUsersResponse, IRawUserProperties , IUserConnections} from '../models/public-users.interface'
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
  getConnectionsList(wid:string):Observable<IUserConnections[]>{
    const response = [{
      id:'123', created_on:'2/03/2021', last_updated_on:'2/03/2021', status:'connected', requested_by:'acbf4053-c126-4e85-a0bf-252a896535ea', email: 'anjitha.r98@gmail.com', user_id:'10af49b7-3874-41ca-9d4c-02cfbe5a9ba8',fname:'Aaditeshwar',lname:'Seth',root_org:'space',org:'IIT Delhi'
    },{
    id:'123', created_on:'2/03/2021', last_updated_on:'2/03/2021', status:'connected', requested_by:'acbf4053-c126-4e85-a0bf-252a896535ea', email: 'anjitha.r98@gmail.com', user_id:'acbf4053-c126-4e85-a0bf-252a896535ea',fname:'Aaditeshwar',lname:'Seth',root_org:'space',org:'IIT Delhi'
  },
    {
      id:'123', created_on:'2/03/2021', last_updated_on:'2/03/2021', status:'pending', requested_by:'acbf4053-c126-4e85-a0bf-252a896535ea', email: 'anjitha.r98@gmail.com', user_id:'00b4a61e-be61-4e48-9edc-62a29172ef2b',fname:'Aakash',lname:'Vishwakarma',root_org:'space',org:'Sustainable Environment and Ecological Development Society'
    },
    {
      id:'123', created_on:'2/03/2021', last_updated_on:'2/03/2021', status:'rejected', requested_by:'acbf4053-c126-4e85-a0bf-252a896535ea', email: 'anjitha.r98@gmail.com', user_id:'da9d37a0-1ed3-49a1-a69f-7b045569d41e',fname:'Aayushi',lname:'Chaturvedi',root_org:'space',org:'WPP India CSR Foundation'
    }]
      //response from connectio list api
  return  of(response)
  }
}
