import { Component, OnInit, Output, EventEmitter, Input, OnDestroy, ElementRef, ViewChild } from '@angular/core'
import 'quill-mention'
import { NsUserDashboard } from '../../../../../../../project/ws/app/src/lib/routes/user-dashboard/models/user-dashboard.model'
import { ConfigurationsService } from '../../../../../utils/src/public-api'
import { WsDiscussionForumService } from '../ws-discussion-forum.services'
import { ActivatedRoute } from '@angular/router'
import { uniqBy } from 'lodash'
import { quillBaseConfig } from './config/quill-config'
@Component({
  selector: 'ws-widget-editor-quill',
  templateUrl: './editor-quill.component.html',
  styleUrls: ['./editor-quill.component.scss'],
})
export class EditorQuillComponent implements OnInit, OnDestroy {
  modules = {}
  isValidInput = false
  @Output() textData = new EventEmitter<{
    isValid: boolean
    htmlText: string
    text: string
    mentions?: object[]
  }>()
  @Output() mentionsData = new EventEmitter<any[]>()
  @ViewChild('editor', { static: false }) editor: ElementRef | any

  @Input() htmlText = ''
  @Input() minLength = '1'
  @Input() post ?= false
  @Input() showMention = false
  @Input() placeholder = ''
  text = ''

  reset = false
  defaultPlaceholder = 'Ask a question, or add something you found helpful'
  headersForAllUsers: NsUserDashboard.IHeaders = {} as any
  userDashboardData: NsUserDashboard.IUserData | any
  widLoggedinUser: string | any
  userListData: NsUserDashboard.IUserListDataFromUserTable[] = []
  getRootOrg: string | any = ''
  getOrg: string | any = ''
  userDataInJsonFormat: any = []

  quillConfig = {
    ...quillBaseConfig.modules,

    mention: {
      allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
      mentionDenotationChars: ['@', '#'],

      source: (searchTerm: string, renderList: (arg0: { id: number; value: string }[], arg1: any) => void, mentionChar: string) => {
        let values: string | any = []
        if (mentionChar === '@') {
          // const users: NsUserDashboard.IUserListDataFromUserTable[] = this.getAllUsers()
          this.getAllUsers()
          values = this.userDataInJsonFormat
        }
        if (searchTerm.length === 0) {
          renderList(values, searchTerm)
        } else {
          const matches = []
          if (values) {
            // tslint:disable-next-line: no-increment-decrement
            for (let i = 0; i < values.length; i++) {
              // tslint:disable-next-line: no-bitwise
              if (~values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())) { matches.push(values[i]) }
            }
          }
          renderList(matches, searchTerm)
        }
      },
      dataAttributes: ['id', 'value', 'data'],
    },
  }
  constructor(private configSvc: ConfigurationsService,
              private activateRoute: ActivatedRoute,
              private discussionForumService: WsDiscussionForumService) {
    if (this.configSvc.userProfile) {
      this.widLoggedinUser = this.configSvc.userProfile.userId
    }
  }

  ngOnInit() {

    if (this.post) {
      this.placeholder = 'Add a post ...'
    }
    if (this.showMention) {
      this.getUserDatFromConfig()
    }
  }

  ngOnDestroy() {
    this.userDataInJsonFormat = []
  }
  getUserDatFromConfig() {
    this.activateRoute.data.subscribe(data => {
      if (data.socialData) {
        this.userDashboardData = data.socialData.data.userListData
        this.discussionForumService.setUserDashboardConfig(this.userDashboardData)
        this.getRootOrg = data.socialData.data.userListData.root_org,
          this.getOrg = data.socialData.data.userListData.org
      }
    })
  }
  onContentChanged(editorEvent: any) {
    this.isValidInput = editorEvent.text.trim().length
    const newList = this.emitMentionsEvent(editorEvent.content.ops)
    this.textData.emit({
      isValid: editorEvent.text.trim().length > this.minLength,
      htmlText: editorEvent.html,
      text: editorEvent.text,
      mentions: newList,
    })
    this.mentionsData.emit(newList)
  }

  emitMentionsEvent(operations: any) {
    const mentions = operations.filter((op: any) => {
      return op.hasOwnProperty('insert') && typeof op.insert !== 'string'
    }).map((mention: any) => {
      // tslint:disable-next-line: max-line-length
      return {
        name: mention.insert.mention.value,
        id: mention.insert.mention.id,
        email: JSON.parse(mention.insert.mention.data).email,
      }
    },
    )
    const uniqueUsers = uniqBy(mentions, 'id')
    return uniqueUsers
  }

  resetEditor() {
    this.reset = true
    setTimeout(() => {
      this.reset = false
    },         0)
  }

  getAllUsers(): any {
    this.headersForAllUsers.rootOrg = this.getRootOrg
    this.headersForAllUsers.org = this.getOrg
    this.headersForAllUsers.wid_OrgAdmin = this.widLoggedinUser
    this.discussionForumService.getAllUsersList(this.headersForAllUsers).subscribe(data => {
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
        const fullname = this.discussionForumService.getFullName({ user: userList[i] })
        obj.push({ id: userList[i].wid, value: fullname, data: JSON.stringify({ email: userList[i].email }) })
      }
    }
    return obj
  }

  errorOnLoading() {
    const errorObj = []
    errorObj.push({ id: -1, value: 'Could not fetch user data' })
    return errorObj
  }
}
