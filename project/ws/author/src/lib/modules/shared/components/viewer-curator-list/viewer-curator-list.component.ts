import { Component, Input, OnInit } from '@angular/core'

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'ws-author-viewer-curator-list',
  templateUrl: './viewer-curator-list.component.html',
  styleUrls: ['./viewer-curator-list.component.scss'],
})
export class ViewerCuratorListComponent implements OnInit {

  @Input() content: any = null
  @Input() askAuthorEnabled = false
  @Input() mailIcon$ = true
  @Input() fixLineIssue = false
  constructor() { }

  ngOnInit() {
  }

}
