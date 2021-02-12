import { Injectable } from '@angular/core'
import { NavigationEnd, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { filter } from 'rxjs/operators'
import { GAConstants } from '../constants'
import { IGaEventObject } from '../models/ga-event-object.interface'

declare var gtag: Function
@Injectable({
  providedIn: 'root',
})
export class GoogleAnalyticsCoreService {

  public static googleAnalyticsTrackingID: undefined | string
  public static googleAnalyticsActivated = false
  public static googleAnalyticsDataLayer = []
  routerSub$: Subscription | undefined
  pageViewEnabled = true

  constructor(private readonly router: Router) { }

  emitEvent(eventType: string, eventObj: IGaEventObject) {
    const eventObject: IGaEventObject = {
    }
    if (eventType === GAConstants.events.PAGE_VISIT_EVENT) {
      // emit page views
      gtag('config', GoogleAnalyticsCoreService.googleAnalyticsTrackingID, {
        page_path: eventObj.pagePath,
      })
    } else {
      this.prepareEventObject(eventObject, eventObj)
      // emit the event
      gtag('event', eventType, eventObject)
    }
  }

  prepareEventObject(finalObject: any, sourceObject: IGaEventObject): IGaEventObject {
      finalObject.eventName = sourceObject.eventName || 'A generic event'
      finalObject.eventAction = sourceObject.eventAction || 'A generic action'
      finalObject.eventCategory = sourceObject.eventCategory || 'A generic category'
      finalObject.eventLabel = sourceObject.eventLabel || 'A generic label'
      finalObject.pageTitle = sourceObject.pageTitle || 'A generic page title'
      // tslint:disable-next-line: max-line-length
      finalObject.eventValue = sourceObject.eventValue == null ? '' : (sourceObject.eventValue instanceof Object && sourceObject.eventValue !== undefined ? JSON.stringify(sourceObject.eventValue) : sourceObject.eventValue)
      finalObject.send_to = GoogleAnalyticsCoreService.googleAnalyticsTrackingID
      return finalObject
  }

  enablePageViews() {
    if (this.routerSub$) {
      this.routerSub$.unsubscribe()
    }
    this.routerSub$ = this.router.events.pipe(
      filter((routerEvent: any) => routerEvent instanceof NavigationEnd && this.pageViewEnabled)) // pageView is enabled by default
      .subscribe(_event => {
        const pageViewEventObj: any = {
          eventName: 'Page Visit',
          eventCategory: 'Page Visits',
          eventAction: 'Routing Event',
          eventLabel: 'Triggered when user navigates between routes',
          eventValue: null,
          pagePath: _event.urlAfterRedirects,
        }
        this.emitEvent(GAConstants.events.PAGE_VISIT_EVENT, pageViewEventObj)
    })
  }

  init(gaKey: string, enablePageViews = true) {
    try {
      this.pageViewEnabled = enablePageViews ? true : false
      if (GoogleAnalyticsCoreService.googleAnalyticsActivated) {
        // already active,  no need to do anything
      } else {
        GoogleAnalyticsCoreService.googleAnalyticsActivated = false
        GoogleAnalyticsCoreService.googleAnalyticsTrackingID = gaKey
        document.head.prepend(this.createGAScriptNode(gaKey))
        // tslint:disable-next-line: no-console
        console.warn('gtag.js script is now hooked')
        // setting page view false so that it does not fire twice for initial load
        gtag('config', GoogleAnalyticsCoreService.googleAnalyticsTrackingID)
        GoogleAnalyticsCoreService.googleAnalyticsActivated = true
        this.enablePageViews()
      }
    } catch (e) {
      // tslint:disable-next-line: no-console
      console.warn('could not initiate google analytics, check manually')
    }
  }

  createGAScriptNode(gaKey: string) {
    const coreGAnode = document.createElement('script') as HTMLScriptElement
    coreGAnode.src = `https://www.googletagmanager.com/gtag/js?id=${gaKey}`
    coreGAnode.async = true
    return coreGAnode
  }

  releaseSubscription() {
    if (this.routerSub$) {
      this.routerSub$.unsubscribe()
    }
  }
}
