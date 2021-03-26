import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { ConfigurationsService, NsPage } from '@ws-widget/utils/src/public-api'
// import { PublicUsersUtilsService } from '../../services/public-users-utils.service'
import { BehaviorSubject, of } from 'rxjs'
import { catchError, filter, finalize, map, tap } from 'rxjs/operators'
import { ALLOWED_INVITATION_STATES } from '../../constants'
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
    private readonly activatedRoute: ActivatedRoute,
    private router: Router,
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
      }),
      // it will map words with proper case, like acTion will become Action
      map((invitationObj: {actionType: string | null, requestId: string}) => {
        let finalActionType = invitationObj.actionType ? invitationObj.actionType.toLowerCase() : ''
        if (finalActionType && ALLOWED_INVITATION_STATES.includes(finalActionType)) {
          finalActionType = finalActionType.substr(0, 1).toUpperCase() + finalActionType.substr(1)
        }
        return {
          ...invitationObj,
          actionType : finalActionType,
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
          throw new Error('non matching data recieved from endpoint, verify manually')
        }
      }),
      catchError(_e => {
        this.isApiError$.next(true)
        this.notifyUser = false
        this.notificationDetails = null
        return of(null)
      }),
      finalize(() => {
        this.isLoading$.next(false)
      })
    ).subscribe()
  }

  goToUserPage () {
    this.router.navigate(
      ['/app/users/list'],
      { queryParams: { search_query: this.activatedRoute.snapshot.queryParamMap.get('actionType') === 'Reject'
                        ? ''
                        : this.activatedRoute.snapshot.queryParamMap.get('search_query') || '',
                      },
      }
    )
  }
}
