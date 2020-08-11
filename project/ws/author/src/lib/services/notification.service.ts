import { AuthInitService } from '@ws/author/src/lib/services/init.service'
import { WorkFlowService } from './work-flow.service'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { ApiService } from 'project/ws/author/src/lib/modules/shared/services/api.service'
import { Injectable } from '@angular/core'
import { NSContent } from '../interface/content'
import { Observable, of } from 'rxjs'
import { NOTIFICATION } from '../constants/apiEndpoints'

@Injectable()
export class NotificationService {
  constructor(
    private apiService: ApiService,
    private workFlowService: WorkFlowService,
    private accessService: AccessControlService,
    private initService: AuthInitService,
  ) { }

  triggerPushPullNotification(
    content: NSContent.IContentMeta,
    comment: string,
    approved: boolean,
  ): Observable<any> {
    if (!this.initService.authAdditionalConfig.allowNotification) {
      return of({})
    }
    const workFlow = this.workFlowService.getWorkFlow(content)
    const nextAction = this.workFlowService.getNextStatus(content)
    const nextStateOwner = this.workFlowService.getOwner(nextAction)
    const nextActionName = this.workFlowService.getActionName(nextAction)
    const nextStateOwnerName = this.workFlowService.getOwnerName(nextAction)
    const currentOwner = this.workFlowService.getOwner(content.status)
    const currentOwnerName = this.workFlowService.getOwnerName(content.status)
    const currentActionName = this.workFlowService.getActionName(content.status)
    // Condition if the content is moved forward
    if (approved) {
      // Removing the below code as publish mail will be trigger from backend itself

      // Condition for single stage publish
      // if (
      //   workFlow.indexOf(nextAction) === workFlow.length - 1 &&
      //   (workFlow.indexOf(content.status) === 0 ||
      //     workFlow.indexOf(content.status) === workFlow.length - 1)
      // ) {
      //   // Condition to check if email trigger is required
      //   if (
      //     content.creatorContacts.length > 1 ||
      //     !content.creatorContacts.find(v => v.id === this.accessService.userId)
      //   ) {
      //     return this.getApi(this.publishContent(content, comment, []))
      //   }
      //   // Returning empty response if notification is not required
      //   return of({})
      // }
      // Condition if the author sends the content to review
      if (
        (workFlow.indexOf(content.status) === 0 ||
          workFlow.indexOf(content.status) === workFlow.length - 1) &&
        workFlow.indexOf(nextAction) < workFlow.length - 2
      ) {
        // Condition if the next action nextStateOwner exists
        if (
          nextStateOwner &&
          (content as any)[nextStateOwner] &&
          (content as any)[nextStateOwner].length
        ) {
          return this.getApi(
            this.sendContent(
              content,
              comment,
              nextActionName as string,
              nextStateOwnerName as string,
              (content as any)[nextStateOwner].map((v: { id: string }) => v.id),
            ),
          )
        }
        // Returning empty response if notification is not required
        return of({})
      }
      // Condition if the reviewer sends the content to next stage
      if (
        (workFlow.indexOf(content.status) > 0 ||
          workFlow.indexOf(content.status) < workFlow.length - 2) &&
        workFlow.indexOf(nextAction) < workFlow.length - 2
      ) {
        return this.getApi(
          this.approveContent(
            content,
            comment,
            currentActionName as string,
            nextActionName as string,
            currentOwnerName as string,
            nextStateOwnerName as string,
            ((content as any)[currentOwner as string] || []).map((v: { id: string }) => v.id),
            ((content as any)[nextStateOwner as string] || []).map((v: { id: string }) => v.id),
          ),
        )
      }
      // Removing the below code as publish mail will be trigger from backend itself

      // Condition if the publisher publishes the content
      // if (
      //   workFlow.indexOf(content.status) > 0 &&
      //   workFlow.indexOf(nextAction) === workFlow.length - 1
      // ) {
      //   // Condition if the author action nextStateOwner exists
      //   if (content.creatorContacts && content.creatorContacts.length) {
      //     const currentOwnerList = ((content as any)[currentOwner as string] || []).map(
      //       (v: { id: string }) => v.id,
      //     )
      //     return this.getApi(this.publishContent(content, comment, currentOwnerList))
      //   }
      //   // Returning empty response if notification is not required
      //   return of({})
      // }
    } else {
      // Condition if the content is rejected
      return this.getApi(
        this.rejectContent(
          content,
          comment,
          this.workFlowService.getActionName(content.status) as string,
          currentOwnerName as string,
          ((content as any)[currentOwner as string] || []).map((v: { id: string }) => v.id),
        ),
      )
    }
    return of({})
  }

  publishContent(content: NSContent.IContentMeta, comment: string, publisher: string[]) {
    return {
      'event-id': 'publish_content',
      'target-data': {
        identifier: content.identifier,
      },
      'tag-value-pair': {
        '#contentType': this.mapContentType(content.category),
        '#contentTitle': content.name,
        '#targetUrl': `${document.baseURI}app/toc/${content.identifier}/overview`,
        '#comment': comment,
        '#publisher': this.accessService.userId,
      },
      recipients: {
        publisher,
        author: (content.creatorContacts || []).map(v => v.id),
      },
    }
  }

  approveContent(
    content: NSContent.IContentMeta,
    comment: string,
    currentAction: string,
    nextAction: string,
    currentActorName: string,
    nextActorName: string,
    actor: string[],
    nextActor: string[],
  ) {
    return {
      'event-id': 'approve_content',

      'tag-value-pair': {
        '#contentType': this.mapContentType(content.category),
        '#contentTitle': content.name,
        '#nextActor': `${nextActorName}${nextActor.length > 1 ? 's' : ''}`,
        '#currentActor': `${currentActorName}${actor.length > 1 ? 's' : ''}`,
        '#currentStage': currentAction,
        '#nextStage': nextAction,
        '#targetUrl': `${document.baseURI}author/editor/${content.identifier}`,
        '#comment': comment,
        '#actor': this.accessService.userId,
      },
      recipients: {
        actor,
        nextActor,
        author: (content.creatorContacts || []).map(v => v.id),
      },
    }
  }

  rejectContent(
    content: NSContent.IContentMeta,
    comment: string,
    currentStage: string,
    owner: string,
    _actor: string[],
  ) {
    const body = {
      'event-id': 'reject_content',
      'target-data': {
        identifier: content.identifier,
      },
      'tag-value-pair': {
        '#contentType': this.mapContentType(content.category),
        '#contentTitle': content.name,
        '#targetUrl': `${document.baseURI}author/editor/${content.identifier}`,
        '#currentActor': `${owner}`,
        '#currentStage': currentStage,
        '#comment': comment,
        '#actor': this.accessService.userId,
      },
      recipients: {
        author: (content.creatorContacts || []).map(v => v.id),
      },
    }
    return body
  }

  mapContentType(type: string) {
    if (type === 'Collection') {
      return 'Asset'
    }
    if (type === 'Course') {
      return 'Colleciton'
    }
    return type
  }

  sendContent(
    content: NSContent.IContentMeta,
    comment: string,
    nextStage: string,
    nextActorName: string,
    nextActor: string[],
  ) {
    const body: any = {
      'event-id': 'send_content',
      'target-data': {
        identifier: content.identifier,
      },
      'tag-value-pair': {
        '#contentType': this.mapContentType(content.category),
        '#contentTitle': content.name,
        '#targetUrl': `${document.baseURI}author/editor/${content.identifier}`,
        '#nextActor': `${nextActorName}${nextActor.length > 1 ? 's' : ''}`,
        '#nextStage': nextStage,
        '#comment': comment,
        /* '#author': this.accessService.userId, */
        '#authorName': this.accessService.userName,
      },
      recipients: {
        nextActor,
      },
    }
    if (content.status !== 'Draft') {
      body.recipients = { ...body.recipients, author: (content.creatorContacts || []).map(v => v.id) }
    }
    // console.log('notification data created for sent for review is ', body)
    return body
  }

  deleteContent(content: NSContent.IContentMeta, comment: string): Observable<any> {
    if (!this.initService.authAdditionalConfig.allowNotification) {
      return of({})
    }
    const body = {
      'event-id': content.status === 'Live' ? 'delete_live_content' : 'delete_non_live_content',
      'tag-value-pair': {
        '#contentTitle': content.name,
        '#contentType': this.mapContentType(content.contentType),
        '#comment': comment,
        '#currentStage': this.workFlowService.getActionName(content.status) || content.status,
        '#targetUrl': `${document.baseURI}author/my-content?status=deleted`,
      },
      'target-data': {},
      recipients: {
        author: (content.creatorContacts || []).map(v => v.id),
        actor: [this.accessService.userId],
      },
    }
    return this.getApi(body)
  }

  markForDeletion(content: NSContent.IContentMeta, comment: string): Observable<any> {
    if (!this.initService.authAdditionalConfig.allowNotification) {
      return of({})
    }
    const body = {
      'event-id': 'mark_content_for_deletion',
      'tag-value-pair': {
        '#contentTitle': content.name,
        '#contentType': this.mapContentType(content.contentType),
        '#comment': comment,
        '#contentExpiryDate': content.expiryDate,
      },
      'target-data': {},
      recipients: {
        author: (content.creatorContacts || []).map(v => v.id),
        actor: [this.accessService.userId],
      },
    }
    return this.getApi(body)
  }

  unpublishContent(content: NSContent.IContentMeta, comment: string): Observable<any> {
    if (!this.initService.authAdditionalConfig.allowNotification) {
      return of({})
    }
    const body = {
      'event-id': 'unpublish_content',
      'tag-value-pair': {
        '#contentTitle': content.name,
        '#contentType': this.mapContentType(content.contentType),
        '#comment': comment,
        '#targetUrl': `${document.baseURI}author/my-content?status=unpublished`,
      },
      'target-data': {},
      recipients: {
        author: (content.creatorContacts || []).map(v => v.id),
        actor: [this.accessService.userId],
      },
    }
    return this.getApi(body)
  }

  moveToDraft(content: NSContent.IContentMeta, comment: string): Observable<any> {
    if (!this.initService.authAdditionalConfig.allowNotification) {
      return of({})
    }
    const currentActionName = this.workFlowService.getActionName(content.status)
    const body = {
      'event-id': 'move_content_to_draft',
      'tag-value-pair': {
        '#contentTitle': content.name,
        '#contentType': this.mapContentType(content.contentType),
        '#comment': comment,
        '#previousStage': currentActionName,
      },
      'target-data': {
        identifier: content.identifier,
      },
      recipients: {
        author: (content.creatorContacts || []).map(v => v.id),
        actor: [this.accessService.userId],
      },
    }
    return this.getApi(body)
  }

  moveToDraft2(content: NSContent.IContentMeta, previousStage: string): Observable<any> {
    if (!this.initService.authAdditionalConfig.allowNotification) {
      return of({})
    }
    let eventID = 'Recall_to_draft'

    if (previousStage === 'Unpublished' && this.accessService.hasRole(['publisher', 'editor'])) {
      eventID = 'unpublished_to_draft'
    } else if (previousStage === 'Live' && this.accessService.hasRole(['publisher', 'editor'])) {
      eventID = 'published_to_draft'
    }
    const body = {
      'event-id': eventID,
      'tag-value-pair': {
        '#contentTitle': content.name,
        '#contentType': this.mapContentType(content.contentType),
        '#previousStage': previousStage,
        '#nextStage': 'Draft',
        '#contentCreator': content.creatorContacts[0].id,
        '#author': (content.creatorContacts || []).map(v => v.id),
      },
      recipients: {},
      'target-data': {
        identifier: content.identifier,
      },
      fromPublisher: false,
    }
    // if the norification is generated by publisher, then both the creator and publisher will get the notification
    // if the notification is generated by creator, only publisher will get the notification
    if (this.accessService.hasRole(['editor']) || content.publisherDetails.some(publisher => publisher.id === this.accessService.userId)) {
      body.recipients = {
        author: (content.creatorContacts || []).map(v => v.id),
        /* nextActor: content.publisherDetails.map(publisher => publisher.id), /* (content.publisherDetails || []).map(v => v.id), */
      }
      body.fromPublisher =  true
    } else {
      body.recipients = {
        nextActor: content.publisherDetails.map(publisher => publisher.id),
      }
      body.fromPublisher = false
    }
    // console.log('moved to draft data looks like ', body)
    return this.getApi(body)
  }

  unpublishContent2(content: NSContent.IContentMeta, previousStage: string): Observable<any> {
    if (!this.initService.authAdditionalConfig.allowNotification) {
      return of({})
    }
    const body = {
      'event-id': 'unpublish_content',
      'tag-value-pair': {
        '#contentTitle': content.name,
        '#contentType': this.mapContentType(content.contentType),
        '#previousStage': previousStage,
        '#contentCreator': content.creatorContacts.map(c => c.id),
        '#nextStage': 'Unpublished',
      },
      'target-data': {
        identifier: content.identifier,
      },
      recipients: {
        author: (content.creatorContacts || []).map(v => v.id),
      },
    }
    // console.log('content data for unpublish is', body)
    return this.getApi(body)
  }

  deleteContent2(content: NSContent.IContentMeta, previousStage: string): Observable<any> {
    if (!this.initService.authAdditionalConfig.allowNotification) {
      return of({})
    }
    const body = {
      'event-id': 'delete_content',
      'tag-value-pair': {
        '#contentTitle': content.name,
        '#contentType': this.mapContentType(content.contentType),
        '#previousStage': previousStage,
        '#contentCreator': content.creatorContacts.map(c => c.id),
      },
      'target-data': {
        identifier: content.identifier,
      },
      recipients: {
        nextActor: (content.publisherDetails || []).map(v => v.id),
      },
    }
    // console.log('deleted content notification body looks like ', body)
    return this.getApi(body)
  }

  getApi(body: any) {
    return this.apiService.post(NOTIFICATION, body, false)
  }

  triggerNotification(type: string, content: NSContent.IContentMeta, previousState?: string) {
    let subscription
    switch (type) {
      case 'unpublish':
        subscription = this.unpublishContent2(content, previousState as string)
        break
      case 'moveToDraft':
        subscription = this.moveToDraft2(content, previousState as string)
        break
      case 'delete':
        subscription = this.deleteContent2(content, previousState as string)
        break
    }
    if (subscription) {
      subscription.subscribe()
    }
  }
}
