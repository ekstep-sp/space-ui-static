import { Component, OnInit, Input, Output, ViewChild, EventEmitter } from '@angular/core'
import { NsDiscussionForum } from '../../ws-discussion-forum.model'
import { TFetchStatus, ConfigurationsService } from '@ws-widget/utils'
import { MatDialog, MatSnackBar } from '@angular/material'
import { WsDiscussionForumService } from '../../ws-discussion-forum.services'
import { EditorQuillComponent } from '../../editor-quill/editor-quill.component'
import { DialogSocialDeletePostComponent } from '../../dialog/dialog-social-delete-post/dialog-social-delete-post.component'
import { ForumService } from '@ws/app/src/lib/routes/social/routes/forums/service/forum.service'
import { BtnSocialLikeService } from '../../actionBtn/btn-social-like/service/btn-social-like.service'
// tslint:disable-next-line:import-name
import _ from 'lodash'
// import { post } from 'selenium-webdriver/http';

@Component({
  selector: 'ws-widget-discussion-post',
  templateUrl: './discussion-post.component.html',
  styleUrls: ['./discussion-post.component.scss'],
})
export class DiscussionPostComponent implements OnInit {

  @Input() allowMention = false
  @Input() widgetData!: NsDiscussionForum.IDiscussionForumInput
  @Input() post!: NsDiscussionForum.ITimelineResult
  @Output() deleteSuccess = new EventEmitter<boolean>()
  @Output() triggerReplyNotification = new EventEmitter<object | undefined>()
  @Input()  parentPostCreatorId!: string
  @ViewChild('discussionReplyEditor', { static: true }) discussionReplyEditor: EditorQuillComponent | null = null
  editMode = false
  postPublishEnabled = false
  updatedBody: undefined | string
  userId = ''
  userEmail = ''
  userName = ''
  replyPlaceholderToggler = false
  isValidReply = false
  replyBody: undefined | string
  isPostingReply = false
  replyFetchStatus: TFetchStatus = 'none'
  conversationRequest: NsDiscussionForum.IPostRequest = {
    postId: '',
    userId: '',
    answerId: '',
    postKind: [],
    sessionId: Date.now(),
    sortOrder: NsDiscussionForum.EConversationSortOrder.LATEST_DESC,
    pgNo: 0,
    pgSize: 2,
  }
  postReplies: NsDiscussionForum.ITimelineResult[] = []
  isNewRepliesAvailable = false
  mentions = []
  commentMentions = []
  replyCommentMentions = []
  isPostingComment = false
  replyEditMentions = []
  commentAddRequest: NsDiscussionForum.IPostCommentRequest = {
    postKind: NsDiscussionForum.EReplyKind.COMMENT,
    parentId: '',
    postCreator: '',
    postContent: {
      body: '',
    },
    source: {
      id: '',
      name: NsDiscussionForum.EDiscussionType.SOCIAL,
    },
  }
  result: any
  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private configSvc: ConfigurationsService,
    private discussionSvc: WsDiscussionForumService,
    private readonly forumSrvc: ForumService,
    private voteService: BtnSocialLikeService,
  ) {
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
      this.userEmail = this.configSvc.userProfile.email || ''
      this.userName = this.configSvc.userProfile.userName || ''
    }
    this.conversationRequest.userId = this.userId
  }

  ngOnInit() {
    this.voteService.postId.subscribe((data: any) => {
      // console.log(data, this.post, this.postReplies)
      this.result = _.cloneDeep(this.postReplies)
      this.result.forEach((post: any, index: any) => {
      if (data === post.id) {
       // tslint:disable-next-line:max-line-length
       if (!post.activity.userActivity.upVote && !post.activity.userActivity.downVote) {
        if (post.activity.activityDetails.upVote.length > 0) {
         post.activity.activityDetails.upVote = post.activity.activityDetails.upVote.filter((element: any) => {
           if (element === this.userId) {
             return false
           }
           return true
         })
       }
     }
       if (post.activity.userActivity) {
         if (post.activity.userActivity.upVote) {
           post.activity.activityDetails.upVote.push(this.userId)
           // tslint:disable-next-line:max-line-length
           post.activity.activityDetails.upVote = post.activity.activityDetails.upVote.filter((v: any, i: any) => post.activity.activityDetails.upVote.findIndex((item: any) => item === v) === i)
         }
         if (post.activity.userActivity.downVote) {
           post.activity.activityDetails.downVote.push(this.userId)
           // tslint:disable-next-line:max-line-length
           post.activity.activityDetails.downVote = post.activity.activityDetails.downVote.filter((v: any, i: any) => post.activity.activityDetails.downVote.findIndex((item: any) => item === v) === i)
         }
       }
       // this.fetchPostReplies(true)
       this.postReplies[index] = post
      }
    })
    })
    this.fetchPostReplies()
    this.conversationRequest.postId = this.post.id
  }
  deletePost(failMsg: string) {
    const dialogRef = this.dialog.open(DialogSocialDeletePostComponent, {
      data: { postId: this.post.id },
    })
    dialogRef.afterClosed().subscribe(
      data => {
        if (data) {
          this.deleteSuccess.emit(true)
        }
      },
      () => {
        this.snackBar.open(failMsg)
      },
    )
  }

  editPost(failMsg: string) {
    this.post.postContent.title = this.updatedBody || ''
    this.editMode = false
    const postUpdateRequest: NsDiscussionForum.IPostUpdateRequest = {
      editor: this.userId,
      id: this.post.id,
      meta: {
        abstract: '',
        body: '',
        title: this.updatedBody || '',
      },
      postKind: NsDiscussionForum.EPostKind.BLOG,
    }
    this.discussionSvc.updatePost(postUpdateRequest).subscribe(
      _data => {
        this.triggerNotification('reply')
        this.updatedBody = undefined
        if (this.post.lastEdited) {
          this.post.lastEdited.dtLastEdited = Date.now().toString()
        }
        this.post.dtLastModified = Date.now().toString()
      },
      () => {
        this.editMode = true
        this.snackBar.open(failMsg)
      },
    )
  }

  onTextChange(eventData: { isValid: boolean; htmlText: string }) {
    this.postPublishEnabled = eventData.isValid
    this.updatedBody = eventData.htmlText
  }

  publishReply(failureMsg: string) {
    this.isPostingReply = true
    const request: NsDiscussionForum.IPostCommentRequest = {
      parentId: this.post.id,
      postContent: {
        body: this.replyBody || '',
      },
      postCreator: this.userId,
      postKind: NsDiscussionForum.EReplyKind.REPLY,
      source: this.post.source,
    }
    this.discussionSvc.publishPost(request).subscribe(
      (_data: any) => {
        this.fetchPostReplies(true)
        this.triggerNotification('comment')
        this.isPostingReply = false
        this.replyPlaceholderToggler = !this.replyPlaceholderToggler
        if (this.discussionReplyEditor) {
          this.discussionReplyEditor.resetEditor()
        }
        this.isValidReply = false
        this.replyBody = undefined
      },
      () => {
        this.snackBar.open(failureMsg)
        this.isPostingReply = false
      },
    )
  }

  onReplyTextChange(eventData: { isValid: boolean; htmlText: string }) {
    this.isValidReply = eventData.isValid
    this.replyBody = eventData.htmlText
  }

  fetchPostReplies(forceNew = false) {
    if (this.replyFetchStatus === 'fetching') {
      return
    }
    if (forceNew) {
      this.conversationRequest.pgNo = 0
      this.conversationRequest.sessionId = Date.now()
    }
    this.replyFetchStatus = 'fetching'
    this.isNewRepliesAvailable = false
    this.discussionSvc.fetchPost(this.conversationRequest).subscribe(
      data => {
        if (data) {
          this.isNewRepliesAvailable = data.newPostCount ? true : false
          if (forceNew) {
            this.postReplies = []
          }
          this.postReplies = [...this.postReplies, ...(data.replyPost || [])]
          if (data.postCount) {
            this.replyFetchStatus = 'hasMore'
          } else {
            this.replyFetchStatus = this.postReplies.length ? 'done' : 'none'
          }
          (this.conversationRequest.pgNo as number) += 1
        }
      },
      _e => {
        this.replyFetchStatus = 'error'
      })
  }

  onDeleteReply(replyIndex: number) {
    this.postReplies.splice(replyIndex, 1)
  }
  triggerNotification(parentType: 'reply' | 'comment') {
    let mentionsData: any[] = []
    if (parentType === 'reply') {
      mentionsData = [...this.replyEditMentions]
    } else if (parentType === 'comment') {
      mentionsData = [...this.replyCommentMentions]
    }
    this.triggerReplyNotification.emit({
      mentions: mentionsData,
      topLevelReply: this.post,
      parentPostCreatorId: this.parentPostCreatorId,
      currentCommentData: this.commentAddRequest,
    })
  }
  trackByFn(index: any) {
    return index // or item.id
  }
  triggerReplyCommentNotification(notificationData: any) {
    // send one notification such that it reaches both, the person who was mentioned in the reply comment and the creator
    // of answer on which comment was made
    const notificationRequest = notificationData.mentions.map((mention: any) => {
      return {
        notificationFor: 'discussionForum',
          taggedUserID: mention.id,
          taggedUserName: mention.name,
          taggedUserEmail: mention.email,
          tagCreatorName: this.configSvc.userProfile ? this.configSvc.userProfile.userName || '' : '',
          tagCreatorID: this.configSvc.userProfile ? this.configSvc.userProfile.userId || '' : '',
          ContentTitle: this.widgetData.title || '',
          ContentId: this.widgetData.id,
          // QnaCreatorID: notificationData.topLevelReply.postCreator.postCreatorId,
          ContentCreatorID: notificationData.parentPostCreatorId,
      }
    })
    if (notificationRequest.length) {
      this.forumSrvc.triggerTagNotification(notificationRequest)
    }
  }
}
