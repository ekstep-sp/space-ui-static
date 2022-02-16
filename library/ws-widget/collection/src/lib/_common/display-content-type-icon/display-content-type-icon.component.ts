import { Component, OnInit, Input, OnChanges } from '@angular/core'
import { NsContent } from '../../_services/widget-content.model'

@Component({
  selector: 'ws-widget-display-content-type-icon',
  templateUrl: './display-content-type-icon.component.html',
  styleUrls: ['./display-content-type-icon.component.scss'],
})
export class DisplayContentTypeIconComponent implements OnInit, OnChanges {

  @Input() displayContentType: NsContent.EDisplayContentTypes = NsContent.EDisplayContentTypes.DEFAULT
  @Input() customIcon = ''
  @Input() customTooltip = ''
  @Input() displayResourceType: NsContent.EMimeTypes = NsContent.EMimeTypes.UNKNOWN
  @Input() contentUrl = ''
  displayContentTypeEnum = NsContent.EDisplayContentTypes
  displayContentMimeEnum = NsContent.EMimeTypes
  constructor() { }

  ngOnInit() {

    console.log("DisplayContentTypeIconComponent : ", this.contentUrl)
    if(this.contentUrl ){
      if(this.contentUrl.endsWith('docx')){
        this.customIcon='description'
        this.customTooltip="word"
      }
      if(this.contentUrl.endsWith('xlsx')){
        this.customIcon='grid_on'
        this.customTooltip="excel"
      }
    }
   }
  ngOnChanges() { }

}
