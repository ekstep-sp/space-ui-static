import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { NsContent,  VIEWER_ROUTE_FROM_MIME } from '@ws-widget/collection'
import { Subscription } from 'rxjs'

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'ws-public-share-view',
  templateUrl: './public-share-view.component.html',
  styleUrls: ['./public-share-view.component.scss'],
})
export class PublicShareViewComponent implements OnInit, OnDestroy {

  routeSub$: Subscription | null = null
  message = ''
  contentDisplyType = ''
  resourceType = ''
  currentcontent: NsContent.IContent | null = null
  @Output() guestData = new EventEmitter<NsContent.IContent>()
  constructor(
    private readonly route: ActivatedRoute,
  ) { }

  ngOnInit() {
    try {
      const guestDataToSend = this.route.snapshot.children[0].data
      this.guestData.emit(guestDataToSend.content)
      this.initContentView(guestDataToSend.content)
    } catch (_e) {
      // this will catch error everytime user is clicking on back button from public viewer, at that time children are no longer there
    }
  }

  initContentView(content: NsContent.IContent) {
    if (!content) {
      this.message = 'Unable to load content, try again later!'
    } else {
      this.currentcontent = content
      this.resourceType = content.resourceType
      this.contentDisplyType = VIEWER_ROUTE_FROM_MIME(content.mimeType)
    }
  }

  ngOnDestroy() {
    // alert('removed guest from public-share-view')
    // this.configSrvc.removeGuestUser()
    if (this.routeSub$) {
      this.routeSub$.unsubscribe()
    }
  }

}
