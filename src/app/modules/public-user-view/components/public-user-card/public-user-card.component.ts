import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { DEFAULT_IMAGE_URL, CONNECTION_STATUS_CONNECT, CHECK_CONNECTION_STATUS_CONNECTED, ALLOW_WITHDRAW_STATUS } from '../../constants'
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
  isLoadingConnection = false
  constructor(private valueSvc: ValueService, private configSvc: ConfigurationsService, private utilSvc: PublicUsersUtilsService) {
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      this.isXSmall = isXSmall
    })
  }
  ngOnInit() {
    this.loggedInUserWid = this.configSvc.userProfile?this.configSvc.userProfile.userId:''
    this.buttonStatus = this.utilSvc.getButtonStatus(this.connectionData)
  }

  ngOnChanges(){
    this.buttonStatus = this.utilSvc.getButtonStatus(this.connectionData)
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
  showConnectedUser(userData: any, connectionData: any){
    return (connectionData && (connectionData.status === CHECK_CONNECTION_STATUS_CONNECTED) &&
    (this.loggedInUserWid != userData.wid)) ? true: false
  }

  showMailIcon(userData: any, connectionData: any){
    return ( connectionData && (connectionData.status === CHECK_CONNECTION_STATUS_CONNECTED)
       && (connectionData.email) && 
       (this.loggedInUserWid != userData.wid))?
       true : false
  }
  hideButtonStatus(userData: any, connectionData: any){
    console.log("ths.connection",this.connectionData )
    if(!this.connectionData){
      return true
    }
    if(!ALLOW_WITHDRAW_STATUS && (this.loggedInUserWid != userData.wid) && connectionData.status === CHECK_CONNECTION_STATUS_CONNECTED){
      return false
    }
    if((this.loggedInUserWid != userData.wid)){
      return false
     }
   return true
  }
}

