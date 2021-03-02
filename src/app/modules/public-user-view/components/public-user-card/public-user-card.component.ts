import { Component, OnInit, Input } from '@angular/core'
import { DEFAULT_IMAGE_URL } from '../../constants'
import { ValueService } from '@ws-widget/utils'
import { IUserConnections } from './../../models/public-users.interface'
@Component({
  selector: 'ws-public-user-card',
  templateUrl: './public-user-card.component.html',
  styleUrls: ['./public-user-card.component.scss'],
})
export class PublicUsercardComponent implements OnInit {
  @Input() userData: any = {}
  @Input() allowToMail = true
  @Input() userConnectionsList:IUserConnections[] = []
  userdata: any
  defaultUserImage = DEFAULT_IMAGE_URL
  isXSmall$ = this.valueSvc.isXSmall$
  isXSmall = false
  constructor(private valueSvc: ValueService) {
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      this.isXSmall = isXSmall
    })
  }
  ngOnInit() {
  }
  navigateToProfileLink(url: string) {
    return (!this.isXSmall) ? window.open(url, '_blank') : window.open(url, '_self')
  }
  atLeastOnevaluePresent(propertyObject: any) {
    if (typeof propertyObject === 'object' && propertyObject !== null && propertyObject !== undefined) {
      return Object.keys(propertyObject).some((key: string) => !!propertyObject[key])
    }
    return false
  }
}
