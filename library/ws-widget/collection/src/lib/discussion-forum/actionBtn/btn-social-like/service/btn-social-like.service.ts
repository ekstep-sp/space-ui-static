import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { NsDiscussionForum } from '../../../ws-discussion-forum.model';

@Injectable({
  providedIn: 'root',
})
export class BtnSocialLikeService {

userLikeObject = new BehaviorSubject<NsDiscussionForum.IPostActivity | null >(null)
constructor() { }

triggerStoreLikeData(likeData: any) {
  console.log(likeData)
this.userLikeObject.next(likeData)
}
}
