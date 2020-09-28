import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, ReplaySubject } from 'rxjs'
import { SocialForum } from '../models/SocialForumposts.model'
import { ConfigurationsService } from '@ws-widget/utils/src/public-api'

const PROTECTED_SLAG_V8 = '/apis/protected/v8'
const NOTIFICATION = '/apis/authNotificationApi/v1/notification/event'

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

  constructor(
    private http: HttpClient,
    private configSvc: ConfigurationsService,
  ) { }
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
        const rolesOK = notAllowedRoles.some(role => (this.configSvc.userRoles as Set<string>).has(role))
        if (rolesOK) {
          finalAcceptance = false
        } else {
          finalAcceptance = true
        }
      }
      if (allowedRoles.length) {
        const rolesOK = allowedRoles.some(role => (this.configSvc.userRoles as Set<string>).has(role))
        if (!rolesOK) {
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

  triggerTagNotification(tagData: any, type = 'email') {
    if (type === 'email') {
      const notificationPromises = tagData.map((_tag: any) => {
        let request = {}
        if (_tag.notificationFor === 'blog') {
          request = {
            'event-id': 'tagged_in_comment',
            'tag-value-pair': {
              '#type': 'blog',
              '#blogTitle': _tag.blogTitle,
              '#postUrl': `${document.baseURI}app/social/blogs/${_tag.blogId}`,
              '#taggedBy': _tag.tagCreatorName,
              '#taggedUser': _tag.taggedUserName,
            },
            recipients: {
              actor: [_tag.tagCreatorID],
              taggedUser: [_tag.taggedUserID],
              author: [_tag.blogCreatorID],
            },
          }
        }
        if (_tag.notificationFor === 'qna') {
          request = {
            'event-id': 'tagged_in_comment',
            'tag-value-pair': {
              '#blogTitle': _tag.QnaTitle,
              '#type': 'qna',
              '#postUrl': `${document.baseURI}app/social/qna/${_tag.QnaId}`,
              '#taggedBy': _tag.tagCreatorName,
              '#taggedUser': _tag.taggedUserName,
            },
            recipients: {
              actor: [_tag.tagCreatorID],
              taggedUser: [_tag.taggedUserID],
              author: [_tag.QnaCreatorID],
            },
          }
        }
        return this.http.post(NOTIFICATION, request).toPromise()
      })
      return Promise.all(notificationPromises)
        .catch(_ => {
          return Promise.resolve({ error: true, message: 'Failed to notify all tagged users.' })
        })
    }
    return ''
  }
}
