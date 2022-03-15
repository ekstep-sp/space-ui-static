import { Component, OnInit } from '@angular/core';
import { NsDiscussionForum, WsDiscussionForumService } from '@ws-widget/collection';
import { ConfigurationsService, NsPage } from '@ws-widget/utils'

@Component({
  selector: 'ws-app-qna-societal-thinking',
  templateUrl: './qna-societal-thinking.component.html',
  styleUrls: ['./qna-societal-thinking.component.scss']
})
export class QnaSocietalThinkingComponent implements OnInit {

  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  helpTimeLineRequest!: NsDiscussionForum.ITimelineRequest
  errorFetchingTimeline = false
  allowedToAsk = true
  allowedToEdit = true
  allowedToDeleteForSpecificRoles = false
  currentTab = NsDiscussionForum.ETimelineType.ALL
  questions: NsDiscussionForum.ITimelineResult[] = []
  qnaTimelineForSpacePlatform: NsDiscussionForum.ITimelineResult[] = []
  userId = ''
  constructor(
    private configSvc: ConfigurationsService,
    private fetchTimeLine: WsDiscussionForumService,
  ) {
  }
  ngOnInit() {
    this.userId = this.configSvc.userProfile && this.configSvc.userProfile.userId || ''
    console.log(this.configSvc)
    const request: NsDiscussionForum.ITimelineRequest = {
      postKind: [NsDiscussionForum.EPostKind.QUERY],
      pgNo: 0,
      pgSize: 100,
      sessionId: Date.now(),
      userId: '9bf97317-861e-4e9c-8666-6a891017ebfa',
      type: NsDiscussionForum.ETimelineType.MY_TIMELINE
    }
    this.fetchTimeLine.fetchQNATimelineData(request).subscribe(data => {
      this.questions = data.result
      this.questions.map(tagData => {
        tagData.tags.forEach(tag => {
          if (tag.name === 'Societal Thinking')
            this.qnaTimelineForSpacePlatform.push(tagData)
        })
      })
      console.log(this.qnaTimelineForSpacePlatform)
    })
  }
}
