import { Component, OnInit } from '@angular/core'
import { FormControl } from '@angular/forms'
// import { Router } from '@angular/router';
import { NsPage, ConfigurationsService } from '@ws-widget/utils'
import { BehaviorSubject } from 'rxjs'
// import { PublicUsersCoreService } from '../../services/public-users-core.service'
import { INFINITE_SCROLL_CONSTANTS } from './../../constants'
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
  hideGlobalSearch = false
  scrollDistance = INFINITE_SCROLL_CONSTANTS.DISTANCE
  scrollThrottle = INFINITE_SCROLL_CONSTANTS.THROTTLE
  dummyData$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
  isDataFinished$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
  counter = 0
  constructor(private readonly configSvc: ConfigurationsService, 
    // private readonly _coreSrvc: PublicUsersCoreService
    ) {
    this.pageNavbar = this.configSvc.pageNavBar
  }

  ngOnInit() {
  }

  onScroll({ currentScrollPosition }: IScrollUIEvent) {
    console.log('scroll called', currentScrollPosition)
    // add few more information
    this.updateData()
  }

  updateData(dummy = false) {
    if (dummy) {
    }
    // get more data
    if (this.counter <= 3) {
      const currentEntries = this.dummyData$.getValue()
      currentEntries.push(...[1, 2, 3, 4, 5])
      console.log('current entries now are ', currentEntries.length)
      this.dummyData$.next(currentEntries)
      this.counter += 1
    } else {
      this.isDataFinished$.next(true)
    }
  }

}
