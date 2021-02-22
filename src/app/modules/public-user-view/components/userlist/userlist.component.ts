import { Component, OnInit, Input } from '@angular/core'
import { DEFAULT_IMAGE_URL } from '../../constants'

@Component({
  selector: 'ws-userlist',
  templateUrl: './userlist.component.html',
  styleUrls: ['./userlist.component.scss'],
})
export class UserlistComponent implements OnInit {
  // tslint:disable-next-line:no-non-null-assertion
  @Input() !userData: any = {}
  userdata: any
  defaultUserImage = DEFAULT_IMAGE_URL

  constructor() { }

  ngOnInit() {

  }
}
