import { Component, OnInit, Input } from '@angular/core'
import { NsContent, viewerRouteGenerator } from '@ws-widget/collection/src/public-api'

@Component({
  selector: 'ws-app-app-toc-content-details-tree',
  templateUrl: './app-toc-content-details-tree.component.html',
  styleUrls: ['./app-toc-content-details-tree.component.scss'],
})
export class AppTocContentDetailsTreeComponent implements OnInit {
  @Input() content: NsContent.IContent | null = null
  @Input() expandAll = false
  @Input() rootId!: string
  @Input() rootContentType!: string
  @Input() forPreview = false
  @Input() index: any
  @Input() hasChild = false
  isLinear = false

  constructor() { }

  ngOnInit() {
  }
  get isResource(): boolean {
    if (this.content) {
      return (
        this.content.contentType === 'Resource' || this.content.contentType === 'Knowledge Artifact'
      )
    }
    return false
  }
  get resourceLink(): { url: string; queryParams: { [key: string]: any } } {
    if (this.content) {
      return viewerRouteGenerator(
        this.content.identifier,
        this.content.mimeType,
        this.rootId,
        this.rootContentType,
        this.forPreview,
      )
    }
    return { url: '', queryParams: {} }
  }
  get isCollection(): boolean {
    if (this.content) {
      return this.content.mimeType === NsContent.EMimeTypes.COLLECTION
    }
    return false
  }
}
