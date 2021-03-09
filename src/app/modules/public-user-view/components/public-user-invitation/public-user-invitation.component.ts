import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { ConfigurationsService, NsPage } from '@ws-widget/utils/src/public-api'
// import { PublicUsersUtilsService } from '../../services/public-users-utils.service'
import { BehaviorSubject, of } from 'rxjs'
import { catchError, filter, finalize, map, tap } from 'rxjs/operators'
import { PublicUsersUtilsService } from '../../services/public-users-utils.service'

@Component({
  selector: 'ws-public-user-invitation',
  templateUrl: './public-user-invitation.component.html',
  styleUrls: ['./public-user-invitation.component.scss'],
})
export class PublicUserInvitationComponent implements OnInit {

  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true)
  isApiError$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true)
  notifyUser = false
  notificationDetails: any = null
  constructor(
    private readonly configSvc: ConfigurationsService,
    // private readonly _utilSvc: PublicUsersUtilsService,
    private readonly _utilSvc: PublicUsersUtilsService,
    private readonly activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    // tslint:disable-next-line: max-line-length
    this.activatedRoute.params.pipe(
      filter((params: any) => params.requestId),
      map((params: any) => {
        return {
          actionType: this.activatedRoute.snapshot.queryParamMap.get('actionType'),
          requestId: params.requestId,
        }
      })
      ).subscribe(this.triggerAction.bind(this))
  }

  triggerAction({ requestId, actionType }: any) {
    this.isLoading$.next(true)
    this.isApiError$.next(false)
    this._utilSvc.sendInvitationAction(requestId, actionType).pipe(
      map((response: any) => response.status),
      tap((data: any) => {
        if (data) {
            // request suceeded, notify the users
            this.notifyUser = true
            this.notificationDetails = { sourceActionType: actionType }
        } else {
          // an error occured
          this.isApiError$.next(true)
          this.notifyUser = false
          this.notificationDetails = null
        }
      }),
      catchError(_e => {
        this.isApiError$.next(true)
        return of(null)
      }),
      finalize(() => {
        this.isLoading$.next(false)
      })
    ).subscribe()
  }

}
