import { Component, OnInit, Input } from '@angular/core';
import { DEFAULT_IMAGE_URL } from '../../constants';

@Component({
  selector: 'ws-public-userlist',
  templateUrl: './public-userlist.component.html',
  styleUrls: ['./public-userlist.component.scss']
})
export class PublicUserlistComponent implements OnInit {

  @Input() !userData: any = {}
  userdata: any
  defaultUserImage = DEFAULT_IMAGE_URL

  constructor() { }

  ngOnInit() {

  }
}
