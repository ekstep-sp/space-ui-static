import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { DEFAULT_IMAGE_URL, CONNECTION_STATUS_CONNECT, CHECK_CONNECTION_STATUS_CONNECTED } from '../../constants'
import { ValueService, ConfigurationsService } from '@ws-widget/utils'
import { IUserConnections } from './../../models/public-users.interface'
import { PublicUsersUtilsService } from '../../services/public-users-utils.service'
@Component({
  selector: 'ws-public-user-card',
  templateUrl: './public-user-card.component.html',
  styleUrls: ['./public-user-card.component.scss'],
})
export class PublicUsercardComponent implements OnInit {
  @Input() userData: any = {}
  @Input() connectionData:IUserConnections= {} as IUserConnections;
  @Output()
  connectionButtonClickEmitter = new EventEmitter();
  userdata: any
  defaultUserImage = DEFAULT_IMAGE_URL
  isXSmall$ = this.valueSvc.isXSmall$
  isXSmall = false
  buttonStatus = CONNECTION_STATUS_CONNECT
  loggedInUserWid = ''
  constructor(private valueSvc: ValueService, private configSvc: ConfigurationsService, private utilSvc: PublicUsersUtilsService) {
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      this.isXSmall = isXSmall
    })
  }
  ngOnInit() {
    this.loggedInUserWid = this.configSvc.userProfile?this.configSvc.userProfile.userId:''
    console.log("button status", this.buttonStatus)
    this.buttonStatus = this.utilSvc.getButtonStatus(this.connectionData)
  }

  ngOnChanges(){
    this.buttonStatus = this.utilSvc.getButtonStatus(this.connectionData)
    console.log("button status on chanages", this.buttonStatus)
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
  acceptConnection(userData: any, connectionData: IUserConnections){
    let userDataAndConnectionbject = {
      userData,connectionData
    }
      this.connectionButtonClickEmitter.emit(JSON.stringify(userDataAndConnectionbject))
    }

  changeButtonStatus(){
    if(this.connectionData){
      console.log("connectiondata",this.connectionData)
    }
  }
  showConnectedSymbol(userData: any, connectionData: any){
    return (connectionData && (connectionData.status === CHECK_CONNECTION_STATUS_CONNECTED) &&
    (this.loggedInUserWid != userData.wid)) ? true: false
  }
  showMailIcon(userData: any, connectionData: any){
    return ( connectionData && (connectionData.status === CHECK_CONNECTION_STATUS_CONNECTED)
       && (connectionData.email) && 
       (this.loggedInUserWid != userData.wid))?
       true : false
  }
}
