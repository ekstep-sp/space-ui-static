import { Component, OnInit } from '@angular/core'
import { FormControl } from '@angular/forms'
import { NsPage, ConfigurationsService, ValueService } from '@ws-widget/utils'
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs'
import { catchError, debounceTime, distinctUntilChanged, filter, map, tap } from 'rxjs/operators'
import { PublicUsersCoreService } from '../../services/public-users-core.service'
import {
  BATCH_SIZE, DEFAULT_OFFSET, DEFAULT_PAGE_NUMBER,
   DEFAULT_QUERY, INFINITE_SCROLL_CONSTANTS, CHECK_CONNECTION_STATUS_CONNECTED,
    CHECK_CONNECTION_STATUS_PENDING, CHECK_CONNECTION_STATUS_REJECTED, FAILED_CONNECTION_REQUEST_MSG,
  FAILED_REVOKE_PENDING_REQUEST_MSG, FAILED_USERS_CONNECTION_REQUEST_MSG,
  DAILOG_CONFIRMATION_WIDTH, CONNECTION_STATUS_REJECTED,
  CONNECTION_STATUS_PENDING, CONNECTION_STATUS_CONNECT,
} from './../../constants'
import { IPublicUsers, IPublicUsersResponse, IRawUserProperties, IUpdateDataObj } from './../../models/public-users.interface'
import { PublicUsersUtilsService } from '../../services/public-users-utils.service'
import { PublicUserDialogComponent } from '../public-user-dialog/public-user-dialog.component'
import { MatDialog } from '@angular/material'
import { MatSnackBar } from '@angular/material/snack-bar'
interface IScrollUIEvent {
  currentScrollPosition: number
}

@Component({
  selector: 'ws-public-user-view',
  templateUrl: './public-user-view.component.html',
  styleUrls: ['./public-user-view.component.scss'],
})
export class PublicUserViewComponent implements OnInit {
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  globalSearch = new FormControl('')
  isLoad = false
  userproperties: any
  hideGlobalSearch = false
  isXSmall$: Observable<boolean>
  isEnabledSearch = false

  scrollDistance = INFINITE_SCROLL_CONSTANTS.DISTANCE
  scrollThrottle = INFINITE_SCROLL_CONSTANTS.THROTTLE
  // apiData$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
  apiData$: BehaviorSubject<IPublicUsers[] | []> = new BehaviorSubject<IPublicUsers[] | []>([])
  isDataFinished$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
  noDataFound$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
  isApiLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true)
  counter = 0
  page = DEFAULT_PAGE_NUMBER
  offset = DEFAULT_OFFSET
  query = DEFAULT_QUERY
  DEFAULT_DEBOUNCE = 1000
  DEFAULT_MIN_LENGTH_TO_ACTIVATE_SEARCH = 3
  error$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
  connectionListError$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
  userConnectionsList$: BehaviorSubject<any> = new BehaviorSubject<any>(new Map())
  apiSub$: Subscription | null = null
  dummyCheck = true
  constructor(
    private readonly configSvc: ConfigurationsService,
    private readonly coreSrvc: PublicUsersCoreService,
    private readonly utilSvc: PublicUsersUtilsService,
    private valueSvc: ValueService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {
    this.pageNavbar = this.configSvc.pageNavBar
    this.isXSmall$ = this.valueSvc.isXSmall$
  }
  ngOnInit() {
    // enable search functionality using search bar
    if (!this.hideGlobalSearch) {
      // tslint:disable-next-line: max-line-length
      this.globalSearch.valueChanges.pipe(
        filter((vals: string) => (vals.trim().length === 0 || vals.trim().length >= this.DEFAULT_MIN_LENGTH_TO_ACTIVATE_SEARCH)),
        debounceTime(this.DEFAULT_DEBOUNCE),
        distinctUntilChanged()
      ).subscribe((searchTerm: string) => {
        this.searchUsers(searchTerm)
        this.getUserConnections().subscribe()
      })
    }
    // trigger first time page load
    this.searchUsers()
    this.getUserConnections().subscribe()
  }
  searchUsers(q = '') {

    this.query = q
    this.page = DEFAULT_PAGE_NUMBER
    this.offset = (this.page ? this.page - 1 : 0) * BATCH_SIZE
    // everytime search hits, we have to reset the existing container list
    this.apiData$.next([])
    this.updateData({ query: this.query, searchSize: BATCH_SIZE, offset: this.offset })
  }

  onScroll(_scrollEvent: IScrollUIEvent) {
    this.nextPage()
    this.updateData({ query: this.query, searchSize: BATCH_SIZE, offset: this.offset })
  }

  nextPage() {
    this.page += 1
    this.offset = ((this.page - 1) * BATCH_SIZE)
  }

  updateData({ query, offset, searchSize }: IUpdateDataObj) {

    this.noDataFound$.next(false)
    this.isDataFinished$.next(false)
    this.isApiLoading$.next(true)
    this.error$.next(false)
    // hit original api
    this.coreSrvc.getApiData(query, offset, searchSize)
      .pipe(
        catchError((_e: any) => of(null)),
        map((rawData: IPublicUsersResponse | null) => {

          if (rawData) {
            const formattedData = rawData.DATA.map((dataObj: IPublicUsers) => ({
              ...dataObj,
              source_profile_picture: this.coreSrvc.getSanitisedProfileUrl(dataObj.source_profile_picture),
              // tslint:disable-next-line: max-line-length
              user_properties: this.coreSrvc.extractUserProperties(dataObj.user_properties as IRawUserProperties),
            }))
            return {
              ...rawData,
              DATA: formattedData,
            }
          }
          return rawData
        }),
        catchError((_e: any) => of(null)),
        tap((data: IPublicUsersResponse | null) => {
          this.isApiLoading$.next(false)
          if (data) {
            this.error$.next(false)
            if (data.DATA.length) {
              // merge with old data
              const currentData = this.apiData$.getValue()
              this.apiData$.next([...currentData, ...data.DATA])
            } else if (!data.DATA.length && this.page === DEFAULT_PAGE_NUMBER) {
              // did not get any results matching the search query
              this.noDataFound$.next(true)
            } else {
              // data empty
              this.isDataFinished$.next(true)
            }
          } else {
            this.error$.next(true)
          }
        })
      ).subscribe()
  }

  showSearchBar() {
    this.isEnabledSearch = true
  }

  disableSearchbar() {
    this.isEnabledSearch = false
  }
  // this will send wid of logged in user and get list of connections as response
  getUserConnections(requestedto = '', isDummyDelete = false) {
    const loggedInUserWid = this.configSvc.userProfile ? this.configSvc.userProfile.userId : ''
    const possibleConnectionMap = new Map()
    this.connectionListError$.next(false)
    return this.utilSvc.getConnectionsList(loggedInUserWid)
      .pipe(
        catchError((_e: any) => {
          this.connectionListError$.next(true)
          return of(null)
        }),
        tap((response: any) => {
          if (response && response.ok && response.data) {
            // filtering the reponse to get the connections of loggedin user
            response.data.forEach((eachresponse: { user_id: string, requested_by: string, status: string }) => {
              if ((eachresponse.status === CHECK_CONNECTION_STATUS_CONNECTED) || (eachresponse.requested_by === loggedInUserWid)) {
                possibleConnectionMap.set(eachresponse.user_id, eachresponse)
              }
            })
          } else {
            this.snackBar.open(FAILED_USERS_CONNECTION_REQUEST_MSG, '', { duration: 3000 })
          }
          // will be empty if there is empty conenciton or error
          this.userConnectionsList$.next(possibleConnectionMap)
        }),
        tap((_d: any) => {
          if (this.dummyCheck) {
            possibleConnectionMap.set(requestedto, {
              id: requestedto,
              created_on: '2/03/2021',
               last_updated_on: '2/03/2021',
                status: 'Pending',
                 requested_by: 'acbf4053-c126-4e85-a0bf-252a896535ea',
                  email: 'anjitha.r98@gmail.com',
                   user_id: requestedto,
                    fname: 'Aakash',
                     lname: 'Vishwakarma',
                      root_org: 'space',
                       org: 'Sustainable Environment and Ecological Development Society',
            })
            this.userConnectionsList$.next(possibleConnectionMap)
          }
        }),
        tap((_d: any) => {
          if (isDummyDelete) {
            possibleConnectionMap.delete(requestedto)
          }
          this.userConnectionsList$.next(possibleConnectionMap)
        }),
        catchError((_err: any) => {
          this.connectionListError$.next(true)
          return of(null)
        })
      )
  }

  getConnectionDetailsForCurrentUser(userData: any) {
    if (!this.connectionListError$.getValue()) {
      return this.getConnectionObjectIfExists(userData)
    }
    return null
  }

  getConnectionObjectIfExists(userData: any) {
    const existingConnectionsData = this.userConnectionsList$.getValue()
    if (existingConnectionsData.has(userData.wid)) {
      return existingConnectionsData.get(userData.wid)
    }
    return null
  }

  performConnection(userConnectionData: any) {
    if (userConnectionData.connectionData && userConnectionData.connectionData.status === CHECK_CONNECTION_STATUS_CONNECTED) {
      // tslint:disable-next-line: max-line-length
      this.openDialogBoxForConfirmation(userConnectionData.userData, userConnectionData.connectionData, CONNECTION_STATUS_REJECTED, userConnectionData.userData.first_name)
    } else if (userConnectionData.connectionData && userConnectionData.connectionData.status === CHECK_CONNECTION_STATUS_PENDING) {
      this.openDialogBoxForConfirmation(userConnectionData.userData, userConnectionData.connectionData, CONNECTION_STATUS_PENDING)
    } else if (userConnectionData.connectionData && userConnectionData.connectionData.status === CHECK_CONNECTION_STATUS_REJECTED) {
      // tslint:disable-next-line: max-line-length
      this.openDialogBoxForConfirmation(userConnectionData.userData, userConnectionData.connectionData, CONNECTION_STATUS_CONNECT, userConnectionData.userData.first_name)
    } else {
      // tslint:disable-next-line: max-line-length
      this.openDialogBoxForConfirmation(userConnectionData.userData, userConnectionData.connectionData, CONNECTION_STATUS_CONNECT, userConnectionData.userData.first_name)
    }
  }

  trackUserData(_index: any, data: any) {
    return data.wid
  }

  openDialogBoxForConfirmation(
    userData: any, connectionData: any, actionType: string,
    firstName: String = ''
  ) {
    const dialogRefForPublicUser = this.dialog.open(PublicUserDialogComponent, {
      width: DAILOG_CONFIRMATION_WIDTH,
      data: {
        actionType,
        targetUser: firstName,
      },
    })
    dialogRefForPublicUser.afterClosed().pipe(filter(result => result)).subscribe(result => {
      if (result.actionType === CONNECTION_STATUS_CONNECT) {
        this.sendConnectionRequest(userData.wid)
      }
      if (result.actionType === CONNECTION_STATUS_PENDING) {
        this.revokeConnection(connectionData.id)
      }
      if (result.actionType === CONNECTION_STATUS_REJECTED) {
        this.revokeConnection(connectionData.id)
      }
    })
  }

  sendConnectionRequest(requestedUserWid: string) {
    this.utilSvc.sendRequest(requestedUserWid).pipe(
      catchError((_e: any) => of({ ok: true, request_id: 'someid' })),
      map((response: any) => {
        if (response && response.ok && response.data.request_id) {
          this.refreshData(requestedUserWid)
        } else {
          this.snackBar.open(FAILED_CONNECTION_REQUEST_MSG, '',
                             { duration: 3000 })
        }
      })
    ).subscribe()
  }

  refreshData(requestedUserWid: string, dummyLogic = false) {
    if (this.apiSub$) {
      this.apiSub$.unsubscribe()
    }
    this.apiSub$ = this.getUserConnections(requestedUserWid, dummyLogic).subscribe(() => {
      this.apiData$.next(this.apiData$.getValue())
    })
  }

  revokeConnection(connectionId: string) {
    return this.utilSvc.revokeRequest(connectionId).pipe(
      catchError((_e: any) => of(null)),
      map((response: any) => {
        if (response && response.ok) {
          this.refreshData(connectionId, true)
        } else {
          this.snackBar.open(FAILED_REVOKE_PENDING_REQUEST_MSG, '',
                             { duration: 3000 })
        }
      })
    ).subscribe()
  }
}
