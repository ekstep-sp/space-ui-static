import { Injectable } from '@angular/core'
import { IRequestUpdate, IRevokeConnection } from '../models/public-users.interface'
import { CONNECTION_STATUS_CONNECT, CHECK_CONNECTION_STATUS_CONNECTED, CONNECTION_STATUS_WITHDRAW, CHECK_CONNECTION_STATUS_REJECTED, CHECK_CONNECTION_STATUS_PENDING, CONNECTION_STATUS_PENDING } from './../constants'
import { of } from 'rxjs'
import { PublicUsersCoreService } from './public-users-core.service'

import { ConfigurationsService } from '@ws-widget/utils/src/public-api'
import { catchError } from 'rxjs/operators'
@Injectable({
  providedIn: 'root',
})
export class PublicUsersUtilsService {

  constructor(
    private readonly coreSrvc: PublicUsersCoreService,
    private readonly configSvc: ConfigurationsService,
  ) { }

  sendInvitationAction(requestId: string, actionType: string) {
    return this.coreSrvc.sendInvitationAction(requestId, actionType).pipe(
      catchError(_e => of(null)),
    )
  }
  getConnectionsList() {
    return this.coreSrvc.getConnectionAPIResponse()
  }
  getButtonDisplayStatus(connectionObject: any) {
    if (connectionObject && connectionObject.status === CHECK_CONNECTION_STATUS_CONNECTED) {
      return CONNECTION_STATUS_WITHDRAW
    }
    if (connectionObject && connectionObject.status === CHECK_CONNECTION_STATUS_REJECTED) {
      return CONNECTION_STATUS_CONNECT
    }
    if (connectionObject && connectionObject.status === CHECK_CONNECTION_STATUS_PENDING) {
      return CONNECTION_STATUS_PENDING
    }
    return CONNECTION_STATUS_CONNECT
  }

  sendRequest(requestedUserWid: string, userCommentForConnection: string) {
    const currentWID = this.configSvc.userProfile ? this.configSvc.userProfile.userId : ''
    const requestBody: IRequestUpdate = {
      requested_by: currentWID,
      requested_to: requestedUserWid,
    }
    if (userCommentForConnection) {
      requestBody['comment'] = userCommentForConnection
    }
    return this.coreSrvc.sendRequestApi(requestBody).pipe(catchError(_e => of(null)))
  }

  revokeRequest(connectionId: string) {
    const requestBody: IRevokeConnection = {
      request_id: connectionId,
    }
    return this.coreSrvc.revokeConnectionAPi(requestBody).pipe(
      catchError(_e => of(null)))
  }
}
