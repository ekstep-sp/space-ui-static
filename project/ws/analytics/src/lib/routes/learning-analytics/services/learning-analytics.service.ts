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
  USERS_ORG_STATS: `/usersubmission/usersubmission/user/v1/users/department_name/stats`,
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

  updateOrgInfo(originalData: any, otherData: any) {
    const url = `${LA_API_END_POINTS.USERS_ORG_STATS}`
    const params: {startDate: string, endDate: string} | any = {}
    if (otherData.hasOwnProperty('startDate')) {
      const sd = new Date(otherData.startDate).toISOString()
      params.startDate = this.getLocalTime(sd, 'startDate')
    }
    if (otherData.hasOwnProperty('endDate')) {
      const ed = new Date(otherData.endDate).toISOString()
      params.endDate = this.getLocalTime(ed, 'endDate')
    }
    if (otherData.hasOwnProperty('search_query') && otherData.search_query) {
      params.search_query = otherData.search_query
    }
    const orgDataObs$ = this.http.get(url, { params })
    return orgDataObs$.pipe(
      catchError(_error => {
        originalData.department = []
        return of(originalData)
      }),
      map(userData => {
        if (Array.isArray(userData) && userData.length) {
          originalData.department = userData.map(user => {
            return {
              doc_count: user.value,
              key: user.key === 'No Data' ? 'No Organisation' : user.key,
          }
        })
        }
        return originalData
      }),
      catchError(_error => {
        originalData.department = []
        return of(originalData)
      })
    )
  }

  getAndMergeExternalResources(contentType: string, originalData: any, otherData: any) {
    // get the external resources
    const params: {startDate: string, endDate: string, search_query: string} | any = {}
    if (otherData.hasOwnProperty('startDate')) {
      const sd = new Date(otherData.startDate).toISOString()
      params.startDate = this.getLocalTime(sd, 'startDate')
    }
    if (otherData.hasOwnProperty('endDate')) {
      const ed = new Date(otherData.endDate).toISOString()
      params.endDate = this.getLocalTime(ed, 'endDate')
    }
    if (otherData.hasOwnProperty('searchQuery') && otherData.searchQuery) {
      params.search_query = otherData.searchQuery
    }
    const obs = this.http.get(`${LA_API_END_POINTS.TIME_SPENT}/resource/external`, { params })
    return obs.pipe(
      catchError(_e => {
        // tslint:disable-next-line: no-console
        console.error('network error detected --> ', _e)
        return of(originalData)
      }),
      // tap(s => console.log('sample recieved is ', s)),
      map((data: any) => {
        return data.response
      }),
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
        // tslint:disable-next-line: no-console
        console.error('captured error while fetching external resources, ', _e)
        return of(originalData)
      }),
      )
  }

  getSocialAnalysisUsingIDS(blogIdData: any[], type: 'blogs' | 'qna') {
    // store the names in set and then recover the names from set
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
        console.error('some error occured here ', e)
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
