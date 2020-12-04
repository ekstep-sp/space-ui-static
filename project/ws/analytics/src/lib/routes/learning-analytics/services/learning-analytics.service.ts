import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, of } from 'rxjs'
import { NsAnalytics } from '../models/learning-analytics.model'
import { NsUserDashboard } from '@ws/app/src/lib/routes/user-dashboard/models/user-dashboard.model'
import moment from 'moment'
import { START_DATE } from '@ws/author/src/lib/constants/constant'
import { catchError, map, tap } from 'rxjs/operators'
import { sortBy } from 'lodash'

const PROTECTED_SLAG_V8 = `/apis/proxies/v8/LA/api`
const COUNT = `/apis/protected/v8/content/count`
const LA_API_END_POINTS = {
  TIME_SPENT: `${PROTECTED_SLAG_V8}/la/timespent`,
  CONTENT: `${PROTECTED_SLAG_V8}/la/content`,
  HOURLY: `${PROTECTED_SLAG_V8}/la/hourlyUsage`,
  SOCIAL_FORUM_ANALYSIS: (_type: 'blogs' | 'qna') => `${PROTECTED_SLAG_V8}/la/socialforum/blogs/usage`,
  SOCIAL_FORUM_IDS: (blogOrQna: string) => `/apis/protected/v8/social/post/list/${blogOrQna}` ,
  INSIGHTS: {
    USER_INSIGHTS: `${PROTECTED_SLAG_V8}/la/userinsights`,
    TOTAL_USER_INSIGHTS: `${PROTECTED_SLAG_V8}/la/totaluserinsights`,
  },
}
interface IResponse {
  ok: boolean
  error?: string | null,
  DATA?: any
  STATUS?: string,
  MESSAGE?: string,
  ErrorResponseData?: string,
  API_ID?: string,
  STATUS_CODE?: number,
  TIME_STAMP?: any,
  wid?: string,
  email?: string,
}
@Injectable({
  providedIn: 'root',
})
export class LearningAnalyticsService {
  constructor(private http: HttpClient) { }
  nameMap: any | null = null
  userData: NsUserDashboard.IUserData | any
  timeSpent(
    selectedEndDate: string,
    selectedStartDate: string,
    contentType: string,
    filterArray: NsAnalytics.IFilterObj[],
    searchQuery: string,
  ): Observable<null> {
    const filters = JSON.stringify(filterArray)
    return this.http.get<null>(
      // tslint:disable-next-line: max-line-length
      `${LA_API_END_POINTS.TIME_SPENT}?aggsSize=200&endDate=${selectedEndDate}&startDate=${selectedStartDate}&from=0&contentType=${contentType}&search_query=${searchQuery}&filters=${filters}`,
    )
  }

  usersInsights(
    eventType: string,
    selectedEndDate: string,
    selectedStartDate: string,
  ): Observable<null> {
    let endpoint
    let subFeature
    switch (eventType) {
      case 'user_accessed_content': {
        endpoint = LA_API_END_POINTS.INSIGHTS.USER_INSIGHTS
        subFeature = 'toc'
      }
      break
      case 'total_users': {
        endpoint = LA_API_END_POINTS.INSIGHTS.TOTAL_USER_INSIGHTS
        subFeature = ''
      }
      break
      case 'users_viewed_content': {
        endpoint = LA_API_END_POINTS.INSIGHTS.USER_INSIGHTS
        subFeature = 'viewer'
      }
      break
      default: {
      }
    }
    return this.http.get<any>(
      // tslint:disable-next-line: max-line-length
      `${endpoint}?endDate=${selectedEndDate}&startDate=${selectedStartDate}${subFeature ? `&subfeature=${subFeature}` : ``}`,
      )
  }
  content(
    selectedEndDate: string,
    selectedStartDate: string,
    contentType: string,
    filterArray: NsAnalytics.IFilterObj[],
    searchQuery: string,
  ): Observable<null> {
    const filters = JSON.stringify(filterArray)
    return this.http.get<null>(
      // tslint:disable-next-line: max-line-length
      `${LA_API_END_POINTS.CONTENT}?aggsSize=200&endDate=${selectedEndDate}&startDate=${selectedStartDate}&from=0&contentType=${contentType}&search_query=${searchQuery}&filters=${filters}`,
    )
  }

  returnDummy() {
    return {
      data: {
        ok: true,
        status: 200,
        response: {
          external_content_access: {
            doc_count: 12,
            data: [
              {
                key: 'lex_auth_013075129691897856115',
                name: 'sample_lex_auth_013075129691897856115',
                total_hits_on_doc: 45,
                unique_users: [
                  {
                    key: 'acbf4053-c126-4e85-a0bf-252a896535ea',
                    doc_count: 32,
                  },
                  {
                    key: '19bff5d1-3a60-48ce-bbfe-948c5b5fdd20',
                    doc_count: 7,
                  },
                  {
                    key: '3c53a517-5600-4f36-b445-36210fc7a26f',
                    doc_count: 2,
                  },
                  {
                    key: '6533771a-43c7-42a9-b775-859d6697f80f',
                    doc_count: 2,
                  },
                  {
                    key: '8fc26608-8d52-4f41-96f9-8e0ed2fa9e50',
                    doc_count: 2,
                  },
                ],
                unique_users_count: 5,
              },
              {
                key: 'lex_auth_013080431870525440115',
                name: 'sample_lex_auth_013080431870525440115',
                total_hits_on_doc: 35,
                unique_users: [
                  {
                    key: 'acbf4053-c126-4e85-a0bf-252a896535ea',
                    doc_count: 8,
                  },
                  {
                    key: '1539e8b9-dc57-4dbd-b744-9073f19818f2',
                    doc_count: 4,
                  },
                  {
                    key: '19bff5d1-3a60-48ce-bbfe-948c5b5fdd20',
                    doc_count: 4,
                  },
                  {
                    key: '306ee018-d770-46c2-91a6-09934ef42ab3',
                    doc_count: 4,
                  },
                  {
                    key: '6533771a-43c7-42a9-b775-859d6697f80f',
                    doc_count: 3,
                  },
                  {
                    key: '8fc26608-8d52-4f41-96f9-8e0ed2fa9e50',
                    doc_count: 3,
                  },
                  {
                    key: '753160e9-b52c-46fd-acbd-fc94c0dbfbaa',
                    doc_count: 2,
                  },
                  {
                    key: '3efc18ae-e963-4f0b-99e0-d69b49c8c81a',
                    doc_count: 1,
                  },
                  {
                    key: '542c98a6-8cbc-454e-84eb-9561f51fbf1b',
                    doc_count: 1,
                  },
                  {
                    key: '997d85d3-3ad2-4191-8219-b9eca2b130e2',
                    doc_count: 1,
                  },
                  {
                    key: 'b35d5eb7-7bb5-4d4f-9187-6a52849c3511',
                    doc_count: 1,
                  },
                  {
                    key: 'd0b8aa36-8c98-4b49-a2b5-b82037ab4078',
                    doc_count: 1,
                  },
                  {
                    key: 'ed2431c4-5536-4654-ac3b-51b7aa6a9af2',
                    doc_count: 1,
                  },
                  {
                    key: 'ef394bd3-82a3-4805-bd24-712ecdaf0f7d',
                    doc_count: 1,
                  },
                ],
                unique_users_count: 14,
              },
              {
                key: 'lex_auth_01309775521286553640',
                name: 'sample_lex_auth_01309775521286553640',
                total_hits_on_doc: 28,
                unique_users: [
                  {
                    key: '70cf071f-78d1-4cb1-a2e2-2305da542835',
                    doc_count: 9,
                  },
                  {
                    key: '9b5f2127-2333-4e3d-9413-726ca60dc811',
                    doc_count: 3,
                  },
                  {
                    key: '41fe5f8d-a930-40e3-8501-7d730a63740b',
                    doc_count: 2,
                  },
                  {
                    key: '60643f7c-f207-40cc-a8bd-2653406e68a4',
                    doc_count: 2,
                  },
                  {
                    key: '8df0cd4c-2c8a-4bcf-87e8-950cbb8de2d5',
                    doc_count: 2,
                  },
                  {
                    key: 'c68a8680-e146-4889-9f14-be809cb22c93',
                    doc_count: 2,
                  },
                  {
                    key: '443a3214-5660-4e20-88c2-a88549e09f6c',
                    doc_count: 1,
                  },
                  {
                    key: '50197bd6-f0d2-40e8-b51b-e030d0c9dbb0',
                    doc_count: 1,
                  },
                  {
                    key: '542c98a6-8cbc-454e-84eb-9561f51fbf1b',
                    doc_count: 1,
                  },
                  {
                    key: '6533771a-43c7-42a9-b775-859d6697f80f',
                    doc_count: 1,
                  },
                  {
                    key: '823cb9ef-0016-4e81-ae29-8bf1f53655bd',
                    doc_count: 1,
                  },
                  {
                    key: '8ec11eef-8613-4129-9fe4-822847d0a73e',
                    doc_count: 1,
                  },
                  {
                    key: 'ab57c539-9386-4c79-9554-cf4ca1572651',
                    doc_count: 1,
                  },
                  {
                    key: 'acbf4053-c126-4e85-a0bf-252a896535ea',
                    doc_count: 1,
                  },
                ],
                unique_users_count: 14,
              },
              {
                key: 'lex_auth_01309782809389465643',
                name: 'sample_lex_auth_01309782809389465643',
                total_hits_on_doc: 26,
                unique_users: [
                  {
                    key: '70cf071f-78d1-4cb1-a2e2-2305da542835',
                    doc_count: 9,
                  },
                  {
                    key: 'acbf4053-c126-4e85-a0bf-252a896535ea',
                    doc_count: 5,
                  },
                  {
                    key: '41fe5f8d-a930-40e3-8501-7d730a63740b',
                    doc_count: 3,
                  },
                  {
                    key: '443a3214-5660-4e20-88c2-a88549e09f6c',
                    doc_count: 3,
                  },
                  {
                    key: '542c98a6-8cbc-454e-84eb-9561f51fbf1b',
                    doc_count: 2,
                  },
                  {
                    key: '2e7b51c3-7af7-4f45-b540-90ada1c4267e',
                    doc_count: 1,
                  },
                  {
                    key: '8ec11eef-8613-4129-9fe4-822847d0a73e',
                    doc_count: 1,
                  },
                  {
                    key: 'b2f7b08e-7570-45d7-b30f-b85d56ff52fa',
                    doc_count: 1,
                  },
                  {
                    key: 'c68a8680-e146-4889-9f14-be809cb22c93',
                    doc_count: 1,
                  },
                ],
                unique_users_count: 9,
              },
              {
                key: 'lex_auth_013059480081899520175',
                name: 'sample_lex_auth_013059480081899520175',
                total_hits_on_doc: 20,
                unique_users: [
                  {
                    key: '542c98a6-8cbc-454e-84eb-9561f51fbf1b',
                    doc_count: 7,
                  },
                  {
                    key: '6533771a-43c7-42a9-b775-859d6697f80f',
                    doc_count: 6,
                  },
                  {
                    key: 'ab57c539-9386-4c79-9554-cf4ca1572651',
                    doc_count: 5,
                  },
                  {
                    key: '19bff5d1-3a60-48ce-bbfe-948c5b5fdd20',
                    doc_count: 1,
                  },
                  {
                    key: '67535bb9-5140-4fa5-8cc3-e3b715d92d01',
                    doc_count: 1,
                  },
                ],
                unique_users_count: 5,
              },
              {
                key: 'lex_auth_01307466414289715256',
                name: 'sample_lex_auth_01307466414289715256',
                total_hits_on_doc: 19,
                unique_users: [
                  {
                    key: 'acbf4053-c126-4e85-a0bf-252a896535ea',
                    doc_count: 11,
                  },
                  {
                    key: '0e419282-16aa-4b03-8d81-a1f93175f7f7',
                    doc_count: 2,
                  },
                  {
                    key: '6533771a-43c7-42a9-b775-859d6697f80f',
                    doc_count: 2,
                  },
                  {
                    key: '5289a794-8d21-4869-b1ae-9a972ec785ca',
                    doc_count: 1,
                  },
                  {
                    key: '8ec11eef-8613-4129-9fe4-822847d0a73e',
                    doc_count: 1,
                  },
                  {
                    key: '9090735d-c76e-4b7a-9f48-9e02a4c9fa7b',
                    doc_count: 1,
                  },
                  {
                    key: 'c7e3179f-6497-4b39-a923-e949459d53e3',
                    doc_count: 1,
                  },
                ],
                unique_users_count: 7,
              },
              {
                key: 'lex_auth_01307480873059942471',
                name: 'sample_lex_auth_01307480873059942471',
                total_hits_on_doc: 15,
                unique_users: [
                  {
                    key: 'acbf4053-c126-4e85-a0bf-252a896535ea',
                    doc_count: 11,
                  },
                  {
                    key: '2a18603f-f51e-434c-a3ce-852db6c3f496',
                    doc_count: 2,
                  },
                  {
                    key: '6533771a-43c7-42a9-b775-859d6697f80f',
                    doc_count: 1,
                  },
                  {
                    key: '9504cf8c-7329-4dcf-9c71-f85e4eab5344',
                    doc_count: 1,
                  },
                ],
                unique_users_count: 4,
              },
              {
                key: 'lex_auth_013075128273592320112',
                name: 'sample_lex_auth_013075128273592320112',
                total_hits_on_doc: 15,
                unique_users: [
                  {
                    key: 'acbf4053-c126-4e85-a0bf-252a896535ea',
                    doc_count: 14,
                  },
                  {
                    key: '6533771a-43c7-42a9-b775-859d6697f80f',
                    doc_count: 1,
                  },
                ],
                unique_users_count: 2,
              },
              {
                key: 'lex_auth_013059716135231488270',
                name: 'sample_lex_auth_013059716135231488270',
                total_hits_on_doc: 14,
                unique_users: [
                  {
                    key: 'acbf4053-c126-4e85-a0bf-252a896535ea',
                    doc_count: 7,
                  },
                  {
                    key: '542c98a6-8cbc-454e-84eb-9561f51fbf1b',
                    doc_count: 4,
                  },
                  {
                    key: '6533771a-43c7-42a9-b775-859d6697f80f',
                    doc_count: 2,
                  },
                  {
                    key: 'ab57c539-9386-4c79-9554-cf4ca1572651',
                    doc_count: 1,
                  },
                ],
                unique_users_count: 4,
              },
              {
                key: 'lex_auth_013081569874386944145',
                name: 'sample_lex_auth_013081569874386944145',
                total_hits_on_doc: 14,
                unique_users: [
                  {
                    key: '6533771a-43c7-42a9-b775-859d6697f80f',
                    doc_count: 5,
                  },
                  {
                    key: 'ab57c539-9386-4c79-9554-cf4ca1572651',
                    doc_count: 3,
                  },
                  {
                    key: '65caaf60-46c1-435c-bc25-20bf8c109afc',
                    doc_count: 2,
                  },
                  {
                    key: '10af49b7-3874-41ca-9d4c-02cfbe5a9ba8',
                    doc_count: 1,
                  },
                  {
                    key: '1539e8b9-dc57-4dbd-b744-9073f19818f2',
                    doc_count: 1,
                  },
                  {
                    key: '9504cf8c-7329-4dcf-9c71-f85e4eab5344',
                    doc_count: 1,
                  },
                  {
                    key: 'fb109391-98fb-44b0-8be0-48590bc0e8e1',
                    doc_count: 1,
                  },
                ],
                unique_users_count: 7,
              },
              {
                key: 'lex_auth_013080470556721152119',
                name: 'sample_lex_auth_013080470556721152119',
                total_hits_on_doc: 1,
                unique_users: [
                  {
                    key: '6533771a-43c7-42a9-b775-859d6697f80f',
                    doc_count: 1,
                  },
                ],
                unique_users_count: 1,
              },
              {
                key: 'lex_auth_013080484028153856121',
                name: 'sample_lex_auth_013080484028153856121',
                total_hits_on_doc: 1,
                unique_users: [
                  {
                    key: '6533771a-43c7-42a9-b775-859d6697f80f',
                    doc_count: 1,
                  },
                ],
                unique_users_count: 1,
              },
            ],
          },
        },
      },
    }
  }

  getAndMergeExternalResources(contentType: string, originalData: any, otherData: any) {
    // get the external resources
    const obs = this.http.get(`${LA_API_END_POINTS.TIME_SPENT}/resource/external`, { params: otherData })
    return obs.pipe(
      catchError(_e => {
        // debugger
        // console.log('network error detected --> ', e)
        if (otherData.dummy) {
          return of(this.returnDummy())
        }
        return of(originalData)
      }),
      // tap(s => console.log('sample recieved is ', s)),
      map((data: any) => data.data.response),
      // tap(s => console.log('sample recieved is 2', s)),
      map((data: any) => {
        // debugger
        if (data.hasOwnProperty('external_content_access') && data.external_content_access.doc_count) {
          return {
            doc_count: data.external_content_access.doc_count,
            data: data.external_content_access.data,
          }
        }
        return { doc_count: null, data: [] }
      }),
      map((data: any) => {
        // debugger
        if (data.doc_count) {
          const newData = data.data.map((externalContent: any) => {
            return {
              content_name: externalContent.name,
              content_id: externalContent.key,
              content_type: contentType,
              is_external: true,
              num_of_users: externalContent.unique_users_count,
              users_accessed: externalContent.unique_users,
            }
          })
          return {
              contentType,
              data: newData,
              original_data: originalData,
          }
        }
        return {
          contentType,
          data: {},
          original_data: originalData,
        }
      }),
      map(finalData => {
        // debugger
        const previousData = {
          ...finalData.original_data,
        }
        const newDataWithExtRes = {
          ...previousData,
          learning_history: [
            ...previousData.learning_history,
            ...finalData.data,
          ],
        }
        return newDataWithExtRes
      }),
      map((nonSortedData: any) => {
        // debugger
        const sortedLearningHistoryWithExt = sortBy(nonSortedData.learning_history, ['num_of_users']).reverse()
        return {
          ...nonSortedData,
          learning_history: sortedLearningHistoryWithExt,
        }
      }),
      catchError(_e => {
        // console.log('captured error while fetching external resources, ', e)
        return of(originalData)
      }),
      )
  }

  getSocialAnalysisUsingIDS(blogIdData: any[], type: 'blogs' | 'qna') {
    // store the names in set and then recover the names from set
    // tslint:disable: no-debugger
    this.nameMap = new Map()
    const ids = blogIdData.map(data => {
      this.nameMap.set(data.id, data.title)
      return data.id
    })
    const headers = new HttpHeaders({
      id: ids.join(','),
    })
    const sub$ = this.http.get(LA_API_END_POINTS.SOCIAL_FORUM_ANALYSIS(type), { headers })
    return sub$.pipe(
      catchError(e => {
         // tslint:disable-next-line: no-console
        console.log('some error occured here ', e)
        return of({ result: { data: [] } })
      }),
      map((values: any) => {
      const newValues = {
        type: values.result.type,
        data: values.result.data.map((v: any) => {
          const title = this.nameMap.get(v.key.split('/').pop())
        return {
          ...v,
          title:  title ? title.replaceAll('<p>', '').replaceAll('</p>', '') : title,
        }
      }),
    }
      return newValues
    // tslint:disable-next-line: align
    }), tap(_v => {
      this.nameMap.clear()
    }
      ))
  }

  socialForumIDS(
    _selectedEndDate: string,
    _selectedStartDate: string,
    contentType: string,
  ): Observable<any> {
    const socialType: 'blog' | 'qna' = contentType || 'blog' as any
    const startDate = this.getLocalTime(_selectedStartDate, 'startDate')
    const endDate = this.getLocalTime(_selectedEndDate, 'endDate')
    return this.http.get<null>(
      // tslint:disable-next-line: max-line-length
      `${LA_API_END_POINTS.SOCIAL_FORUM_IDS(socialType)}?endDate=${endDate}&startDate=${startDate}`,
      // `${LA_API_END_POINTS.SOCIAL_FORUM_IDS(socialType)}`,
    )
  }

  hourlyFilterData(
    filterKey: string,
    selectedEndDate: string,
    selectedStartDate: string,
    contentType: string,
    filterArray: NsAnalytics.IFilterObj[],
    searchQuery: string,
  ): Observable<null> {
    const filters = JSON.stringify(filterArray)
    return this.http.get<null>(
      // tslint:disable-next-line:max-line-length
      `${LA_API_END_POINTS.HOURLY}?aggsSize=200&endDate=${selectedEndDate}&startDate=${selectedStartDate}&from=0&contentType=${contentType}&search_query=${searchQuery}&filters=${filters}&week=${filterKey}`,
    )
  }
  async getContentCount(params: any): Promise<any> {
    try {
    const response =  await this.http.get<any>(`${COUNT}` , { params }).toPromise()
    if (response && response.responseCode === 'OK') {
      return Promise.resolve({
        ok: true,
        error: null,
        data: response.result.response,
         })
    }
      return Promise.resolve({
        ok: false,
        error: null,
        data: '',
      })
  } catch (ex) {
    if (ex) {
      return Promise.resolve({
        ok: false,
        error: ex,
      })
    }
  }
  }
  setUserDataFromConfig(userDataFromConfig: NsUserDashboard.IUserData) {
    this.userData = userDataFromConfig
  }
  async getUserCountByTimeStamp(params: {startDate: any, endDate: any}): Promise<IResponse> {
    try {
      const response: any =  await this.http.get(this.userData.apiEndPoint + this.userData.userCount.url, { params }).toPromise()
      if (response) {
        return Promise.resolve({
          ok: true, error: null,
          DATA: response.count,
        })
      }
      return { ok: false, error: null, MESSAGE: this.userData.userCount.errorMessage, DATA: 0 }
      } catch (ex) {
        if (ex) {
          return Promise.resolve({
            ok: false, error: ex,
            DATA: 0,
          })
        }
        return Promise.resolve({ ok: false, error: null, DATA: 0 })
      }
  }

  async getAllUsers(params: {startDate: any, endDate: any}): Promise<IResponse> {
    try {
      const response: any =  await this.http.get(this.userData.apiEndPoint + this.userData.userList.url, { params }).toPromise()
      if (response) {
        return Promise.resolve({
          ok: true, error: null,
          DATA: response,
        })
      }
      return { ok: false, error: null, MESSAGE: this.userData.userList.errorMessage, DATA: [] }
      } catch (ex) {
        if (ex) {
          return Promise.resolve({
            ok: false, error: ex,
            DATA: [],
          })
        }
        return Promise.resolve({ ok: false, error: null, DATA: [] })
      }
  }
  // convertion of timestamp on based on timezone
  getLocalTime(newDate: string, dateType: string) {
   const upadatedDate =  this.getUpdatedDate(newDate, dateType)
    const locales = this.userData.timeZoneFormat ? this.userData.timeZoneFormat.locales : 'en-US'
    const timeZone = this.userData.timeZoneFormat ? this.userData.timeZoneFormat.timeZone : 'GMT'
    let date = new Date(upadatedDate)
    const invdate = new Date(date.toLocaleString(locales, {
      timeZone,
      }))
      const diff = date.getTime() - invdate.getTime()
      date = new Date(date.getTime() + diff)
    return moment.utc(date).format('YYYY-MM-DD HH:mm:ss.SSS')
  }
  // returns the date in a format required for converting to GMT format
  getUpdatedDate(date: string, dateType: string) {
    // if date is already in utc format(utc time abbrevation as Z) then there is no need to append any timestamp
    if (date.endsWith('Z')) {
      return date
    }
      return (dateType === START_DATE) ? `${date}T00:00:00` : `${date}T23:59:59`
  }
}
