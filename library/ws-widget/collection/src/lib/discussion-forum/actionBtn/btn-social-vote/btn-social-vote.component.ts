import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core'
import { ConfigurationsService } from '@ws-widget/utils'
import { MatSnackBar, MatDialog } from '@angular/material'
import { DialogSocialActivityUserComponent } from '../../dialog/dialog-social-activity-user/dialog-social-activity-user.component'
import { WsDiscussionForumService } from '../../ws-discussion-forum.services'
import { NsDiscussionForum } from '../../ws-discussion-forum.model'
import { ActivatedRoute } from '@angular/router'
import { combineLatest } from 'rxjs'
import { BtnSocialLikeService } from '../btn-social-like/service/btn-social-like.service';

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
  @Input() key: any
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
  updateVoteKey: any
  checkKey = true
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
    private discussionSvc: WsDiscussionForumService,
    private route: ActivatedRoute,
    public voteService: BtnSocialLikeService,
  ) {
    this.changeText = false
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
    }
    this.conversationRequest.userId = this.userId
  }

  ngOnInit() {
    combineLatest(this.route.data, this.route.paramMap).subscribe(_combinedResult => {
      const idVal = _combinedResult[1].get('id')
      if (idVal) {
        this.conversationRequest.postId = idVal
      }
    })
    this.getWidsForVote()

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
    // if (!this.activity.userActivity.upVote) {
    //   if (this.userForDownVote) {
    //     const findIndex =  this.userForDownVote.findIndex(data => {
    //     return data.wid === this.userId
    //     })
    //     if (findIndex > -1) {
    //       this.userForDownVote = this.userForDownVote.slice(0, findIndex)
    //     }
    //     }
    // }
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
        this.voteService.updateStatus(true) // event trigger ; trigger popup component
        this.fetchUpdateContent(this.postId)
        this.isUpdating = false
        // this.updateVoteKey = 'true'
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
    // if (!this.activity.userActivity.downVote) {
    //   if (this.userForUpvote) {
    //     const findIndex =  this.userForUpvote.findIndex(data => {
    //     return data.wid === this.userId
    //     })
    //     if (findIndex > -1) {
    //       this.userForUpvote = this.userForUpvote.slice(0, findIndex)
    //     }
    //     }
    // }
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
          this.voteService.updateStatus(true)
          this.isUpdating = false
          // this.updateVoteKey = 'false'
        }
        this.fetchUpdateContent(this.postId)
      },
      () => {
        this.isUpdating = false
      },
    )
  }
  fetchUpdateContent(postId: any) {
    // if (forceNew) {
    //   this.conversationRequest.sessionId = Date.now()
    //   this.conversationRequest.pgNo = 0
    // }

    this.discussionSvc.fetchPost(this.conversationRequest).subscribe(data => {
      if (data.mainPost.postCreator.postCreatorId) {
        this.conversationRequest.postCreatorId = data.mainPost.postCreator.postCreatorId
       }
       this.activity.activityDetails = data.mainPost.activity.activityDetails
       if (this.key) {
        data.replyPost.forEach(reply => {
          if (reply.activity.activityDetails) {
          if (reply.id === postId) {
          this.getWidsForVote(reply.activity.activityDetails)
          }
          }
          this.voteService.updateStatus(true)
         })
       } else {
          if (data.mainPost.activity.activityDetails) {
        this.voteService.updateStatus(true)
       this.getWidsForVote(data.mainPost.activity.activityDetails)
       }
      }
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
  async getWidsForVote(data?: any) {
    if (data) {
      const wids = data.upVote
      const widsForDownVote = data.downVote
      if (wids.length) {
        const userDetails = await this.discussionSvc.getUsersByIDs(wids)
        this.userForUpvote = this.discussionSvc.addIndexToData(userDetails)
    } else {
        this.userForUpvote = []
      }
      if (widsForDownVote.length) {
        const userDetailsforDownVote = await this.discussionSvc.getUsersByIDs(widsForDownVote)
        this.userForDownVote = this.discussionSvc.addIndexToData(userDetailsforDownVote)
    } else {
      this.userForDownVote = []
    }
    // this.voteService.triggerStoreLikeData(this.userForUpvote, this.userForDownVote)
  } else {
    if (this.activity.activityDetails) {
      // filter for upvote
      const wids = this.activity.activityDetails.upVote
      if (wids.length) {
        const userDetails = await this.discussionSvc.getUsersByIDs(wids)
        this.userForUpvote = this.discussionSvc.addIndexToData(userDetails)
      }
      // filter for downvote
      const widsForDownVote = this.activity.activityDetails.downVote
      if (widsForDownVote.length) {
        const userDetailsforDownVote = await this.discussionSvc.getUsersByIDs(widsForDownVote)
        this.userForDownVote = this.discussionSvc.addIndexToData(userDetailsforDownVote)
      }
    }
    console.log(this.userForUpvote, this.userForDownVote)
  }
// }
}
}
