import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { NsContent, VIEWER_ROUTE_FROM_MIME } from '@ws-widget/collection'
import { ConfigurationsService } from '@ws-widget/utils/src/public-api'
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
  constructor(
    private readonly route: ActivatedRoute,
    private readonly configSrvc: ConfigurationsService
  ) { }

  ngOnInit() {
    if (this.route) {
      this.routeSub$ = this.route.data.subscribe((data: any) => {
        this.initContentView(data.content)
      })
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
    this.configSrvc.removeGuestUser()
    if (this.routeSub$) {
      this.routeSub$.unsubscribe()
    }
  }

}
