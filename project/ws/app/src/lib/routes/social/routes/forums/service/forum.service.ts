import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, ReplaySubject } from 'rxjs'
import { SocialForum } from '../models/SocialForumposts.model'
import { ConfigurationsService } from '@ws-widget/utils/src/public-api'

const PROTECTED_SLAG_V8 = '/apis/protected/v8'

const API_END_POINTS = {
  SOCIAL_TIMELINE: `${PROTECTED_SLAG_V8}/social/post/timelinev2`, // this has to be changed(Temporary)
  SOCIAL_MODERATOR_TIMELINE: `${PROTECTED_SLAG_V8}/social/moderator/timeline`,
  SOCIAL_FORUMVIEW: `${PROTECTED_SLAG_V8}/social/forum/forumTimeline`,
  SOCIAL_ADMIN_TIMELINE: `${PROTECTED_SLAG_V8}/social/admin/timeline`,
  SOCIAL_FORUM_BY_ID: `${PROTECTED_SLAG_V8}/social/viewForum`,
}
@Injectable({
  providedIn: 'root',
})
export class ForumService {
  forumViewRequest: SocialForum.IForumViewRequest = {
    sessionId: Date.now(),
    forumKind: SocialForum.EForumKind.FORUM,
    pgNo: 0, pgSize: 20,
    type: SocialForum.EForumViewType.ACTIVEALL,

  }
  private forumsSubject: ReplaySubject<SocialForum.IForumViewResponse> | null = null

  constructor(private http: HttpClient, private configSvc: ConfigurationsService) { }
  fetchTimelineData(request: SocialForum.ITimelineRequest): Observable<SocialForum.ITimeline> {

    return this.http.post<SocialForum.ITimeline>(API_END_POINTS.SOCIAL_TIMELINE, request)
  }

  fetchModeratorTimelineData(timelineRequest: SocialForum.IModeratorTimelineRequest) {
    return this.http.post<SocialForum.IModeratorTimeline>(API_END_POINTS.SOCIAL_MODERATOR_TIMELINE, timelineRequest)
  }
  fetchForums(forumViewRequest: SocialForum.IForumViewRequest) {
    return this.http.post<SocialForum.IForumViewResponse>(API_END_POINTS.SOCIAL_FORUMVIEW, forumViewRequest)
  }
  fetchMyPosts(myPostTimelineReq: SocialForum.ITimelineRequest) {
    return this.http.post<SocialForum.ITimeline>(API_END_POINTS.SOCIAL_TIMELINE, myPostTimelineReq)
  }

  fetchAdminTimelineData(adminPostTimelineReq: SocialForum.IAdminTimelineRequest) {
    // console.log('The postkind for api call is' + adminPostTimelineReq.postKind)
    return this.http.post<SocialForum.IAdminTimeline>(API_END_POINTS.SOCIAL_ADMIN_TIMELINE, adminPostTimelineReq)
  }

  private fetchForumsSubject(forumViewRequest: SocialForum.IForumViewRequest) {
    this.http.post<SocialForum.IForumViewResponse>(API_END_POINTS.SOCIAL_FORUMVIEW, forumViewRequest)
      .subscribe(
        data => {
          if (!this.forumsSubject) {
            this.forumsSubject = new ReplaySubject(1)
          }

          this.forumsSubject.next(data)
        },
        _ => {
          if (!this.forumsSubject) {
            this.forumsSubject = new ReplaySubject(1)
          }
          this.forumsSubject.next()
        },
      )
  }

  fetchForumById(forumId: string) {
    return this.http.post<any>(API_END_POINTS.SOCIAL_FORUM_BY_ID, { id: forumId })
  }

  getForumsDetails(
    forumViewRequest: SocialForum.IForumViewRequest
  ): Observable<SocialForum.IForumViewResponse> {

    this.forumsSubject = new ReplaySubject()
    this.fetchForumsSubject(forumViewRequest)

    return this.forumsSubject.asObservable()
  }

  isVisibileAccToRoles(allowedRoles: [string], notAllowedRoles: [string]) {
    let finalAcceptance = true
    if (this.configSvc.userRoles && this.configSvc.userRoles.size) {
      if (notAllowedRoles.length) {
        const rolesNotAllowed = notAllowedRoles.filter(role => (this.configSvc.userRoles as Set<string>).has(role))
        if (rolesNotAllowed.length) {
          finalAcceptance = false
        } else {
          finalAcceptance = true
        }
      }
      if (allowedRoles.length) {
        const rolesMising = allowedRoles.filter(role => !(this.configSvc.userRoles as Set<string>).has(role))
        if (rolesMising.length) {
          finalAcceptance = false
        } else {
          finalAcceptance = true
        }
      }
      if (!notAllowedRoles.length && !allowedRoles.length) {
        finalAcceptance = true
      }
    }
    return finalAcceptance
  }

}
