import { Component, OnInit, Input } from '@angular/core'
import { DEFAULT_IMAGE_URL } from '../../constants'

@Component({
  selector: 'ws-public-user-card',
  templateUrl: './public-user-card.component.html',
  styleUrls: ['./public-user-card.component.scss'],
})
export class PublicUsercardComponent implements OnInit {
  @Input() userData: any = {}
  userdata: any
  defaultUserImage = DEFAULT_IMAGE_URL

  constructor() { }

  ngOnInit() {

  }
}
