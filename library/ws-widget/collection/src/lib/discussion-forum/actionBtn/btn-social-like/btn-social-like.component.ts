import { Component, OnInit, Input } from '@angular/core'
import { ConfigurationsService } from '@ws-widget/utils'
import { MatSnackBar, MatDialog } from '@angular/material'
import { DialogSocialActivityUserComponent } from '../../dialog/dialog-social-activity-user/dialog-social-activity-user.component'
import { WsDiscussionForumService } from '../../ws-discussion-forum.services'
import { NsDiscussionForum } from '../../ws-discussion-forum.model'
import { ActivatedRoute } from '@angular/router'
import { combineLatest } from 'rxjs'

@Component({
  selector: 'ws-widget-btn-social-like',
  templateUrl: './btn-social-like.component.html',
  styleUrls: ['./btn-social-like.component.scss'],
})
export class BtnSocialLikeComponent implements OnInit {
  @Input() postId = ''
  @Input() postCreatorId = ''
  @Input() activity: NsDiscussionForum.IPostActivity = {} as NsDiscussionForum.IPostActivity

  conversation: NsDiscussionForum.IPostResult | null = null
  isFirstConversationRequestDone = false
  isUpdating = false
  userId = ''
  userDataForLike: any[] = []
  // isFirstConversationRequestDone = false
  conversationRequest: NsDiscussionForum.IPostRequest = {
    postId: '',
    userId: '',
    answerId: '',
    postKind: [],
    sessionId: Date.now(),
    sortOrder: NsDiscussionForum.EConversationSortOrder.LATEST_DESC,
    pgNo: 0,
    pgSize: 10,
    postCreatorId: '',
  }
  constructor(
    private configSvc: ConfigurationsService,
    private socialSvc: WsDiscussionForumService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private discussionSvc: WsDiscussionForumService,
  ) {
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
    }
    this.conversationRequest.userId = this.userId
  }

  ngOnInit() {
    this.getWidsForLike()
    // tslint:disable-next-line: deprecation
    combineLatest(this.route.data, this.route.paramMap).subscribe(_combinedResult => {
      const idVal = _combinedResult[1].get('id')
      if (idVal) {
        this.conversationRequest.postId = idVal
      }
    })
  }

  updateLike(invalidUserMsg: string) {
    if (this.postCreatorId === this.userId) {
      this.snackBar.open(invalidUserMsg)
      return
    }
    if (this.isUpdating) {
      return
    }
    this.isUpdating = true
    const request: NsDiscussionForum.IPostActivityUpdateRequest = {
      id: this.postId,
      userId: this.userId,
      activityType: NsDiscussionForum.EActivityType.LIKE,
    }
    this.socialSvc.updateActivity(request).subscribe(_ => {
      this.isUpdating = false

      if (this.activity) {
        if (this.activity.userActivity.like) {
          this.activity.userActivity.like = false
          this.activity.activityData.like -= 1
        } else {
          this.activity.userActivity.like = true
          this.activity.activityData.like += 1
        }
        this.fetchdetails()
      }
    })
  }

  fetchdetails(forceNew= false) {
    if (forceNew) {
      this.conversationRequest.sessionId = Date.now()
      this.conversationRequest.pgNo = 0
    }

    this.discussionSvc.fetchPost(this.conversationRequest).subscribe(data => {
      if (data.mainPost.postCreator.postCreatorId) {
        this.conversationRequest.postCreatorId = data.mainPost.postCreator.postCreatorId
       }
      this.getWidsForLike(data.mainPost.activity.activityDetails && data.mainPost.activity.activityDetails.like)

    })
  }

  openLikesDialog() {
    const data: NsDiscussionForum.IDialogActivityUsers = { postId: this.postId, activityType: NsDiscussionForum.EActivityType.LIKE }
    this.dialog.open(DialogSocialActivityUserComponent, {
      data,
    })
  }

  async getWidsForLike(likeIds?: string[] | undefined) {
    let wids = [] as any
    if (likeIds && Array.isArray(likeIds) && likeIds.length) {
       wids = [...likeIds]
    } else {
    if (this.activity.activityDetails) {
       wids = this.activity.activityDetails.like
    }
    }
    if (wids.length) {
      const userDetails = await this.discussionSvc.getUsersByIDs(wids)
      this.userDataForLike = this.discussionSvc.addIndexToData(userDetails)
    }
  }
}
