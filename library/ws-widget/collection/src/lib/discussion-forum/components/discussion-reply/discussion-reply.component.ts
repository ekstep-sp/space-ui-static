import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { MatDialog, MatSnackBar } from '@angular/material'
import { ConfigurationsService } from '@ws-widget/utils'
import { WsDiscussionForumService } from '../../ws-discussion-forum.services'
import { NsDiscussionForum } from '../../ws-discussion-forum.model'
import { DialogSocialDeletePostComponent } from '../../dialog/dialog-social-delete-post/dialog-social-delete-post.component'

@Component({
  selector: 'ws-widget-discussion-reply',
  templateUrl: './discussion-reply.component.html',
  styleUrls: ['./discussion-reply.component.scss'],
})
export class DiscussionReplyComponent implements OnInit {

  @Input() reply!: NsDiscussionForum.ITimelineResult
  @Output() deleteSuccess = new EventEmitter<boolean>()
  @Input() allowMention = false
  @Output() triggerReplyNotification = new EventEmitter<object | undefined>()
  @Input()  parentPostCreatorId!: string
  userId = ''
  editMode = false
  replyPostEnabled = false
  updatedBody: string | undefined
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
  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private configSvc: ConfigurationsService,
    private discussionSvc: WsDiscussionForumService,
  ) {
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
    }
  }

  ngOnInit() { }

  deletePost(failMsg: string) {
    const dialogRef = this.dialog.open(DialogSocialDeletePostComponent, {
      data: { postId: this.reply.id },
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

  editReply(failMsg: string) {
    this.reply.postContent.body = this.updatedBody || ''
    this.editMode = false
    const postUpdateRequest: NsDiscussionForum.IPostUpdateRequest = {
      editor: this.userId,
      id: this.reply.id,
      meta: {
        abstract: '',
        body: this.updatedBody || '',
        title: '',
      },
      postKind: NsDiscussionForum.EPostKind.REPLY,
    }
    this.discussionSvc.updatePost(postUpdateRequest).subscribe(
      _ => {
        this.triggerNotification('reply')
        this.updatedBody = undefined
        if (this.reply.lastEdited) {
          this.reply.lastEdited.dtLastEdited = Date.now().toString()
        }
        this.reply.dtLastModified = Date.now().toString()
      },
      () => {
        this.editMode = true
        this.snackBar.open(failMsg)
      },
    )
  }

  onReplyTextChange(eventData: { isValid: boolean; htmlText: string }) {
    this.replyPostEnabled = eventData.isValid
    this.updatedBody = eventData.htmlText
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
      topLevelReply: this.reply,
      parentPostCreatorId: this.parentPostCreatorId,
      currentCommentData: this.commentAddRequest,
    })
  }
}
