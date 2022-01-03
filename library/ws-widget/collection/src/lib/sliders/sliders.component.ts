import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { ICarousel } from './sliders.model'
import { Subscription, interval } from 'rxjs'
import { EventService } from '../../../../utils/src/public-api'
import { MatDialog, MatDialogConfig } from '@angular/material/dialog'
@Component({
  selector: 'ws-widget-sliders',
  templateUrl: './sliders.component.html',
  styleUrls: ['./sliders.component.scss'],
})
export class SlidersComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<ICarousel[]>, AfterViewInit {
  @Input() widgetData!: ICarousel[]

  currentIndex = 0
  slideInterval: Subscription | null = null
  @ViewChild('welcomeModal', { static: false }) welcomeModal: any
  isFirstVisit = true
  isExploring = true
  isLearning = true
  isDesigning = true

  constructor(private events: EventService,
              public dialog: MatDialog) {
    super()
  }

  ngOnInit() {
    this.checkCookies()
    this.reInitiateSlideInterval()
  }

  ngAfterViewInit() {
    if (this.isFirstVisit) {
      setTimeout(() => {
        this.open({ width: '100vw', panelClass: 'welcome-modal', hasBackdrop: true })
      },         5000)
      this.setCookie('isFirstVisit', false, 3650)
    }
  }
  reInitiateSlideInterval() {
    if (this.widgetData.length > 1) {
      try {
        if (this.slideInterval) {
          this.slideInterval.unsubscribe()
        }
      } catch (e) {
      } finally {
        this.slideInterval = interval(8000).subscribe(() => {
          if (this.currentIndex === this.widgetData.length - 1) {
            this.currentIndex = 0
          } else {
            this.currentIndex += 1
          }
        })
      }
    }
  }
  slideTo(index: number) {
    if (index >= 0 && index < this.widgetData.length) {
      this.currentIndex = index
    } else if (index === this.widgetData.length) {
      this.currentIndex = 0
    } else {
      this.currentIndex = this.widgetData.length + index
    }
    this.reInitiateSlideInterval()
  }

  get isOpenInNewTab() {
    const currentData = this.widgetData[this.currentIndex]
    if (currentData.redirectUrl && currentData.redirectUrl.includes('mailto') || this.widgetData[this.currentIndex].openInNewTab) {
      return true
    } return false
  }

  openInNewTab() {
    const currentData = this.widgetData[this.currentIndex]
    if (currentData.redirectUrl && currentData.redirectUrl.includes('mailto') || this.widgetData[this.currentIndex].openInNewTab) {
      window.open(currentData.redirectUrl)
    }
  }
  raiseTelemetry(bannerUrl: string) {
    this.openInNewTab()
    const path = window.location.pathname.replace('/', '')
    const url = path + window.location.search

    this.events.raiseInteractTelemetry('click', 'banner', {
      pageUrl: url,
      bannerRedirectUrl: bannerUrl,
    })
  }
  open(config?: MatDialogConfig) {
    return this.dialog.open(this.welcomeModal, config)
  }

  getCookie(name: string) {
    const ca: string[] = document.cookie.split(';')
    const caLen: number = ca.length
    const cookieName = `${name}=`
    let c: string

    for (let i = 0; i < caLen; i += 1) {
        c = ca[i].replace(/^\s+/g, '')
        if (c.indexOf(cookieName) === 0) {
            return c.substring(cookieName.length, c.length)
        }
    }
    return ''
  }

  setCookie(name: string, value: boolean, expireDays: number, path: string = '') {
    const d: Date = new Date()
    d.setTime(d.getTime() + expireDays * 24 * 60 * 60 * 1000)
    const expires = `expires=${d.toUTCString()}`
    const cpath: string = path ? `; path=${path}` : ''
    document.cookie = `${name}=${value}; ${expires}${cpath}`
  }

  checkCookies() {
    const isVisitedStr = this.getCookie('isFirstVisit')
    if (isVisitedStr !== '') {
      this.isFirstVisit = false
    }
    const isLearningStr = this.getCookie('isLearning')
    if (isLearningStr === '') {
      this.isLearning = false
    }
    const isDesigningStr = this.getCookie('isDesigning')
    if (isDesigningStr === '') {
      this.isDesigning = false
    }
    const isExploringStr = this.getCookie('isExploring')
    if (isExploringStr === '') {
      this.isExploring = false
    }
  }
}
