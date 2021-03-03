import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { DEFAULT_IMAGE_URL, CONNECTION_STATUS_CONNECT } from '../../constants'
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
    // if(this.connectionData.status === DEFAULT_CONNECTION_STATUS){
    //   this.buttonStatus = "Revoke"
    // }
    // else if(this.connectionData.status === "pending"){
    //   this.buttonStatus = "Pending"
    // }
    // else if(this.connectionData.status === "rejected"){
    //   this.buttonStatus = "Connect"
    // }
    console.log("getvaleu",this.utilSvc.buttonStatus$ )
    if(this.utilSvc.buttonStatus$) {
     this.utilSvc.updateButtonStatus()
    }
  }

  ngOnChanges(){

    console.log("getonchange" )

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
    //todo:make buttonstatus as behaviour subject
    //call api 
    // if(this.buttonStatus === "Pending"){
    //   this.buttonStatus = "Revoke"
    // }
    // else{
    //   this.buttonStatus = "Pending"
    // }

  changeButtonStatus(){
    if(this.connectionData){
      console.log("connectiondata",this.connectionData)
    }
  }
}
