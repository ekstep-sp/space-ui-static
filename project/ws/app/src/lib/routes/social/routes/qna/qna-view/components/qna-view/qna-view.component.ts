import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core'
import { MatSnackBar, MatDialog } from '@angular/material'
import { ActivatedRoute, Data, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { NsWidgetResolver } from '@ws-widget/resolver'
import {
  NsError,
  ROOT_WIDGET_CONFIG,
  NsDiscussionForum,
  WsDiscussionForumService,
  EditorQuillComponent,
  DialogSocialDeletePostComponent,
} from '@ws-widget/collection'
import { TFetchStatus, ConfigurationsService, LoggerService, ValueService, NsPage } from '@ws-widget/utils'
import { ForumService } from '../../../../forums/service/forum.service'
import { NsUserDashboard } from '../../../../../../user-dashboard/models/user-dashboard.model'
import { WsSocialService } from '../../../../../services/ws-social.service'
import { BtnSocialLikeService } from '@ws-widget/collection/src/lib/discussion-forum/actionBtn/btn-social-like/service/btn-social-like.service'

@Component({
  selector: 'ws-app-qna-view',
  templateUrl: './qna-view.component.html',
  styleUrls: ['./qna-view.component.scss'],
})
export class QnaViewComponent implements OnInit, OnDestroy {

  private routeSubscription: Subscription | null = null
  qnaConversation!: NsDiscussionForum.IPostResult
  qnaComments: NsDiscussionForum.IPostResult | undefined
  qnaConversationRequest!: NsDiscussionForum.IPostRequest
  errorFetchingTimeline = false
  errorWidget: NsWidgetResolver.IRenderConfigWithTypedData<NsError.IWidgetErrorResolver> = {
    widgetType: ROOT_WIDGET_CONFIG.errorResolver._type,
    widgetSubType: ROOT_WIDGET_CONFIG.errorResolver.errorResolver,
    widgetData: {
      errorType: 'internalServer',
    },
  }

  postFetchStatus!: TFetchStatus
  commentFetchStatus!: TFetchStatus
  isPostingComment = false
  isPostingReply = false
  allowedToEdit = false
  allowedToDeleteForSpecificRoles = false
  allowedToComment = false
  allowedToAnswer = false
  mentions = []
  commentMentions = []
  headersForAllUsers: NsUserDashboard.IHeaders = {} as any
  userDashboardData: NsUserDashboard.IUserData | any
  widLoggedinUser: string | any
  userListData: NsUserDashboard.IUserListDataFromUserTable[] = []
  getRootOrg: string | any = ''
  getOrg: string | any = ''
  userDataInJsonFormat: any = []

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
  commentsFetchRequest: NsDiscussionForum.IPostRequest = {
    postId: '',
    userId: '',
    answerId: '',
    postKind: [NsDiscussionForum.EPostKind.COMMENT],
    sessionId: Date.now(),
    pgNo: 0,
    pgSize: 5,
    sortOrder: NsDiscussionForum.EConversationSortOrder.LATEST_DESC,
  }
  replyAddRequest: NsDiscussionForum.IPostCommentRequest = {
    postKind: NsDiscussionForum.EReplyKind.REPLY,
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

  mentionConfig = {
    //  this.getAllUsers()
    items: this.userDataInJsonFormat,
    triggerChar: '@',
  }
  userId = ''
  showSocialLike = false
  isValidForUserAnswer = false
  allowMention = false

  @ViewChild('editor', { static: true }) editorQuill!: EditorQuillComponent
  @ViewChild('commentEditor', { static: true }) commentEditorQuill!: EditorQuillComponent
  userDetails: any[] = []
  isXSmall$ = this.valueSvc.isXSmall$
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private discussionSvc: WsDiscussionForumService,
    private loggerSvc: LoggerService,
    private configSvc: ConfigurationsService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private socialSvc: WsSocialService,
    private valueSvc: ValueService,
    private readonly forumSrvc: ForumService,
    private voteService: BtnSocialLikeService
  ) {
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
    }
    this.commentAddRequest.postCreator = this.userId
    this.commentAddRequest.source = {
      id: '',
      name: NsDiscussionForum.EDiscussionType.SOCIAL,
    }
    this.commentsFetchRequest.userId = this.userId
    this.replyAddRequest.postCreator = this.userId
    this.replyAddRequest.source = {
      id: '',
      name: NsDiscussionForum.EDiscussionType.SOCIAL,
    }
  }

  ngOnInit() {
    this.voteService.callComponent.subscribe((data: any) => {
      if (data) {
        this.discussionSvc.fetchPost(this.qnaConversationRequest).subscribe(
          (updateData: any) => {
            this.qnaConversation = updateData
          })
      }
    })
    this.initData()
    // this is called to update the postcreator id for delete qna
    // this.fetchConversationData(true)
    // this.getAllUsers()
    // this.getUserDetails()
    this.showSocialLike = (this.configSvc.restrictedFeatures && !this.configSvc.restrictedFeatures.has('socialLike')) || false

  }
  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe()
    }
  }
  private initData() {
    this.ngOnDestroy()
    this.routeSubscription = this.activatedRoute.data.subscribe((response: Data) => {
      if (response.socialData) {
        this.userDashboardData = response.socialData.data.userListData
        this.discussionSvc.setUserDashboardConfig(this.userDashboardData)
        this.getRootOrg = response.socialData.data.userListData.root_org,
          this.getOrg = response.socialData.data.userListData.org
      }
      if (response.socialData.data.allowMentionUsers) {
        this.allowMention = response.socialData.data.allowMentionUsers
      }
      if (response.socialData.error) {
        this.allowedToEdit = false
        // tslint:disable-next-line: max-line-length
      } else if (this.forumSrvc.isVisibileAccToRoles(response.socialData.data.rolesAllowed.QnA, response.socialData.data.rolesNotAllowed.QnA)) {
        this.allowedToEdit = true
        this.allowedToComment = true
        this.allowedToAnswer = true
      }
      // this method will allow the access to only specific roles to delete qna thread
      this.allowedToDeleteForSpecificRoles = this.socialSvc.deleteAccessForSpecificRole(response.socialData.data.rolesAllowedForDelete ?
        response.socialData.data.rolesAllowedForDelete.QnA : [])

      if (response.resolveData.error) {
        this.errorFetchingTimeline = true
      } else {
        this.qnaConversationRequest = response.resolveData.data.request
        this.qnaConversation = response.resolveData.data.response
        this.verifyConversation()
        this.fetchQuestionComments()
      }
    })
  }
  private verifyConversation() {
    if (this.qnaConversation.mainPost.status === NsDiscussionForum.EPostStatus.DRAFT) {
      this.router.navigate(['../', 'edit', this.qnaConversationRequest.postId], { relativeTo: this.activatedRoute })
    } else if (this.qnaConversation.mainPost.status === NsDiscussionForum.EPostStatus.INACTIVE) {
      this.router.navigate(['error-access-forbidden'])
    }
  }
  fetchConversationData(forceNew: boolean, fetchComments = false) {
    if (forceNew) {
      this.qnaConversationRequest.pgNo = 0
      this.qnaConversationRequest.sessionId = Date.now()
    } else {
      (this.qnaConversationRequest.pgNo as number) += 1
    }
    this.postFetchStatus = 'fetching'
    this.discussionSvc.fetchPost(this.qnaConversationRequest).subscribe(
      data => {
        if (data) {
          if (data.mainPost.postCreator.postCreatorId) {
            this.qnaConversationRequest.postCreatorId = data.mainPost.postCreator.postCreatorId
          }
          if (data.mainPost && data.mainPost.id && forceNew) {
            this.qnaConversation = data
            this.postFetchStatus = 'done'
          } else if (
            (!data.mainPost || !data.mainPost.id) &&
            this.qnaConversation
          ) {
            if (forceNew) {
              this.qnaConversation.replyPost = []
            }
            this.qnaConversation.replyPost = [
              ...this.qnaConversation.replyPost,
              ...(data.replyPost || []),
            ]
            this.qnaConversation.postCount = data.postCount || 0
            this.qnaConversation.newPostCount = data.newPostCount || 0
            this.postFetchStatus = 'done'
          } else if (
            (!data.mainPost || !data.mainPost.id) &&
            !this.qnaConversation
          ) {
            this.postFetchStatus = 'none'
          }
          if (fetchComments) {
            this.fetchQuestionComments()
          }
        } else if (!this.qnaConversation) {
          this.postFetchStatus = 'none'
        }
        (this.qnaConversationRequest.pgNo as number) += 1
      },
      () => {
        this.postFetchStatus = 'error'
      },
    )
  }

  private fetchQuestionComments(forceNew = false) {
    if (!this.commentsFetchRequest.postId) {
      this.commentsFetchRequest.postId = this.qnaConversationRequest.postId
    }
    if (forceNew) {
      this.commentsFetchRequest.pgNo = 0
      this.commentsFetchRequest.sessionId = Date.now()
      if (this.qnaComments) {
        this.qnaComments.replyPost = []
      }
    }
    this.commentFetchStatus = 'fetching'
    this.discussionSvc
      .fetchPost(this.commentsFetchRequest)
      .subscribe(
        data => {
          if (data && data.replyPost) {
            if (!this.qnaComments) {
              this.qnaComments = data
            } else {
              this.qnaComments.newPostCount = data.newPostCount
              this.qnaComments.postCount = data.postCount
              this.qnaComments.replyPost = [
                ...this.qnaComments.replyPost,
                ...data.replyPost,
              ]
            }
          }
          (this.commentsFetchRequest.pgNo as number) += 1
          this.commentFetchStatus = 'done'
        },
        () => {
          this.commentFetchStatus = 'error'
        },
      )
  }

  postComment() {
    this.isPostingComment = true
    this.commentAddRequest.parentId = this.qnaConversationRequest.postId
    this.commentAddRequest.postKind = NsDiscussionForum.EReplyKind.COMMENT
    this.discussionSvc.publishPost(this.commentAddRequest).subscribe(
      () => {
        this.commentAddRequest.postContent.body = ''
        this.isPostingComment = false
        this.triggerNotification('comment')
        this.fetchQuestionComments(true)
      },
      () => {
        this.isPostingComment = false
      },
    )
  }

  postReply() {
    this.isPostingReply = true
    this.replyAddRequest.parentId = this.qnaConversationRequest.postId
    this.replyAddRequest.postKind = NsDiscussionForum.EReplyKind.REPLY
    this.discussionSvc.publishPost(this.replyAddRequest).subscribe(
      () => {
        this.triggerNotification('reply')
        this.replyAddRequest.postContent.body = ''
        this.isPostingReply = false
        this.editorQuill.resetEditor()
        this.isValidForUserAnswer = false
        this.fetchConversationData(true)
      },
      () => {
        this.isPostingReply = false
      },
    )
  }

  deletePost(successMsg: string) {
    this.discussionSvc.fetchPost(this.qnaConversationRequest).subscribe(
      data => {
          if (data) {
          const dialogRef = this.dialog.open(DialogSocialDeletePostComponent, {
            data: {
             // postcreator id is required for deleting the qna for  specific roles
              postCreatorId: data.mainPost.postCreator.postCreatorId,
              postId: this.qnaConversationRequest.postId,
            },
          })
          dialogRef.afterClosed().subscribe(
            // tslint:disable-next-line: no-shadowed-variable
            (data: boolean) => {
              if (data) {
                this.router.navigate(['../'], { relativeTo: this.activatedRoute })
                this.snackBar.open(successMsg)
              }
            })
          }
        })
  }

  onAnswerAccept(itemId: string) {
    try {
      let replyItem: NsDiscussionForum.ITimelineResult
      if (
        this.qnaConversation.acceptedAnswer &&
        this.qnaConversation.acceptedAnswer.id
      ) {
        replyItem = { ...this.qnaConversation.acceptedAnswer }
        this.qnaConversation.replyPost.push(replyItem)
      }
      const itemIndex = this.qnaConversation.replyPost.findIndex(
        reply => reply.id === itemId,
      )
      const pullItem = this.qnaConversation.replyPost.splice(itemIndex, 1)
      this.qnaConversation.acceptedAnswer = pullItem[0]
      const acceptedAnswerElement = document.getElementById('answers')
      if (acceptedAnswerElement) {
        acceptedAnswerElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }
    } catch (e) {
      this.loggerSvc.error('ERROR WHILE FILLING ACCEPTED ANSWER IN CACHE DATA. RE-FETCHING CONVERSATION DATA')
      this.fetchConversationData(true)
    }
  }

  onDeleteSuccess(data: { isAccepted: boolean, id: string }) {
    try {
      if (!data.isAccepted) {
        const itemIndex = this.qnaConversation.replyPost.findIndex(
          reply => reply.id === data.id,
        )
        this.qnaConversation.replyPost.splice(itemIndex, 1)
      } else {
        this.qnaConversation.acceptedAnswer = null
      }
    } catch (e) { }
  }

  onTextChange(event: { htmlText: string; isValid: boolean }) {
    this.replyAddRequest.postContent.body = event.htmlText
    this.isValidForUserAnswer = event.isValid
  }

  onCommentTextChange(event: { htmlText: string; isValid: boolean }) {
    this.commentAddRequest.postContent.body = event.htmlText
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
          notificationFor: 'qna',
          QnaTitle: this.postTitle || '',
          QnaId: this.qnaConversationRequest.postId,
          QnaCreatorID: this.qnaConversation.mainPost.postCreator.postCreatorId,
          taggedUserID: mention.id,
          taggedUserName: mention.name,
          taggedUserEmail: mention.email,
          tagCreatorName: this.configSvc.userProfile ? this.configSvc.userProfile.userName || '' : '',
          tagCreatorID: this.configSvc.userProfile ? this.configSvc.userProfile.userId || '' : '',
        }
      })
      this.forumSrvc.triggerTagNotification(notificationData)
    }
  }

  get postTitle() {
    try {
      if (this.qnaConversation && this.qnaConversation.mainPost.postContent.title) {
        const domEl = new DOMParser().parseFromString(this.qnaConversation.mainPost.postContent.title, 'text/html')
        return (domEl.children[0] as any).innerText
      }
      return ''
    } catch (e) {
      return ''
    }
  }
  getAllUsers(): any {
    this.headersForAllUsers.rootOrg = this.getRootOrg
    this.headersForAllUsers.org = this.getOrg
    this.headersForAllUsers.wid_OrgAdmin = this.userId
    this.discussionSvc.getAllUsersList(this.headersForAllUsers).subscribe(data => {
      if (data.DATA != null) {
        this.userDataInJsonFormat = this.userListJson(data.DATA)
      }
    })
  }

  userListJson(userList: NsUserDashboard.IUserListDataFromUserTable[]) {
    // tslint:disable-next-line: prefer-const
    let obj = []
    if (userList) {
      // tslint:disable-next-line: no-increment-decrement
      for (let i = 0; i < userList.length; i++) {
        // tslint:disable-next-line: prefer-template
        // const fullname = this.discussionForumService.getFullName({ user: userList[] })
        // tslint:disable-next-line: prefer-template
        const fullname = userList[i].first_name + ' ' + userList[i].last_name
        // tslint:disable-next-line: object-literal-key-quotes
        obj.push({ 'id': userList[i].wid, 'value': fullname, data: JSON.stringify({ email: userList[i].email }) })
      }
    }
    return obj
  }

  triggerReplyCommentNotification(notificationData: any) {
    // send one notification such that it reaches both, the person who was mentioned in the reply comment and the creator
    // of answer on which comment was made
    const notificationRequest = notificationData.mentions.map((mention: any) => {
      return {
        notificationFor: 'qna',
          taggedUserID: mention.id,
          taggedUserName: mention.name,
          taggedUserEmail: mention.email,
          tagCreatorName: this.configSvc.userProfile ? this.configSvc.userProfile.userName || '' : '',
          tagCreatorID: this.configSvc.userProfile ? this.configSvc.userProfile.userId || '' : '',
          QnaTitle: this.postTitle || '',
          QnaId: this.qnaConversationRequest.postId,
          QnaCreatorID: notificationData.topLevelReply.postCreator.postCreatorId,
      }
    })
    if (notificationRequest.length) {
      this.forumSrvc.triggerTagNotification(notificationRequest)
    }
  }
}
