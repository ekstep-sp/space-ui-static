import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, of } from 'rxjs'
import { NsAnalytics } from '../models/learning-analytics.model'
import { NsUserDashboard } from '@ws/app/src/lib/routes/user-dashboard/models/user-dashboard.model'
import moment from 'moment'
import { START_DATE } from '@ws/author/src/lib/constants/constant'
import { catchError, map, tap } from 'rxjs/operators'

const PROTECTED_SLAG_V8 = `/apis/proxies/v8/LA/api`
const COUNT = `/apis/protected/v8/content/count`
const LA_API_END_POINTS = {
  TIME_SPENT: `${PROTECTED_SLAG_V8}/la/timespent`,
  CONTENT: `${PROTECTED_SLAG_V8}/la/content`,
  HOURLY: `${PROTECTED_SLAG_V8}/la/hourlyUsage`,
  SOCIAL_FORUM_ANALYSIS: (type: 'blogs' | 'qna') => `${PROTECTED_SLAG_V8}/la/social-forum/${type}/analytics`,
  SOCIAL_FORUM_IDS: (blogOrQna: string) => `/apis/protected/v8/post/list/${blogOrQna}` ,
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

  getSocialAnalysisUsingIDS(blogIdData: any[], type: 'blogs' | 'qna', dummy = false) {
    // store the names in set and then recover the names from set
    // tslint:disable: no-debugger
        this.nameMap = new Map()
    const ids = blogIdData.map(data => {
      this.nameMap.set(data.id, data.title)
      return data.id
    })
    let sub$
    if (dummy) {
      sub$ = of({
        ok: true,
        status: 200,
        result: {
            type: 'blogs',
            data: [
                {
                    key: 'app/social/blogs/81bb4c70-eead-11ea-88d7-938321034033',
                    total_visits: 369,
                    user_visits: [
                        {
                            userID: 'acbf4053-c126-4e85-a0bf-252a896535ea',
                            count: 321,
                        },
                        {
                            userID: '0e419282-16aa-4b03-8d81-a1f93175f7f7',
                            count: 45,
                        },
                        {
                            userID: '19bff5d1-3a60-48ce-bbfe-948c5b5fdd20',
                            count: 2,
                        },
                        {
                            userID: '5e5c7193-f364-4ca5-80a2-07d64d4e33f5',
                            count: 1,
                        },
                    ],
                },
                {
                    key: 'app/social/blogs/f853a5a0-e131-11ea-88d7-938321034033',
                    total_visits: 270,
                    user_visits: [
                        {
                            userID: 'acbf4053-c126-4e85-a0bf-252a896535ea',
                            count: 134,
                        },
                        {
                            userID: '823cb9ef-0016-4e81-ae29-8bf1f53655bd',
                            count: 68,
                        },
                        {
                            userID: '0e419282-16aa-4b03-8d81-a1f93175f7f7',
                            count: 36,
                        },
                        {
                            userID: '95e7fec9-e55d-4350-9253-831c71183574',
                            count: 12,
                        },
                        {
                            userID: '7b710f74-8f84-427f-bc13-f4220ed2a1c1',
                            count: 5,
                        },
                        {
                            userID: 'ab57c539-9386-4c79-9554-cf4ca1572651',
                            count: 4,
                        },
                        {
                            userID: '19bff5d1-3a60-48ce-bbfe-948c5b5fdd20',
                            count: 3,
                        },
                        {
                            userID: '70cf071f-78d1-4cb1-a2e2-2305da542835',
                            count: 3,
                        },
                        {
                            userID: '5289a794-8d21-4869-b1ae-9a972ec785ca',
                            count: 1,
                        },
                        {
                            userID: '542c98a6-8cbc-454e-84eb-9561f51fbf1b',
                            count: 1,
                        },
                        {
                            userID: '5fda11cb-04f8-451f-af95-b49cde72d760',
                            count: 1,
                        },
                        {
                            userID: 'a23b7950-7099-4f6b-b4eb-438f404c0f57',
                            count: 1,
                        },
                        {
                            userID: 'c68a8680-e146-4889-9f14-be809cb22c93',
                            count: 1,
                        },
                    ],
                },
                {
                    key: 'app/social/blogs/092cd3b0-edf3-11ea-88d7-938321034033',
                    total_visits: 139,
                    user_visits: [
                        {
                            userID: 'acbf4053-c126-4e85-a0bf-252a896535ea',
                            count: 97,
                        },
                        {
                            userID: '0e419282-16aa-4b03-8d81-a1f93175f7f7',
                            count: 34,
                        },
                        {
                            userID: '19bff5d1-3a60-48ce-bbfe-948c5b5fdd20',
                            count: 4,
                        },
                        {
                            userID: '5289a794-8d21-4869-b1ae-9a972ec785ca',
                            count: 1,
                        },
                        {
                            userID: '542c98a6-8cbc-454e-84eb-9561f51fbf1b',
                            count: 1,
                        },
                        {
                            userID: '7b710f74-8f84-427f-bc13-f4220ed2a1c1',
                            count: 1,
                        },
                        {
                            userID: '823cb9ef-0016-4e81-ae29-8bf1f53655bd',
                            count: 1,
                        },
                    ],
                },
                {
                    key: 'app/social/blogs/a86db200-d886-11ea-88d7-938321034033',
                    total_visits: 76,
                    user_visits: [
                        {
                            userID: 'acbf4053-c126-4e85-a0bf-252a896535ea',
                            count: 50,
                        },
                        {
                            userID: '823cb9ef-0016-4e81-ae29-8bf1f53655bd',
                            count: 8,
                        },
                        {
                            userID: '95e7fec9-e55d-4350-9253-831c71183574',
                            count: 7,
                        },
                        {
                            userID: '0e419282-16aa-4b03-8d81-a1f93175f7f7',
                            count: 2,
                        },
                        {
                            userID: '19bff5d1-3a60-48ce-bbfe-948c5b5fdd20',
                            count: 2,
                        },
                        {
                            userID: '6533771a-43c7-42a9-b775-859d6697f80f',
                            count: 2,
                        },
                        {
                            userID: '70cf071f-78d1-4cb1-a2e2-2305da542835',
                            count: 2,
                        },
                        {
                            userID: 'ab57c539-9386-4c79-9554-cf4ca1572651',
                            count: 2,
                        },
                        {
                            userID: '7b710f74-8f84-427f-bc13-f4220ed2a1c1',
                            count: 1,
                        },
                    ],
                },
                {
                    key: 'app/social/blogs/eec17020-eb5a-11ea-88d7-938321034033',
                    total_visits: 62,
                    user_visits: [
                        {
                            userID: 'acbf4053-c126-4e85-a0bf-252a896535ea',
                            count: 15,
                        },
                        {
                            userID: '19bff5d1-3a60-48ce-bbfe-948c5b5fdd20',
                            count: 11,
                        },
                        {
                            userID: '823cb9ef-0016-4e81-ae29-8bf1f53655bd',
                            count: 7,
                        },
                        {
                            userID: 'ab57c539-9386-4c79-9554-cf4ca1572651',
                            count: 7,
                        },
                        {
                            userID: '0e419282-16aa-4b03-8d81-a1f93175f7f7',
                            count: 4,
                        },
                        {
                            userID: '70cf071f-78d1-4cb1-a2e2-2305da542835',
                            count: 3,
                        },
                        {
                            userID: 'fb1c29f1-197b-468d-b028-e2358ecef29f',
                            count: 3,
                        },
                        {
                            userID: '266d3e98-9966-4161-ba92-92744d1b66db',
                            count: 2,
                        },
                        {
                            userID: '306ee018-d770-46c2-91a6-09934ef42ab3',
                            count: 2,
                        },
                        {
                            userID: '542c98a6-8cbc-454e-84eb-9561f51fbf1b',
                            count: 2,
                        },
                        {
                            userID: 'a07f8369-a5e4-4143-be33-90befdb1671e',
                            count: 2,
                        },
                        {
                            userID: '1b8aa79a-fc72-490e-a8ce-a39ae2ca2403',
                            count: 1,
                        },
                        {
                            userID: '7b710f74-8f84-427f-bc13-f4220ed2a1c1',
                            count: 1,
                        },
                        {
                            userID: '95e7fec9-e55d-4350-9253-831c71183574',
                            count: 1,
                        },
                        {
                            userID: 'c68a8680-e146-4889-9f14-be809cb22c93',
                            count: 1,
                        },
                    ],
                },
                {
                    key: 'app/social/blogs/582d13c0-eeb2-11ea-88d7-938321034033',
                    total_visits: 57,
                    user_visits: [
                        {
                            userID: '0e419282-16aa-4b03-8d81-a1f93175f7f7',
                            count: 48,
                        },
                        {
                            userID: 'acbf4053-c126-4e85-a0bf-252a896535ea',
                            count: 5,
                        },
                        {
                            userID: '823cb9ef-0016-4e81-ae29-8bf1f53655bd',
                            count: 2,
                        },
                        {
                            userID: 'a23b7950-7099-4f6b-b4eb-438f404c0f57',
                            count: 1,
                        },
                        {
                            userID: 'ab57c539-9386-4c79-9554-cf4ca1572651',
                            count: 1,
                        },
                    ],
                },
                {
                    key: 'app/social/blogs/fe8da7f0-ec1b-11ea-88d7-938321034033',
                    total_visits: 46,
                    user_visits: [
                        {
                            userID: '823cb9ef-0016-4e81-ae29-8bf1f53655bd',
                            count: 17,
                        },
                        {
                            userID: 'acbf4053-c126-4e85-a0bf-252a896535ea',
                            count: 9,
                        },
                        {
                            userID: '0e419282-16aa-4b03-8d81-a1f93175f7f7',
                            count: 7,
                        },
                        {
                            userID: 'ab57c539-9386-4c79-9554-cf4ca1572651',
                            count: 4,
                        },
                        {
                            userID: '19bff5d1-3a60-48ce-bbfe-948c5b5fdd20',
                            count: 3,
                        },
                        {
                            userID: '70cf071f-78d1-4cb1-a2e2-2305da542835',
                            count: 3,
                        },
                        {
                            userID: '5fda11cb-04f8-451f-af95-b49cde72d760',
                            count: 1,
                        },
                        {
                            userID: '815c9d1b-df26-4290-8267-ffac1477703f',
                            count: 1,
                        },
                        {
                            userID: '95e7fec9-e55d-4350-9253-831c71183574',
                            count: 1,
                        },
                    ],
                },
                {
                    key: 'app/social/blogs/75528050-eeaf-11ea-88d7-938321034033',
                    total_visits: 27,
                    user_visits: [
                        {
                            userID: '0e419282-16aa-4b03-8d81-a1f93175f7f7',
                            count: 22,
                        },
                        {
                            userID: 'acbf4053-c126-4e85-a0bf-252a896535ea',
                            count: 4,
                        },
                        {
                            userID: 'ab57c539-9386-4c79-9554-cf4ca1572651',
                            count: 1,
                        },
                    ],
                },
                {
                    key: 'app/social/blogs/b98ad640-eeb0-11ea-88d7-938321034033',
                    total_visits: 26,
                    user_visits: [
                        {
                            userID: 'acbf4053-c126-4e85-a0bf-252a896535ea',
                            count: 24,
                        },
                        {
                            userID: '823cb9ef-0016-4e81-ae29-8bf1f53655bd',
                            count: 1,
                        },
                        {
                            userID: 'ab57c539-9386-4c79-9554-cf4ca1572651',
                            count: 1,
                        },
                    ],
                },
                {
                    key: 'app/social/blogs/11ee34e0-eeb0-11ea-88d7-938321034033',
                    total_visits: 22,
                    user_visits: [
                        {
                            userID: 'acbf4053-c126-4e85-a0bf-252a896535ea',
                            count: 16,
                        },
                        {
                            userID: '0e419282-16aa-4b03-8d81-a1f93175f7f7',
                            count: 4,
                        },
                        {
                            userID: '823cb9ef-0016-4e81-ae29-8bf1f53655bd',
                            count: 2,
                        },
                    ],
                },
            ],
        },
    })
    } else {
      sub$ = this.http.post(LA_API_END_POINTS.SOCIAL_FORUM_ANALYSIS(type), { id: ids })
    }
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
        return {
          ...v,
          title: this.nameMap.get(v.key.split('/').pop()),
        }
      }),
    }
      return newValues
    // tslint:disable-next-line: align
    }), tap(_v => {
      // tslint:disable-next-line: no-console
      this.nameMap.clear()
    }
      ))
  }

  socialForumIDS(
    selectedEndDate: string,
    selectedStartDate: string,
    contentType: string,
    dummy = false
  ): Observable<any> {
    const socialType: 'blogs' | 'qna' = contentType || 'blogs' as any
    if (dummy) {
      return of({
        ok: true,
        data: [
          {
          id: '11ee34e0-eeb0-11ea-88d7-938321034033',
          title: 'title 1',
          creatorName: 'creator 1',
        },
        {
          id: 'eec17020-eb5a-11ea-88d7-938321034033',
          title: 'title 2',
          creatorName: 'creator 2',
        },
        {
          id: 'b98ad640-eeb0-11ea-88d7-938321034033',
          title: 'title 3',
          creatorName: 'c 3',
        },
        {
          id: 'fe8da7f0-ec1b-11ea-88d7-938321034033',
          title: 'title 4',
          creatorName: 'creator 4',
        },
        {
          id: '092cd3b0-edf3-11ea-88d7-938321034033',
          title: 't 5',
          creatorName: 'c 5',
        },
        {
          id: 'f48054c0-07b8-11eb-872b-b3cbec9f3a1b',
          title: 't 6',
          creatorName: 'c 6',
        },
        {
          id: '81bb4c70-eead-11ea-88d7-938321034033',
          title: 't 7',
          creatorName: 'c 7',
        },
        {
          id: '75528050-eeaf-11ea-88d7-938321034033',
          title: 't 8',
          creatorName: 'c 8',
        },
        {
          id: 'f853a5a0-e131-11ea-88d7-938321034033',
          title: 't 9',
          creatorName: 'c 9',
        },
        {
          id: '57351660-1d9d-11eb-bba1-d7a3666a3011',
          title: 't 10',
          creatorName: 'c 10',
        },
        {
          id: '582d13c0-eeb2-11ea-88d7-938321034033',
          title: 't 11',
          creatorName: 'c 11',
        },
        {
          id: 'a86db200-d886-11ea-88d7-938321034033',
          title: 't 12',
          creatorName: 'c 12',
        },
        ],
      })
    }
    return this.http.get<null>(
      // tslint:disable-next-line: max-line-length
      `${LA_API_END_POINTS.SOCIAL_FORUM_IDS(socialType)}?endDate=${selectedEndDate}&startDate=${selectedStartDate}`,
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
