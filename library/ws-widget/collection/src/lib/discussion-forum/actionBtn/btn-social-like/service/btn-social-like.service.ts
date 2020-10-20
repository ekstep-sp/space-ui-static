import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class BtnSocialLikeService {

userUpVoteObject = new BehaviorSubject<[] >([])
userDownVoteObject = new BehaviorSubject<[] >([])
callComponent = new BehaviorSubject<boolean >(false)
constructor() { }

triggerStoreLikeData(upVote: any, downVote: any) {
  // console.log(likeData)
this.userUpVoteObject.next(upVote)
this.userDownVoteObject.next(downVote)
}
updateStatus(value: boolean) {
  this.callComponent.next(value)
}
}
