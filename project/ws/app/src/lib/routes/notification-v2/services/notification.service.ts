import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { ENotificationEvent, INotification } from '../models/notifications.model'

@Injectable()
export class NotificationService {
  constructor(private router: Router) {}

  mapRoute(notification: INotification) {
    const event = notification.eventId
    notification.targetUrl = 'space.societalplatform.org/app/users/list?search_query=hritik'
    const searchQuery = notification.targetUrl.split('=')[1]
    let identifier: string
    let route: string
    let queryParam
    switch (event) {
      case ENotificationEvent.NewConnectionRequest:
        route = 'app/users/list'
        queryParam = { queryParams: { search_query: searchQuery } }
        break
      case ENotificationEvent.ShareGoal:
        route = '/app/goals/me/pending-actions'
        queryParam = { queryParams: { } }
        break
      case ENotificationEvent.SharePlaylist:
        route = '/app/playlist/notification'
        queryParam = { queryParams: {} }
        break
      case ENotificationEvent.ShareContent:
      case ENotificationEvent.PublishContent:
        identifier = notification.targetData['identifier']
        if (!identifier) {
          route = ''
          queryParam = { queryParams: {} }
          break
        }
        route = `/app/toc/${identifier}/overview`
        break
      case ENotificationEvent.AddContributor:
      case ENotificationEvent.SendContent:
      case ENotificationEvent.RejectContent:
      case ENotificationEvent.DelegateContent:
      case ENotificationEvent.ApproveContent:
        identifier = notification.targetData['identifier']
        if (!identifier) {
          route = ''
          queryParam = { queryParams: { } }
          break
        }
        route = `/author/editor/${identifier}`
        queryParam = { queryParams: {} }
        break
      default:
        route = ''
        queryParam = { queryParams: {} }
    }

    if (route) {
      this.router.navigate([route], queryParam)
    }
  }
}
