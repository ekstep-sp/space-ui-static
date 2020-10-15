import { Component, OnInit, Input } from '@angular/core'

@Component({
  selector: 'ws-widget-display-users-social-vote',
  templateUrl: './display-users-social-vote.component.html',
  styleUrls: ['./display-users-social-vote.component.scss'],
})
export class DisplayUsersSocialVoteComponent implements OnInit {

  @Input()
  userList: any[] = []
  @Input()
  userListDownVote: any[] = []
  @Input()
  voteType: any
  @Input()
  userLike: any[] = []

  @Input()
  iconType: any
  @Input()
  userDetailsForDownVote: any
  @Input()
  isReply = false

  userListForUpvote: any
  constructor() { }

  ngOnInit() {
  }

}
