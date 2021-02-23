import { Component, OnInit, Input } from '@angular/core'
import { DEFAULT_IMAGE_URL } from '../../constants'

@Component({
  selector: 'ws-publi-usercard',
  templateUrl: './publi-usercard.component.html',
  styleUrls: ['./publi-usercard.component.scss'],
})
export class PubliUsercardComponent implements OnInit {

  // tslint:disable-next-line:no-non-null-assertion
  @Input()!userData: any = {}
  userdata: any
  defaultUserImage = DEFAULT_IMAGE_URL

  constructor() { }

  ngOnInit() {

  }
}
