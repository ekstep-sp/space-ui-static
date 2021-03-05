import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core'
import { DEFAULT_IMAGE_URL, CONNECTION_STATUS_CONNECT, CHECK_CONNECTION_STATUS_CONNECTED, ALLOW_WITHDRAW_STATUS, CHECK_CONNECTION_STATUS_PENDING, CHECK_CONNECTION_STATUS_REJECTED } from '../../constants'
import { ValueService, ConfigurationsService } from '@ws-widget/utils'
import { IUserConnections } from './../../models/public-users.interface'
import { PublicUsersUtilsService } from '../../services/public-users-utils.service'
@Component({
  selector: 'ws-public-user-card',
  templateUrl: './public-user-card.component.html',
  styleUrls: ['./public-user-card.component.scss'],
})
export class PublicUsercardComponent implements OnInit, OnChanges {
  @Input() userData: any = {}
  @Input() connectionData: IUserConnections | null = null
  @Input() resultsOK = false
  @Output() connectionButtonClickEmitter = new EventEmitter<any>(undefined)
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
    this.loggedInUserWid = this.configSvc.userProfile ? this.configSvc.userProfile.userId : ''
  }

  ngOnChanges() {
    this.buttonStatus = this.utilSvc.getButtonDisplayStatus(this.connectionData)
    console.log('touching changes ', this.buttonStatus)
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
      this.connectionButtonClickEmitter.emit({ userData, connectionData })
    }

    isConnected(userData: any, connectionData: any, currentWID: string, connectionStatus: string) {
      if (currentWID !== userData.wid) {
        return (connectionData && (connectionData.status === connectionStatus ))
      }
      return false
    }
    showConnectedUserIcon(userData: any, connectionData: any){
    return this.isConnected(userData, connectionData, this.loggedInUserWid, CHECK_CONNECTION_STATUS_CONNECTED)
  }

  showMailIcon(userData: any, connectionData: any){
    return this.isConnected(userData, connectionData, this.loggedInUserWid, CHECK_CONNECTION_STATUS_CONNECTED) && connectionData.email
  }

  hideButtonStatus(userData: any, connectionData: any) {
    if (this.loggedInUserWid === userData.wid) {
      return true
     }
    if (!this.connectionData) {
      return false
    }
    if (ALLOW_WITHDRAW_STATUS && this.isConnected(userData, connectionData, this.loggedInUserWid, CHECK_CONNECTION_STATUS_CONNECTED)) {
      return false
    }
    if(this.isConnected(userData, connectionData, this.loggedInUserWid, CHECK_CONNECTION_STATUS_PENDING) || 
    this.isConnected(userData, connectionData, this.loggedInUserWid, CHECK_CONNECTION_STATUS_REJECTED)){
       return false
    }
   return true
  }
}