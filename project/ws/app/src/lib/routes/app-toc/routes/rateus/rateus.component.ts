import { ChangeDetectorRef, Component, Input, OnInit, OnDestroy } from '@angular/core'
import { ConfigurationsService, EventService } from '@ws-widget/utils'
import { WidgetContentService, NsContent } from '@ws-widget/collection/src/public-api'
import { ActivatedRoute, Data } from '@angular/router'
import { Subscription } from 'rxjs'

@Component({
  selector: 'ws-app-rateus',
  templateUrl: './rateus.component.html',
  styleUrls: ['./rateus.component.scss'],
})
export class RateusComponent implements OnInit, OnDestroy {
  @Input() contentId!: string
  @Input() isDisabled = false
  @Input() parentElem: any = null
  @Input() mobileView = false
  isRequesting = true
  userRating = 0
  @Input() forPreview = false
  averageRatings = 0
  ratingCount = 0
  private routeSubscription: Subscription | null = null
  content: NsContent.IContent | null = null

  constructor(
    private events: EventService,
    private contentSvc: WidgetContentService,
    private configSvc: ConfigurationsService,
    private readonly cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    if (this.route && this.route.parent) {
      this.routeSubscription = this.route.parent.data.subscribe((data: Data) => {
        this.content = data.content.data
        if (this.content) {
        this.contentId = this.content.identifier
      }
        // console.log(this.content)
        // this.contentId = this.content
      })
    }
    if (this.configSvc.isGuestUser) {
      this.isRequesting = false
      this.isDisabled = true
    } else if (!this.forPreview) {
      this.contentSvc.fetchContentRating(this.contentId).subscribe(
        result => {
          if (result.rating) {
            this.ratingCount = result.rating
          }
          this.isRequesting = false
          this.userRating = result.rating
          this.cdr.detectChanges()
        },
        _err => {
          this.isRequesting = false
          this.cdr.detectChanges()
        },
      )
    }
  }

  get isRatingsDisabled() {
    return this.isRequesting || this.isDisabled
  }

  addRating(index: number) {
    if (!this.forPreview) {
      this.isRequesting = true
      const previousRating = this.userRating
      if (this.userRating !== index + 1) {
        this.userRating = index + 1
        this.events.raiseInteractTelemetry('rating', 'content', {
          contentId: this.contentId,
          rating: this.userRating,
        })
        this.contentSvc.addContentRating(this.contentId, { rating: this.userRating }).subscribe(
          _ => {
            this.isRequesting = false
          },
          _ => {
            this.isRequesting = false
            this.userRating = previousRating
          },
        )
      } else {
        this.contentSvc.deleteContentRating(this.contentId).subscribe(
          _ => {
            this.userRating = 0
            this.isRequesting = false
          },
          _ => {
            this.isRequesting = false
            this.userRating = previousRating
          },
        )
      }
    } else {
      this.userRating = index + 1
    }
  }

  public get enableFeature(): boolean {
    switch (this.configSvc.rootOrg) {
      default:
        return true
    }
  }
  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe()
    }
  }
}
