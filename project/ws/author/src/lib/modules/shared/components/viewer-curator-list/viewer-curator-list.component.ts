import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'ws-author-viewer-curator-list',
  templateUrl: './viewer-curator-list.component.html',
  styleUrls: ['./viewer-curator-list.component.scss']
})
export class ViewerCuratorListComponent implements OnInit {

  @Input() content: any = null
  @Input() askAuthorEnabled = false
  @Input() mailIcon$ = true
  @Input() fixLineIssue = false
  constructor() { }

  ngOnInit() {
    console.log('final content for curator list is', this.content)
  }

}
