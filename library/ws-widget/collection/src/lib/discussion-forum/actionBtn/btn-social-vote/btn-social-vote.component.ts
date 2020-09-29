import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core'
import { ConfigurationsService } from '@ws-widget/utils'
import { MatSnackBar, MatDialog } from '@angular/material'
import { DialogSocialActivityUserComponent } from '../../dialog/dialog-social-activity-user/dialog-social-activity-user.component'
import { WsDiscussionForumService } from '../../ws-discussion-forum.services'
import { NsDiscussionForum } from '../../ws-discussion-forum.model'
import { combineLatest } from 'rxjs'
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'ws-widget-btn-social-vote',
  templateUrl: './btn-social-vote.component.html',
  styleUrls: ['./btn-social-vote.component.scss'],
})
export class BtnSocialVoteComponent implements OnInit {
  @Input() voteType: 'downVote' | 'upVote' | 'none' = 'none'
  @Input() iconType: 'thumbs' | 'triangle' = 'thumbs'
  @Input() postId = ''
  @Input() postCreatorId = ''
  @Input() activity: NsDiscussionForum.IPostActivity = {} as NsDiscussionForum.IPostActivity
  @Input() isDisabled = false
  @ViewChild('invalidUser', { static: true }) invalidUser!: ElementRef<
    any
  >
  @Input()
  userWids: any
  @Input()
  userWidsForUpvote: any
  userForUpvote: any[] = []
  changeText: boolean
  userDetailsForUpVote: any[] = []
  userForDownVote: any[] = []
  userDetailsForDownVote: any[] = []
  userId = ''
  isUpdating = false
  conversation: NsDiscussionForum.IPostResult | null = null
  isFirstConversationRequestDone = false
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
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private discussionSvc: WsDiscussionForumService,
  ) {
    this.changeText = false
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
    }
    this.conversationRequest.userId = this.userId
}

  ngOnInit() {
    this.getWidsForVote('upvote')
    this.getWidsForVote('downvote')
    // tslint:disable-next-line: deprecation
    combineLatest(this.route.data, this.route.paramMap).subscribe(_combinedResult => {
      const idVal = _combinedResult[1].get('id')
      if (idVal) {
        this.conversationRequest.postId = idVal
        this.fetchdetails()
      }
    })

  }

  upVote(invalidUserMsg: string) {
    // this.getWidsForVote()
    if (this.postCreatorId === this.userId) {
      this.snackBar.open(invalidUserMsg)
      return
    }
    if (this.activity && this.activity.userActivity.upVote) {
      this.downVote(this.invalidUser.nativeElement.value)
      return
    }
    this.isUpdating = true
    const request: NsDiscussionForum.IPostActivityUpdateRequest = {
      activityType: NsDiscussionForum.EActivityType.UPVOTE,
      id: this.postId,
      userId: this.userId,
    }
    this.socialSvc.updateActivity(request).subscribe(
      _ => {
        if (this.activity) {
          if (this.activity.userActivity.downVote) {
            this.activity.userActivity.downVote = false
            this.activity.activityData.downVote -= 1
          } else {
            this.activity.userActivity.upVote = true
            this.activity.activityData.upVote += 1
          }
        }
        this.fetchdetails()
        this.isUpdating = false
      },
      () => {
        this.isUpdating = false
      },
    )
  }

  downVote(invalidUserMsg: string) {
    if (this.postCreatorId === this.userId) {
      this.snackBar.open(invalidUserMsg)
      return
    }
    if (this.activity && this.activity.userActivity.downVote) {
      this.upVote(this.invalidUser.nativeElement.value)
      return
    }
    this.isUpdating = true
    const request: NsDiscussionForum.IPostActivityUpdateRequest = {
      activityType: NsDiscussionForum.EActivityType.DOWNVOTE,
      id: this.postId,
      userId: this.userId || '',
    }
    this.socialSvc.updateActivity(request).subscribe(
      _ => {
        if (this.activity) {
          if (this.activity.userActivity.upVote) {
            this.activity.userActivity.upVote = false
            this.activity.activityData.upVote -= 1
          } else {
            this.activity.userActivity.downVote = true
            this.activity.activityData.downVote += 1
          }
          this.fetchdetails()
          this.isUpdating = false
        }
      },
      () => {
        this.isUpdating = false
      },
    )
  }

  fetchdetails(forceNew = false) {
    if (forceNew) {
      this.conversationRequest.sessionId = Date.now()
      this.conversationRequest.pgNo = 0
    }
    this.discussionSvc.fetchPost(this.conversationRequest).subscribe(data => {
      if (data.mainPost.postCreator.postCreatorId) {
        this.conversationRequest.postCreatorId = data.mainPost.postCreator.postCreatorId
      }
      // tslint:disable-next-line:max-line-length
      this.activity.activityDetails = data.mainPost.activity.activityDetails
      this.getWidsForVote('upvote', data.mainPost.activity.activityDetails && data.mainPost.activity.activityDetails.upVote)
      this.getWidsForVote('downvote', data.mainPost.activity.activityDetails && data.mainPost.activity.activityDetails.downVote)

    })
  }

 openVotesDialog(voteType: NsDiscussionForum.EActivityType.DOWNVOTE | NsDiscussionForum.EActivityType.UPVOTE) {
    const data: NsDiscussionForum.IDialogActivityUsers = {
      postId: this.postId,
      activityType: voteType,
    }
    this.dialog.open(DialogSocialActivityUserComponent, {
      data,
    })
  }
  async getWidsForVote(voteType: string = 'upvote', voteIds?: string [] | undefined) {
    let wids = [] as any
    if (voteIds && Array.isArray(voteIds) && voteIds.length) {
      wids = [...voteIds]
    } else {
    if (this.activity.activityDetails) {
      if (voteType === 'upvote') {
        wids = this.activity.activityDetails.upVote
      } else {
        wids = this.activity.activityDetails.downVote
      }
  }
    }
    let userDetails = [] as any
    try {
      if (wids.length) {
        userDetails = await this.discussionSvc.getUsersByIDs(wids)
      }
      if (voteType === 'upvote') {
        this.userForUpvote = this.discussionSvc.addIndexToData(Array.isArray(userDetails) ? userDetails : [])
      }
      if (voteType === 'downvote') {
        this.userForDownVote = this.discussionSvc.addIndexToData(Array.isArray(userDetails) ? userDetails : [])
      }
    } catch (e) {}

  }
}
