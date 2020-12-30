import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router, ActivatedRoute, Data } from '@angular/router'
import { Subscription } from 'rxjs'
import { NsContent } from '@ws-widget/collection/src/public-api'

@Component({
  selector: 'ws-app-toc-body-common-routing',
  templateUrl: './toc-body-common-routing.component.html',
  styleUrls: ['./toc-body-common-routing.component.scss'],
})
export class TocBodyCommonRoutingComponent implements OnInit, OnDestroy {

  private routeSubscription: Subscription | null = null
  content: NsContent.IContent | null = null

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    // this.router.routeReuseStrategy.shouldReuseRoute = function () {
    //   return false
    // }
    if (this.route && this.route.parent) {
      this.routeSubscription = this.route.parent.data.subscribe((data: Data) => {
        this.content = data.content.data
      })
    }
    this.scroll()
  }
  scroll() {
    // const overview = document.getElementById('overview') as HTMLElement
    const ataglance = document.getElementById('ataglance') as HTMLElement
    const contents = document.getElementById('contents') as HTMLElement
    const rateUs = document.getElementById('rateUs') as HTMLElement

    // if (window.location.href.includes('overview') && overview) {
    //   setTimeout(() => {
    //     overview.scrollIntoView({
    //         behavior: 'smooth',
    //         block: 'start',
    //         })
    //   },         500)
    // }
    if (window.location.href.includes('ataglance') && ataglance) {
      setTimeout(() => {
        ataglance.scrollIntoView({
             behavior: 'smooth',
              block: 'start',
               })
      },         500)
    }
    if (window.location.href.includes('contents') && contents) {
      setTimeout(() => {
        contents.scrollIntoView({
             behavior: 'smooth',
              block: 'start',
               })
      },         500)
    }
    if (window.location.href.includes('rateUs') && rateUs) {
      setTimeout(() => {
        rateUs.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            })
      },         500)
    }
  }
  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe()
    }
  }
}
