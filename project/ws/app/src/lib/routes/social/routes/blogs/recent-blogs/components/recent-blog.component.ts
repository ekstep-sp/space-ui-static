import { Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs'
import { TFetchStatus, ValueService, ConfigurationsService, NsPage } from '@ws-widget/utils'
import { NsDiscussionForum, WsDiscussionForumService } from '@ws-widget/collection'
import { ActivatedRoute, Router } from '@angular/router'
import { ForumService } from '../../../forums/service/forum.service'

@Component({
  selector: 'ws-app-recent-blog',
  templateUrl: './recent-blog.component.html',
  styleUrls: ['./recent-blog.component.scss'],
})
export class RecentBlogComponent implements OnInit {
  timelineData: NsDiscussionForum.ITimeline = {
    hits: 0,
    result: [],
  }
  allowedToCreateBlogs = false
  allowedToViewMyBlogs = false
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  timelineRequest: NsDiscussionForum.ITimelineRequest = {
    pgNo: -1,
    pgSize: 20,
    postKind: [NsDiscussionForum.EPostKind.BLOG],
    sessionId: Date.now(),
    type: NsDiscussionForum.ETimelineType.ALL,
    userId: '',
  }

  timelineFetchStatus: TFetchStatus = 'none'
  showSocialLike = false
  isXSmall$: Observable<boolean>
  queryEntered = ''
  placeHolder: String = 'Type blog name to search'
  isEnabledSearch = false
  constructor(
    private discussionSvc: WsDiscussionForumService,
    private configSvc: ConfigurationsService,
    private valueSvc: ValueService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly forumSvc: ForumService,
    private readonly router: Router

  ) {
    this.isXSmall$ = this.valueSvc.isXSmall$
    if (this.configSvc.userProfile) {
      this.timelineRequest.userId = this.configSvc.userProfile.userId || ''
    }
  }

  ngOnInit() {
    this.activatedRoute.data.subscribe(_data => {
      // tslint:disable-next-line: max-line-length
      if (this.forumSvc.isVisibileAccToRoles(_data.socialData.data.rolesAllowed.blogs, _data.socialData.data.rolesNotAllowed.blogs)) {

        this.allowedToCreateBlogs = true
        this.allowedToViewMyBlogs = true
      } else {
        this.allowedToCreateBlogs = false
        this.allowedToViewMyBlogs = false
      }
    })
    this.fetchTimelineData()
    this.showSocialLike = (this.configSvc.restrictedFeatures && !this.configSvc.restrictedFeatures.has('socialLike')) || false

  }

  fetchTimelineData() {
    if (this.timelineFetchStatus === 'done') {
      return

    }
    this.timelineFetchStatus = 'fetching';

    (this.timelineRequest.pgNo as number) += 1

    this.discussionSvc.fetchTimelineData(this.timelineRequest).subscribe(
      data => {
        if (data.hits && data.result) {
          this.timelineData.hits = data.hits
          this.timelineData.result = [...this.timelineData.result, ...data.result]
          if (data.hits > this.timelineData.result.length) {
            this.timelineFetchStatus = 'hasMore'
          } else {
            this.timelineFetchStatus = 'done'
          }
        } else {
          this.timelineFetchStatus = 'none'
        }
      },
      () => {
        this.timelineFetchStatus = 'error'
      },
    )
  }
  showSearchBar() {

    this.isEnabledSearch = true

  }
  disableSearchbar() {

    this.isEnabledSearch = false
  }

  triggerSearch() {

    this.router.navigate(['/app/social/socialSearch/view-search'],
                         { queryParams: { search: this.queryEntered } })

  }
}
