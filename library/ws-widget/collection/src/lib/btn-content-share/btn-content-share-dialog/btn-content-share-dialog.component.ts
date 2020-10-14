import { COMMA, ENTER, SEMICOLON } from '@angular/cdk/keycodes'
import { Component, Inject, OnInit } from '@angular/core'
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material'
import { ConfigurationsService, EventService } from '@ws-widget/utils'
import { NsAutoComplete } from '../../_common/user-autocomplete/user-autocomplete.model'
import { WidgetContentShareService } from '../../_services/widget-content-share.service'
import { NsContent } from '../../_services/widget-content.model'
import { NsShare } from '../../_services/widget-share.model'
import { ICommon } from '../../_models/common.model'
import { catchError, delay, map, tap } from 'rxjs/operators'
import { of, Subscription } from 'rxjs'
import { HttpClient } from '@angular/common/http'

@Component({
  selector: 'ws-widget-btn-content-share-dialog',
  templateUrl: './btn-content-share-dialog.component.html',
  styleUrls: ['./btn-content-share-dialog.component.scss'],
})
export class BtnContentShareDialogComponent implements OnInit {
  readonly separatorKeysCodes: number[] = [ENTER, COMMA, SEMICOLON]
  users: NsAutoComplete.IUserAutoComplete[] = []
  errorType: 'NoDomain' | 'InvalidDomain' | 'None' = 'None'
  sendInProgress = false
  message = ''
  isSocialMediaShareEnabled = false
  sendStatus: 'INVALID_IDS_ALL' | 'SUCCESS' | 'INVALID_ID_SOME' | 'ANY' | 'NONE' = 'NONE'
  sharableUrl = ''
  showSharableUI = false
  sub$: Subscription | null = null
  constructor(
    private events: EventService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<BtnContentShareDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { content: NsContent.IContent },
    private shareSvc: WidgetContentShareService,
    private configSvc: ConfigurationsService,
    private readonly http: HttpClient,
  ) { }

  ngOnInit() {
    this.generateSharableUrl(this.data.content, false).then(v => {
      if (v) {
        this.sharableUrl = v
        this.showSharableUI = true
        // tslint:disable-next-line: no-console
        console.log('printing someting ', this.sharableUrl + this.showSharableUI)
      } else {
      }
    }).catch(_ => {
      this.sharableUrl = ''
      this.showSharableUI = false
    })
    this.shareSvc.fetchConfigFile().subscribe((data: ICommon) => {
      if (data && data.shareMessage) {
        this.message = data.shareMessage
      } else {
        this.message = 'I want to share this artifact I found.'
      }
    })

    if (this.configSvc.restrictedFeatures) {
      this.isSocialMediaShareEnabled =
        !this.configSvc.restrictedFeatures.has('socialMediaFacebookShare') ||
        !this.configSvc.restrictedFeatures.has('socialMediaLinkedinShare') ||
        !this.configSvc.restrictedFeatures.has('socialMediaTwitterShare')
    }
  }

  updateUsers(users: NsAutoComplete.IUserAutoComplete[]) {
    if (Array.isArray(users)) {
      this.users = users
    }
  }

  share(txtBody: string, successToast: string) {
    this.sendInProgress = true
    const emails = []
    for (let i = 0; i < this.users.length; i += 1) {
      emails.push({
        email: this.users[i].email,
      })
    }
    this.shareSvc.shareContent(this.data.content, emails, txtBody).subscribe(
      data => {
        this.sendInProgress = false
        if (!data.invalidIds || data.invalidIds.length === 0) {
          this.snackBar.open(successToast)
          this.dialogRef.close()
        }
        if (Array.isArray(data.invalidIds) && data.invalidIds.length > 0) {
          const invalidMailSet = new Set(data.invalidIds)
          if (data.response.toLowerCase() !== 'success') {
            this.sendStatus = 'ANY'
          }
          if (this.users.length === invalidMailSet.size) {
            this.sendStatus = 'INVALID_IDS_ALL'
          } else {
            this.sendStatus = 'INVALID_ID_SOME'
            this.snackBar.open(successToast)
          }
        }
      },
      () => {
        this.sendStatus = 'ANY'
        this.sendInProgress = false
      },
    )
  }

  contentShare(txtBody: string, successToast: string) {
    this.sendInProgress = true
    this.raiseTelemetry()
    const req: NsShare.IShareRequest = {
      'event-id': 'share_content',
      'tag-value-pair': {
        '#contentTitle': this.data.content.name,
        '#contentType': this.data.content.contentType,
        '#message': txtBody,
        '#targetUrl': this.detailUrl,
      },
      'target-data': {
        identifier: this.data.content.identifier,
      },
      recipients: {
        sharedBy: [(this.configSvc.userProfile && this.configSvc.userProfile.userId) || ''],
        sharedWith: this.users.map(user => user.wid),
      },
    }
    this.shareSvc.contentShareNew(req).subscribe(
      _ => {
        this.snackBar.open(successToast)
        this.sendInProgress = false
        this.dialogRef.close()
      },
      _ => {
        this.sendStatus = 'ANY'
        this.sendInProgress = false
      },
    )
  }

  get detailUrl() {
    // let locationOrigin = environment.sitePath ? `https://${environment.sitePath}` : location.origin
    let locationOrigin = location.origin
    if (this.configSvc.activeLocale && this.configSvc.activeLocale.path) {
      locationOrigin += `/${this.configSvc.activeLocale.path}`
    }
    switch (this.data.content.contentType) {
      case NsContent.EContentTypes.CHANNEL:
        return `${locationOrigin}${this.data.content.artifactUrl}`
      case NsContent.EContentTypes.KNOWLEDGE_BOARD:
        return `${locationOrigin}/app/knowledge-board/${this.data.content.identifier}`
      case NsContent.EContentTypes.KNOWLEDGE_ARTIFACT:

        return `${locationOrigin}/app/toc/${this.data.content.identifier}/overview`
      default:
        return `${locationOrigin}/app/toc/${this.data.content.identifier}/overview`
    }
  }

  raiseTelemetry() {
    this.events.raiseInteractTelemetry('share', 'content', {
      contentId: this.data.content.identifier,
      contentType: this.data.content.contentType,
    })
  }
  copyToClipboard(inputElement: any) {
    try {
      const textArea = document.createElement('textarea')
      textArea.value = inputElement.value
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      window.setTimeout(() => {
        this.triggerCopiedNotification('Url copied to clipoard!')
        this.dialogRef.close()
      }, 100)
    } catch (e) {
      this.triggerCopiedNotification('copy to clipboard failed, copy manually.')
    }
  }

  triggerCopiedNotification(message: string) {
    this.snackBar.open(message)
  }

  getPageType() {
    const urlSegments = document.location.href.split('/')
    const allowedRoutes: any = {
      viewer: 'v',
    }
    let pageType = null
    Object.keys(allowedRoutes).some((type: string) => {
      if (urlSegments.includes(type)) {
        pageType = allowedRoutes[type]
        return true
      }
      return false
    })
    return pageType
  }

  generateSharableUrl(data: NsContent.IContent, dummy = true) {
    const pageType = this.getPageType()
    const contentID = data.identifier
    const contentType = data.contentType
    if (pageType) {
      this.showSharableUI = true
      if (dummy) {
        // tslint:disable-next-line: max-line-length
        return of({ data: { sharableurl: `${location.origin}/public/sharecontent/v/something` } }).pipe(delay(1200)).toPromise()
      }
      const requestBody = {
        pageType,
        contentType,
        lexId: contentID,
      }
      // '/apis/public/v8/content/sharable-url/generate'
      // tslint:disable-next-line: max-line-length
      return this.http.post('/apis/public/v8/content/sharable-url/generate', requestBody).pipe(
        tap(response => {
          // tslint:disable-next-line: no-console
          console.log('recieved data as ', response)
        }),
        map((v: any) => v.shareableUrl),
        catchError(_ => of(null))
        ).toPromise()
    }
    this.showSharableUI = false
    return of(null).toPromise()
  }

  ngDestroy() {
    if (this.sub$) {
      this.sub$.unsubscribe()
    }
  }
}
