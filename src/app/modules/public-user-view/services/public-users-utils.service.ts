import { Injectable } from '@angular/core'
import { IActionUpdate, IRequestUpdate, IRevokeConnection } from '../models/public-users.interface'
import { DUMMY_RESPONSE, CONNECTION_STATUS_CONNECT, CHECK_CONNECTION_STATUS_CONNECTED, CONNECTION_STATUS_REJECTED, CHECK_CONNECTION_STATUS_REJECTED, CHECK_CONNECTION_STATUS_PENDING, CONNECTION_STATUS_PENDING } from './../constants'
import { of } from 'rxjs'
import { PublicUsersCoreService } from './public-users-core.service'

import { ConfigurationsService } from '@ws-widget/utils/src/public-api'
import { catchError, map, delay } from 'rxjs/operators'
@Injectable({
  providedIn: 'root',
})
export class PublicUsersUtilsService {
  isDummy = true
  dummyResConnectionList = true
  isDummySendrequest = true
  constructor(
    private readonly coreSrvc: PublicUsersCoreService,
    private readonly configSvc: ConfigurationsService,
  ) { }

  sendAction(requestId: string, actionType: string) {
    const currentWID = this.configSvc.userProfile ? this.configSvc.userProfile.userId : ''
    if (this.isDummy) {
      return of({ status: 200, ok: true }).pipe(delay(2000))
    }
    const actionBody: IActionUpdate = {
      actionType,
      requestId,
      wid: currentWID,
    }
    return this.coreSrvc.postInvitationAction(actionBody).pipe(
      catchError(_e => of(null)),
      map(data => data),
      catchError(_e => of(null)),
      delay(2000)
    )
  }
  getConnectionsList(wid: string) {
    if (this.dummyResConnectionList) {
      return of({ status: 200, ok: true, data: DUMMY_RESPONSE })
    }
    const requestParams = {
      wid,
    }
    return this.coreSrvc.getConnectionAPIResponse(requestParams)
  }
  getButtonDisplayStatus(connectionObject: any) {
    if (connectionObject && connectionObject.status === CHECK_CONNECTION_STATUS_CONNECTED) {
      return CONNECTION_STATUS_REJECTED
    }
    if (connectionObject && connectionObject.status === CHECK_CONNECTION_STATUS_REJECTED) {
      return CONNECTION_STATUS_CONNECT
    }
    if (connectionObject && connectionObject.status === CHECK_CONNECTION_STATUS_PENDING) {
      return CONNECTION_STATUS_PENDING
    }
    return CONNECTION_STATUS_CONNECT
  }

  sendRequest(requestedUserWid: string) {
    const currentWID = this.configSvc.userProfile ? this.configSvc.userProfile.userId : ''
    if (this.isDummySendrequest) {
      return of({
        status: 204, ok: true,
        data: {
          request_id: '1234',
        },
      })
    }
    const requestBody: IRequestUpdate = {
      requested_by: currentWID,
      requested_to: requestedUserWid,

    }
    return this.coreSrvc.sendRequestApi(requestBody).pipe(
      catchError(_e => of(null)),
      map(data => data),
      catchError(_e => of(null)),
      delay(2000)
    )
  }

  revokeRequest(connectionId: string) {
    if (this.isDummySendrequest) {
      return of({ status: 204, ok: true })
    }
    const requestBody: IRevokeConnection = {
      connectionId,
    }
    return this.coreSrvc.revokeConnectionAPi(requestBody).pipe(
      catchError(_e => of(null)),
      map(data => data))
  }
}
