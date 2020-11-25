import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core'
import { MatSnackBar } from '@angular/material'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { ConfigurationsService, TFetchStatus } from '@ws-widget/utils'
import { EditorQuillComponent } from '../../editor-quill/editor-quill.component'
import { NsDiscussionForum } from '../../ws-discussion-forum.model'
import { WsDiscussionForumService } from '../../ws-discussion-forum.services'
import { ActivatedRoute, Data } from '@angular/router'
import { BtnSocialLikeService } from '../../actionBtn/btn-social-like/service/btn-social-like.service'
import { ForumService } from '@ws/app/src/lib/routes/social/routes/forums/service/forum.service'
// tslint:disable-next-line:import-name
import _ from 'lodash'

@Component({
  selector: 'ws-widget-discussion-forum',
  templateUrl: './discussion-forum.component.html',
  styleUrls: ['./discussion-forum.component.scss'],
})
export class DiscussionForumComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<NsDiscussionForum.IDiscussionForumInput> {
  @Input() widgetData!: NsDiscussionForum.IDiscussionForumInput

  @ViewChild('editorQuill', { static: true }) editorQuill!: EditorQuillComponent
  @ViewChild('postEnabled', { static: true }) postEnabled: ElementRef<
    HTMLInputElement
  > | null = null
  @ViewChild('postDisabled', { static: true }) postDisabled: ElementRef<
    HTMLInputElement
  > | null = null

  conversationRequest: NsDiscussionForum.IPostRequestV2 = {
    postId: [],
    userId: '',
    answerId: '',
    postKind: [],
    sessionId: Date.now(),
    sortOrder: NsDiscussionForum.EConversationSortOrder.LATEST_DESC,
    pgNo: 0,
    pgSize: 10,
  }
  isRestricted = true
  discussionConverstionResult: any
  dataRefresher: any

  discussionFetchStatus: TFetchStatus = 'none'
  discussionRequest: NsDiscussionForum.ITimelineRequest = {
    pgNo: 0,
    pgSize: 4,
    postKind: [],
    sessionId: Date.now(),
    type: NsDiscussionForum.ETimelineType.DISCUSSION_FORUM,
    userId: '',
    source: undefined,
  }
  isPostingDiscussion = false
  discussionResult: NsDiscussionForum.ITimeline = {
    hits: 0,
    result: [],
  }

  isValidPost = false
  editorText: undefined | string
  userEmail = ''
  userId = ''
  userName = ''
  allowMention = false
  mentions = []
  commentMentions = []
  contentCreatorId: any
  result: any
  constructor(
    private snackBar: MatSnackBar,
    private discussionSvc: WsDiscussionForumService,
    private configSvc: ConfigurationsService,
    private activatedRoute: ActivatedRoute,
    private voteService: BtnSocialLikeService,
    private readonly forumSrvc: ForumService,
  ) {
    super()
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
      this.userEmail = this.configSvc.userProfile.email || ''
      this.userName = this.configSvc.userProfile.userName || ''
    }
    this.discussionRequest.userId = this.userId
    this.conversationRequest.userId = this.userId
  }

  ngOnInit() {
    this.voteService.postId.subscribe((data: any) => {
      if (data) {
        // console.log(data, this.discussionResult.result)
        this.result = _.cloneDeep(this.discussionResult.result)
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
          this.discussionResult.result[index] = post
        }
      })
    }
    })
    if (this.configSvc.restrictedFeatures) {
      this.isRestricted =
        this.configSvc.restrictedFeatures.has('disscussionForum') ||
        this.configSvc.restrictedFeatures.has('disscussionForumTRPU')
    }
    if (!this.isRestricted && !this.widgetData.isDisabled) {
      if (this.widgetData.initialPostCount) {
        this.discussionRequest.pgSize = this.widgetData.initialPostCount
      }
      this.discussionRequest.source = {
        id: this.widgetData.id,
        name: this.widgetData.name,
      }
      this.fetchDiscussion()
    }
    this.activatedRoute.data.subscribe((response: Data) => {
      this.contentCreatorId = response.content.data.creator
      if (response.pageData.data.allowMentionUsers) {
        this.allowMention = response.pageData.data.allowMentionUsers
      }
    })
    // console.log(this.widgetData, this.discussionRequest)
  }
  trackByFn(_index: any, reply: any) {
    return reply.id // or item.id
  }
  fetchDiscussion(refresh = false) {
    this.discussionFetchStatus = 'fetching'
    this.discussionRequest.postKind = [NsDiscussionForum.EPostKind.DISCUSSION_FORUM]
    if (refresh) {
      this.discussionRequest.sessionId = Date.now()
      this.discussionRequest.pgNo = 0
    }
    this.discussionSvc.fetchTimelineData(this.discussionRequest).subscribe(
      data => {
        if (data.hits && data.result) {
          if (refresh) {
            this.discussionResult = {
              hits: 0,
              result: [],
            }
          }
          this.discussionResult.hits = data.hits
          this.discussionResult.result = [...this.discussionResult.result, ...data.result]
          if (data.hits > this.discussionResult.result.length) {
            this.discussionFetchStatus = 'hasMore'
              // tslint:disable-next-line: whitespace
              ; (this.discussionRequest.pgNo as number) += 1
          } else {
            this.discussionFetchStatus = 'done'
            // this.fetchAllPosts()
          }
        } else if (!this.discussionResult.result.length) {
          this.discussionFetchStatus = 'none'
        }
      },
      _err => {
        this.discussionFetchStatus = 'error'
      },
    )
  }

  publishConversation(failMsg: string) {
    this.isPostingDiscussion = true
    const postPublishRequest: NsDiscussionForum.IPostPublishRequest = {
      postContent: {
        abstract: '',
        body: '',
        title: this.editorText || '',
      },
      postCreator: this.userId,
      postKind: NsDiscussionForum.EPostKind.DISCUSSION_FORUM,
      source: {
        id: this.widgetData.id,
        name: this.widgetData.name,
      },
    }
    this.discussionSvc.publishPost(postPublishRequest).subscribe(
      (_data: any) => {
        this.triggerNotification('comment')
        this.editorText = undefined
        this.isValidPost = false
        this.isPostingDiscussion = false
        if (this.editorQuill) {
          this.editorQuill.resetEditor()
        }
        this.fetchDiscussion(true)
      },
      () => {
        this.snackBar.open(failMsg)
        this.isPostingDiscussion = false
      },
    )
  }

  onDeletePost(replyIndex: number) {
    this.discussionResult.result.splice(replyIndex, 1)
    this.discussionResult.hits -= 1
    if (!this.discussionResult.result.length) {
      this.discussionFetchStatus = 'none'
    }
  }

  onTextChange(eventData: { isValid: boolean; htmlText: string }) {
    this.isValidPost = eventData.isValid
    this.editorText = eventData.htmlText
  }

  fetchAllPosts() {
    const postIds: string[] = []
    this.discussionResult.result.forEach((post: NsDiscussionForum.ITimelineResult) =>
      postIds.push(post.id),
    )
    this.conversationRequest.sessionId = Date.now()
    this.conversationRequest.postId = postIds
    this.discussionSvc.fetchAllPosts(this.conversationRequest).subscribe(data => {
      this.discussionConverstionResult = Object.keys(data)
    })
  }
  triggerNotification(parentType: 'reply' | 'comment') {
    let mentionsData: any[] = []
    if (parentType === 'reply') {
      mentionsData = [...this.mentions]
    } else if (parentType === 'comment') {
      mentionsData = [...this.commentMentions]
    }
    if (mentionsData.length) {
      const notificationData = mentionsData.map((mention: any) => {
        return {
          notificationFor: 'discussionForum',
          ContentTitle: this.widgetData.title || '',
          ContentId: this.widgetData.id,
          ContentCreatorID: this.contentCreatorId,
          taggedUserID: mention.id,
          taggedUserName: mention.name,
          taggedUserEmail: mention.email,
          tagCreatorName: this.configSvc.userProfile ? this.configSvc.userProfile.userName || '' : '',
          tagCreatorID: this.configSvc.userProfile ? this.configSvc.userProfile.userId || '' : '',
        }
      })
      // console.log('notificarion data', notificationData)
      this.forumSrvc.triggerTagNotification(notificationData)
    }
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
