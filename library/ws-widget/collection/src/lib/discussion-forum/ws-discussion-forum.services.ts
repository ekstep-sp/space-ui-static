import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

import { Observable, of } from 'rxjs'
import { NsDiscussionForum } from './ws-discussion-forum.model'
import { NsUserDashboard } from '../../../../../../project/ws/app/src/lib/routes/user-dashboard/models/user-dashboard.model'
import { ConfigurationsService } from '@ws-widget/utils/src/public-api'
import { catchError } from 'rxjs/operators'

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
  constructor(private http: HttpClient, private readonly configSrvc: ConfigurationsService) { }

  // added userdata and setuser method to set data from config
  userData: NsUserDashboard.IUserData | any | null
  // wids = 0
  // newWids = new BehaviorSubject<any>(this.wids)
  setUserDashboardConfig(userDataFromConfig: NsUserDashboard.IUserData) {
    this.userData = userDataFromConfig
  }
  // setUserData(wid: number) {
  //   this.wids = wid
  // }

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
  fetchQNATimelineData(request: NsDiscussionForum.ITimelineRequest,id:string): Observable<NsDiscussionForum.ITimeline> {
    return this.http.post<NsDiscussionForum.ITimeline>(API_END_POINTS.SOCIAL_TIMELINE, request, {
      headers: { wid: id },
    })
  }

  getAllUsersList(): Observable<any> {
    try {
      return this.http.get<IResponse>(this.userData.api + this.userData.userList.url)
    } catch (ex) {
      return of([])
    }

  }

  addIndexToData(objects: any) {
    if (Array.isArray(objects)) {
      return objects.map((item, idx) => {
        return {
          index: idx + 1,
          ...item,
          full_name: this.getFullName({ user: item }),
          // wid: item.wid,
          // email: item.email,
        }
      })
    }
    return []
  }

  getFullName(userObj: any) {
    const finalName = []
    if (userObj.user.first_name) {
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

  getDFConfig() {
    // tslint:disable-next-line: max-line-length
    return this.http.get(`${this.configSrvc.sitePath}/feature/disscussionForum.json`).pipe(catchError((_error: any) => of(null))).toPromise()
  }
}
