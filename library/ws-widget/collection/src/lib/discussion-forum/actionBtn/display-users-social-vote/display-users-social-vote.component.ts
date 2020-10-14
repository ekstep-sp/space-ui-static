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
  triggerdVote = false
  userListForUpvote: any
  constructor(public likeService: BtnSocialLikeService) { }

  ngOnInit() {
      this.likeService.callComponent.subscribe((data: any) => {
        this.triggerdVote = data
        console.log(data)
    //   if (this.triggerdVote) {
    //   this.likeService.userUpVoteObject.subscribe((upVoteObject: any) => {
    //     this.userList = upVoteObject
    //     console.log(upVoteObject)
    //   })
    //   this.likeService.userDownVoteObject.subscribe((downVoteObject: any) => {
    //     this.userListDownVote = downVoteObject
    //     console.log(downVoteObject)
    //   })
    // }
    })
  }
}
