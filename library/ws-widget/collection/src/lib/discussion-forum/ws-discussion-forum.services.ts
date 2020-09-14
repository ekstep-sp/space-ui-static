import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'

import { Observable } from 'rxjs'
import { NsDiscussionForum } from './ws-discussion-forum.model'
import { NsUserDashboard } from '../../../../../../project/ws/app/src/lib/routes/user-dashboard/models/user-dashboard.model'

const PROTECTED_SLAG_V8 = '/apis/protected/v8'

const API_END_POINTS = {
  SOCIAL_TIMELINE: `${PROTECTED_SLAG_V8}/social/post/timelineV2`,
  SOCIAL_VIEW_CONVERSATION: `${PROTECTED_SLAG_V8}/social/post/viewConversation`,
  SOCIAL_VIEW_CONVERSATION_V2: `${PROTECTED_SLAG_V8}/social/post/viewConversationV2`,
  SOCIAL_POST_PUBLISH: `${PROTECTED_SLAG_V8}/social/post/publish`,
  SOCIAL_POST_DELETE: `${PROTECTED_SLAG_V8}/social/post/delete`,
  SOCIAL_POST_ACTIVITY_UPDATE: `${PROTECTED_SLAG_V8}/social/post/activity/create`,
  SOCIAL_POST_ACTIVITY_USERS: `${PROTECTED_SLAG_V8}/social/post/activity/users`,
  SOCIAL_POST_UPDATE: `${PROTECTED_SLAG_V8}/social/edit/meta`,
  SOCIAL_POST_WID_USER: `${PROTECTED_SLAG_V8}/user/details/detailV3`,
}
// added interface for get all users
interface IResponse {
  ok: boolean
  error?: string | null,
  DATA?: [NsUserDashboard.IUserListDataFromUserTable],
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
export class WsDiscussionForumService {
  constructor(private http: HttpClient) { }
  // added userdata and setuser method to set data from config
  userData: NsUserDashboard.IUserData | any | null
  setUserDashboardConfig(userDataFromConfig: NsUserDashboard.IUserData) {
    this.userData = userDataFromConfig
  }

  deletePost(postId: string, userId: string) {
    const req: NsDiscussionForum.IPostDeleteRequest = {
      userId,
      id: postId,
    }
    return this.http.post(API_END_POINTS.SOCIAL_POST_DELETE, req)
  }
  updateActivity(
    request: NsDiscussionForum.IPostActivityUpdateRequest | NsDiscussionForum.IPostFlagActivityUpdateRequest,
  ) {
    return this.http.post<any>(API_END_POINTS.SOCIAL_POST_ACTIVITY_UPDATE, request)
  }
  fetchActivityUsers(request: NsDiscussionForum.IActivityUsers): Observable<NsDiscussionForum.IActivityUsersResult> {
    return this.http.post<NsDiscussionForum.IActivityUsersResult>(API_END_POINTS.SOCIAL_POST_ACTIVITY_USERS, request)
  }
  fetchTimelineData(request: NsDiscussionForum.ITimelineRequest): Observable<NsDiscussionForum.ITimeline> {
    return this.http.post<NsDiscussionForum.ITimeline>(API_END_POINTS.SOCIAL_TIMELINE, request)
  }
  publishPost(request: NsDiscussionForum.IPostPublishRequest | NsDiscussionForum.IPostCommentRequest) {
    return this.http.post<any>(API_END_POINTS.SOCIAL_POST_PUBLISH, request)
  }
  updatePost(request: NsDiscussionForum.IPostUpdateRequest) {
    return this.http.put<any>(API_END_POINTS.SOCIAL_POST_UPDATE, request)
  }
  fetchPost(request: NsDiscussionForum.IPostRequest): Observable<NsDiscussionForum.IPostResult> {
    return this.http.post<NsDiscussionForum.IPostResult>(API_END_POINTS.SOCIAL_VIEW_CONVERSATION, request)
  }
  fetchAllPosts(request: NsDiscussionForum.IPostRequestV2): Observable<NsDiscussionForum.IPostResultV2> {
    return this.http.post<NsDiscussionForum.IPostResultV2>(API_END_POINTS.SOCIAL_VIEW_CONVERSATION_V2, request)
  }
  // added get all users to retrieve  all user details
  async getAllUsers(headers: NsUserDashboard.IHeaders): Promise<IResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        rootorg: headers.rootOrg,
        wid_orgadmin: headers.wid_OrgAdmin,
        org: headers.org,
      }),
    }
    try {
      // tslint:disable-next-line: prefer-template
      // tslint:disable-next-line: max-line-length
      const userList = await this.http.get<IResponse>(this.userData.api + this.userData.user_list.url, httpOptions).toPromise()
      if (userList && userList.STATUS === 'OK') {
        return Promise.resolve({
          ok: true,
          DATA: userList.DATA,
        })
      }
      return { ok: false, error: userList.MESSAGE, MESSAGE: userList.MESSAGE }
    } catch (ex) {
      if (ex) {
        return Promise.resolve({
          ok: false, error: ex,
        })
      }
      return Promise.resolve({ ok: false, error: null, MESSAGE: this.userData.user_list_userTable.errorMessage })
    }
  }

  //  async getUserDetails(widUser: any) {
  //   const userData =  await this.getUsersByIDs(widUser)
  //   return this.addIndexToData(userData)
  // }

  addIndexToData(objects: any) {
    if (Array.isArray(objects)) {
      return objects.map((item, idx) => {
        return {
          index: idx + 1,
          ...item,
          full_name: this.getFullName({ user : item }),
        }
      })
    }
    return []
  }

  getFullName(userObj: any) {
    const finalName = []
    if (userObj.user.first_name || userObj.first_name) {
      finalName.push(userObj.user.first_name)
    }
    if (userObj.user.middle_name) {
      finalName.push(userObj.user.middle_name)
    }
    if (userObj.user.last_name) {
      finalName.push(userObj.user.last_name)
    }
    return finalName.join(' ')
  }

  // getFullName(userObj: any) {
  //   console.log("userobe", userObj)
  //   const finalName = []
  //   if (userObj.first_name) {
  //     finalName.push(userObj.first_name)
  //   }
  //   if (userObj.middle_name) {
  //     finalName.push(userObj.middle_name)
  //   }
  //   if (userObj.last_name) {
  //     finalName.push(userObj.last_name)
  //   }
  //   return finalName.join(' ')
  // }
  // get all the data from  api
  getUsersByIDs(widUser: any) {
    try {
      // tslint:disable-next-line: prefer-template
      const eventRelatedEndpoint = API_END_POINTS.SOCIAL_POST_WID_USER
      const reqBody = {
        wid: [...widUser],
      }
      return this.http.post(eventRelatedEndpoint, reqBody).toPromise()
    } catch (ex) {
      return []
    }
  }

  // getUserDetails(widUser: any): any {
  //   // let data: any[] = []
  //     const userData = this.getUsersByIDs(widUser)
  //   userData.subscribe(resp => {
  //     return this.addIndexToData(resp)
  //   })
  // //  const data =  userData.subscribe(resp => {
  // //    return resp
  // //   })
  // //   console.log("addIndexToData", this.addIndexToData(data))
  // //   return this.addIndexToData(userData)
  // }

  // addIndexToData(objects: any) {
  //   if (Array.isArray(objects)) {
  //     return objects.map((item, idx) => {
  //       return {
  //         index: idx + 1,
  //         ...item,
  //         full_name: this.getFullName({ user: item }),
  //       }
  //     })
  //   }
  //   return []
  // }

  // getFullName(userObj: any) {
  //   const finalName = []
  //   if (userObj.user.first_name) {
  //     finalName.push(userObj.user.first_name)
  //   }
  //   if (userObj.user.middle_name) {
  //     finalName.push(userObj.user.middle_name)
  //   }
  //   if (userObj.user.last_name) {
  //     finalName.push(userObj.user.last_name)
  //   }
  //   return finalName.join(' ')
  // }
  // //get all the data from  api
  // getUsersByIDs(widUser: any): Observable<any> {
  //   try {
  //     // tslint:disable-next-line: prefer-template
  //     const eventRelatedEndpoint = API_END_POINTS.SOCIAL_POST_WID_USER
  //     const reqBody = {
  //       wid: [...widUser],
  //     }
  //     return this.http.post(eventRelatedEndpoint, reqBody)
  //   } catch (ex) {
  //     return of([])
  //   }
  // }
}
