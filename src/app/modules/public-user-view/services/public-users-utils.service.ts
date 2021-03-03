import { Injectable } from '@angular/core'
import { ConfigurationsService } from '@ws-widget/utils/src/public-api';
import { of } from 'rxjs';
import { catchError, map, delay } from 'rxjs/operators';
import { IActionUpdate } from '../models/public-users.interface';
import { PublicUsersCoreService } from './public-users-core.service';
@Injectable({
  providedIn: 'root',
})
export class PublicUsersUtilsService {
  isDummy = true
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
}
