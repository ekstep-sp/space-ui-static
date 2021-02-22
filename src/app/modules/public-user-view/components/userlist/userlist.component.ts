import { Component, OnInit, Input } from '@angular/core'

@Component({
  selector: 'ws-userlist',
  templateUrl: './userlist.component.html',
  styleUrls: ['./userlist.component.scss'],
})
export class UserlistComponent implements OnInit {
  // tslint:disable-next-line:no-non-null-assertion
  @Input() !userData: any = {}
  userdata: any
  defaultUserImage = '/assets/images/profile/profileimage.png'

  constructor() { }

  ngOnInit() {

  }
}
