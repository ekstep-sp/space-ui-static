import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'

@Component({
  selector: 'ws-app-toc-body-common-routing',
  templateUrl: './toc-body-common-routing.component.html',
  styleUrls: ['./toc-body-common-routing.component.scss'],
})
export class TocBodyCommonRoutingComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false
    }
    this.scroll()
  }
  scroll() {
    const overview = document.getElementById('overview') as HTMLElement
    const ataglance = document.getElementById('ataglance') as HTMLElement
    const contents = document.getElementById('contents') as HTMLElement
    if (window.location.href.includes('overview') && overview) {
      setTimeout(() => {
        overview.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            })
      },         500)
    }
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
  }

}
