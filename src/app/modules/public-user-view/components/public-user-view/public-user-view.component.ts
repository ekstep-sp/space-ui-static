import { Component, OnDestroy, OnInit } from '@angular/core'
import { FormControl } from '@angular/forms'
// import { Router } from '@angular/router';
import { NsPage, ConfigurationsService } from '@ws-widget/utils'
import { BehaviorSubject, of } from 'rxjs'
import { catchError, debounceTime, distinctUntilChanged, tap } from 'rxjs/operators'
import { PublicUsersCoreService } from '../../services/public-users-core.service'
import { BATCH_SIZE, DEFAULT_OFFSET, DEFAULT_PAGE_NUMBER, DEFAULT_QUERY, INFINITE_SCROLL_CONSTANTS, } from './../../constants'
import { IPublicUsersResponse, IUpdateDataObj } from './../../models/public-users.interface'
interface IScrollUIEvent {
  currentScrollPosition: number
}

@Component({
  selector: 'ws-public-user-view',
  templateUrl: './public-user-view.component.html',
  styleUrls: ['./public-user-view.component.scss'],
})
export class PublicUserViewComponent implements OnInit, OnDestroy {
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  globalSearch = new FormControl('')
  hideGlobalSearch = false
  HIT_DUMMY_ENDPOINT = true
  scrollDistance = INFINITE_SCROLL_CONSTANTS.DISTANCE
  scrollThrottle = INFINITE_SCROLL_CONSTANTS.THROTTLE
  apiData$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
  isDataFinished$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
  isApiLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true)
  counter = 0
  page = DEFAULT_PAGE_NUMBER
  offset = DEFAULT_OFFSET
  query = DEFAULT_QUERY
  error$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
  constructor(
    private readonly configSvc: ConfigurationsService,
    private readonly coreSrvc: PublicUsersCoreService
    ) {
    this.pageNavbar = this.configSvc.pageNavBar
  }

  ngOnInit() {
    // enable search functionality using search bar
    if (!this.hideGlobalSearch) {
      this.globalSearch.valueChanges.pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((searchTerm: string) => this.searchUsers(searchTerm))
    }
    // trigger first time page load
    this.searchUsers()
  }

  searchUsers(q = '') {
      this.query = q
      this.page = DEFAULT_PAGE_NUMBER
      this.offset = (this.page - 1) * BATCH_SIZE
      this.updateData({ query: this.query, searchSize: BATCH_SIZE, offset: this.offset }, this.HIT_DUMMY_ENDPOINT)
  }

  onScroll(_scrollEvent: IScrollUIEvent) {
    this.updateData({ query: this.query, searchSize: BATCH_SIZE, offset: this.offset }, this.HIT_DUMMY_ENDPOINT)
  }

  updateData({ query, offset, searchSize }: IUpdateDataObj, dummy = false) {
    this.isDataFinished$.next(false)
    this.isApiLoading$.next(true)
    this.error$.next(false)
    if (dummy) {
      // hit dummy logic
    if (this.counter <= 3) {
      const currentEntries = this.apiData$.getValue()
      currentEntries.push(...[1, 2, 3, 4, 5])
      this.apiData$.next(currentEntries)
      this.counter += 1
      this.page += 1
    } else {
      this.isDataFinished$.next(true)
    }
    this.isApiLoading$.next(false)
    } else {
      // hit original api
      this.coreSrvc.getApiData(query, offset, searchSize)
      .pipe(
        catchError((_e: any) => of(null)),
        tap((data: IPublicUsersResponse | null) => {
          this.isApiLoading$.next(false)
          if (data) {
            this.error$.next(false)
            if (data.DATA.length) {
              // merge with old data
              const currentData = this.apiData$.getValue()
              this.apiData$.next([...currentData, ...data.DATA])
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
  }

  ngOnDestroy() {
    this.apiData$.unsubscribe()
    this.isApiLoading$.unsubscribe()
    this.error$.unsubscribe()
  }

}
