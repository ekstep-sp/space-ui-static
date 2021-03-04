import { Component, OnInit } from '@angular/core'
import { FormControl } from '@angular/forms'
import { NsPage, ConfigurationsService, ValueService } from '@ws-widget/utils'
import { BehaviorSubject, Observable, of } from 'rxjs'
import { catchError, debounceTime, distinctUntilChanged, filter, map, tap } from 'rxjs/operators'
import { PublicUsersCoreService } from '../../services/public-users-core.service'
import { BATCH_SIZE, DEFAULT_OFFSET, DEFAULT_PAGE_NUMBER, DEFAULT_QUERY, INFINITE_SCROLL_CONSTANTS, CHECK_CONNECTION_STATUS_CONNECTED, CHECK_CONNECTION_STATUS_PENDING} from './../../constants'
import { IPublicUsers, IPublicUsersResponse, IRawUserProperties, IUpdateDataObj } from './../../models/public-users.interface'
import { PublicUsersUtilsService } from '../../services/public-users-utils.service'
import { PublicUserDialogComponent } from '../public-user-dialog/public-user-dialog.component'
import { MatDialog } from '@angular/material'
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
  userConnectionsList$:BehaviorSubject<any> = new BehaviorSubject< any>(null)
  dummyCheck = true
  constructor(
    private readonly configSvc: ConfigurationsService,
    private readonly coreSrvc: PublicUsersCoreService,
    private readonly utilSvc: PublicUsersUtilsService,
    private valueSvc: ValueService,
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
             this.getUserConnections()
        })
    }
    // trigger first time page load
    this.searchUsers()
    this.getUserConnections()
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
    //this will send wid of logged in user and get list of connections as response
  getUserConnections(requested_to = '', isDummyDelete = false) {
      const loggedInUserWid = this.configSvc.userProfile?this.configSvc.userProfile.userId : '';
      let userMap  = new Map();
      this.utilSvc.getConnectionsList(loggedInUserWid).pipe(
        catchError((_e:any)=> of(null)),
        tap(response=>{
          if(response){
            //filtering the reponse to get the connections of loggedin user
            response = response.filter((eachresponse)=> eachresponse.requested_by === loggedInUserWid)
            response.forEach(eachConnection=>{
            userMap.set(eachConnection.user_id, eachConnection)
            })
          }
        }),
        tap((_d:any)=>{
          if(this.dummyCheck){
            userMap.set(requested_to, 
              {
                id: requested_to , created_on:'2/03/2021', last_updated_on:'2/03/2021', status:'Pending', requested_by:'acbf4053-c126-4e85-a0bf-252a896535ea', email: 'anjitha.r98@gmail.com', user_id: requested_to ,fname:'Aakash',lname:'Vishwakarma',root_org:'space',org:'Sustainable Environment and Ecological Development Society'
              } )
              this.userConnectionsList$.next(userMap)
          }
        }),
        tap((_d:any)=>{
          if(isDummyDelete){
                userMap.delete(requested_to)
          }
          this.userConnectionsList$.next(userMap)
        })
      ).subscribe()

  }

  getConnectionDetailsForCurrentUser(userData: any){
    if(this.userConnectionsList$.getValue()){
      return this.getConnectionObjectIfExists(this.userConnectionsList$.getValue(), userData);
    }
    }

    getConnectionObjectIfExists(userConnectionsMap: any,userData:any){
    if(userConnectionsMap.has(userData.wid)){
     return userConnectionsMap.get(userData.wid)
    }
  }

  getSelectedUserConnectionData(userConnectionData: any){
    let userDataAndConnectionObject = JSON.parse(userConnectionData)
    console.log("event", userDataAndConnectionObject)
    //if connectionData, means user is already connected
    //if user is connected, button status wil be withdraw, connection status wil be connected
    //if the connection status is connected, and user wish to withdraw the connection, call delete api

    if(userDataAndConnectionObject.connectionData && userDataAndConnectionObject.connectionData.status === CHECK_CONNECTION_STATUS_CONNECTED){
      this.openDialogBoxForConfirmation(userDataAndConnectionObject.userData, userDataAndConnectionObject.connectionData, false ,  "revoke")
    }
    else if(userDataAndConnectionObject.connectionData && userDataAndConnectionObject.connectionData.status === CHECK_CONNECTION_STATUS_PENDING){
      this.openDialogBoxForConfirmation(userDataAndConnectionObject.userData, userDataAndConnectionObject.connectionData, false ,  "pending")
    }
    //user is requesting for new user to get connection
    else if(userDataAndConnectionObject.userData && !userDataAndConnectionObject.connectionData){
      this.openDialogBoxForConfirmation(userDataAndConnectionObject.userData, userDataAndConnectionObject.connectionData, true, "confirm" , userDataAndConnectionObject.userData.first_name )
    }
  }

  trackUserData(_index:any, data: any){
    return data.wid
  }

  openDialogBoxForConfirmation(userData: any, connectionData: any, isNewUserConnection: boolean, confirmOrWidthdraw: string, firstName:String = ''){
    const dialogRefForPublicUser = this.dialog.open(PublicUserDialogComponent, 
     { width:'500px',
      data:{
        connectionObject : connectionData,
        userData: userData,
        isNewUserConnection,
        confirmOrWidthdraw,
        targetUser: firstName
        
      }})
      dialogRefForPublicUser.afterClosed().subscribe(result =>{
        if(result.confirmOrWidthdraw === 'confirm'){
        this.sendRequestConnection(userData.wid)
        }
        if(result.confirmOrWidthdraw === 'pending'){
          this.revokeConnection(connectionData.id)
       }
       if(result.confirmOrWidthdraw === 'revoke'){
        this.revokeConnection(connectionData.id)
     }
      })
  }

  sendRequestConnection(requestedUserWid:string){
    return  this.utilSvc.sendRequest(requestedUserWid).pipe(
        catchError((_e:any)=> of(null)),
        map((response: any)=>{
          if(response.ok && response.data.request_id ){
         this.getUserConnections(requestedUserWid)
         this.apiData$.next(this.apiData$.getValue())
          }
        })
      ).subscribe()
  }

  revokeConnection(connectionId: string){
    return  this.utilSvc.revokeRequest(connectionId).pipe(
        catchError((_e:any)=> of(null)),
        map((response: any)=>{
           if(response.ok){
             console.log("revoke",response )
            this.getUserConnections(connectionId, true)
            this.apiData$.next(this.apiData$.getValue())
           }
        })
      ).subscribe()
  }
}
