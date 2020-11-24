import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class BtnSocialLikeService {

userUpVoteObject = new BehaviorSubject<[] >([])
userDownVoteObject = new BehaviorSubject<[] >([])
callComponent = new BehaviorSubject<boolean >(false)
updateVoteListCount = new BehaviorSubject<boolean >(false)
userId = new BehaviorSubject<any>('')
postId = new BehaviorSubject<any>('')

constructor() { }

triggerStoreLikeData(upVote: any, downVote: any) {
  // console.log(likeData)
this.userUpVoteObject.next(upVote)
this.userDownVoteObject.next(downVote)
}
updateStatus(value: boolean, postId: any, userId: any) {
  this.callComponent.next(value)
  this.userId.next(userId)
  this.postId.next(postId)
}
updateVoteList(value: boolean) {
  this.updateVoteListCount.next(value)
}
}
