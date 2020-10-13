import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class BtnSocialLikeService {

userUpVoteObject = new BehaviorSubject<[] | null >(null)
userDownVoteObject = new BehaviorSubject<[] | null >(null)
constructor() { }

triggerStoreLikeData(upVote: any, downVote: any) {
  // console.log(likeData)
this.userUpVoteObject.next(upVote)
this.userDownVoteObject.next(downVote)
}
}
