import { Component, OnInit, Input } from '@angular/core'
import { BtnSocialLikeService } from '../btn-social-like/service/btn-social-like.service';

@Component({
  selector: 'ws-widget-display-users-social-vote',
  templateUrl: './display-users-social-vote.component.html',
  styleUrls: ['./display-users-social-vote.component.scss'],
})
export class DisplayUsersSocialVoteComponent implements OnInit {

  @Input()
  userList: any
  @Input()
  userListDownVote: any
  @Input()
  voteType: any
  @Input()
  userLike: any
  @Input() replyPost: any
  @Input()
  iconType: any
  @Input()
  userDetailsForDownVote: any

  userListForUpvote: any
  constructor(public likeService: BtnSocialLikeService) { }

  ngOnInit() {
    // setTimeout(() => {
    //   this.likeService.userUpVoteObject.subscribe((upVoteObject: any) => {
    //     upVoteObject ? this.userList = upVoteObject : this.userList = this.userList
    //   })
    //   this.likeService.userUpVoteObject.subscribe((downVoteObject: any) => {
    //     downVoteObject ? this.userListDownVote = downVoteObject : this.userListDownVote = this.userlistdownvote
    //   })
    // },         100)
    // this.checkFunction()
  }
}
