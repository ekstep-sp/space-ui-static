import { Component, OnInit, Input } from '@angular/core';
import { DEFAULT_IMAGE_URL } from '../../constants';

@Component({
  selector: 'ws-public-user-userlist',
  templateUrl: './public-user-userlist.component.html',
  styleUrls: ['./public-user-userlist.component.scss']
})
export class PublicUserUserlistComponent implements OnInit {
  // tslint:disable-next-line:no-non-null-assertion
  @Input() !userData: any = {}
  userdata: any
  defaultUserImage = DEFAULT_IMAGE_URL

  constructor() { }

  ngOnInit() {

  }
}
