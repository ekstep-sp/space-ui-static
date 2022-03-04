import { Component, OnInit } from '@angular/core';
import { ConfigurationsService, NsPage } from '@ws-widget/utils'

@Component({
  selector: 'ws-app-qna-space-platform-text',
  templateUrl: './qna-space-platform-text.component.html',
  styleUrls: ['./qna-space-platform-text.component.scss']
})
export class QnaSpacePlatformTextComponent implements OnInit {
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  constructor(
    private configSvc: ConfigurationsService,
  ) { }

  ngOnInit() {
  }

}
