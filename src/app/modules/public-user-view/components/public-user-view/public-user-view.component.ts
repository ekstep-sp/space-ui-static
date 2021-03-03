import { Component, OnInit } from '@angular/core'
import { FormControl } from '@angular/forms'
// import { Router } from '@angular/router';
import { NsPage, ConfigurationsService, ValueService } from '@ws-widget/utils'
import { BehaviorSubject, Observable, of } from 'rxjs'
import { catchError, debounceTime, distinctUntilChanged, filter, map, tap } from 'rxjs/operators'
import { PublicUsersCoreService } from '../../services/public-users-core.service'
import { BATCH_SIZE, DEFAULT_OFFSET, DEFAULT_PAGE_NUMBER, DEFAULT_QUERY, INFINITE_SCROLL_CONSTANTS, CONNECTION_STATUS_PENDING } from './../../constants'
import { IPublicUsers, IPublicUsersResponse, IRawUserProperties, IUpdateDataObj } from './../../models/public-users.interface'
import { PublicUsersUtilsService } from '../../services/public-users-utils.service'
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
  constructor(
    private readonly configSvc: ConfigurationsService,
    private readonly coreSrvc: PublicUsersCoreService,
    private readonly utilSvc: PublicUsersUtilsService,
    private valueSvc: ValueService,
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
             this.getConnectionsListResponse()
        })
    }
    // trigger first time page load
    this.searchUsers()
    this.getConnectionsListResponse()
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
  getConnectionsListResponse() {
      const loggedInUserWid = this.configSvc.userProfile?this.configSvc.userProfile.userId : '';
      let userMap  = new Map();
      this.utilSvc.getConnectionsList(loggedInUserWid).pipe(
        catchError((_e:any)=> of(null)),
        map(response=>{
          if(response){
            //filtering the reponse to get the connections of loggedin user
            response = response.filter((eachresponse)=> eachresponse.requested_by === loggedInUserWid)
            response.forEach(eachConnection=>{
            userMap.set(eachConnection.user_id, eachConnection)
            })
            this.userConnectionsList$.next(userMap)
          }
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
    //if the connection data is present
    //check the status
    //asssign the vaue to upfdate the status to service

    this.utilSvc.buttonStatus$.next(CONNECTION_STATUS_PENDING)
  }
}
