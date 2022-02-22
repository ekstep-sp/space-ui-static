import { Component, OnInit, ViewChild } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { NsContent, NsContentStripMultiple, ROOT_WIDGET_CONFIG } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ConfigurationsService, TFetchStatus } from '@ws-widget/utils'
import { NSProfileData } from '../../../../models/profile.model'
import { ProfileService } from '../../../../services/profile.service'
import { NSLearningHistory } from '../../../learning/models/learning.models'
import { LearningHistoryService } from '../../../learning/services/learning-history.service'
import { InitService } from 'src/app/services/init.service'
import { MatDialog, MatDialogConfig } from '@angular/material/dialog'

interface ILearningHistoryContent {
  content: NSLearningHistory.ILearningHistory
  contentType: string
  pageNum: number
  loading: boolean
  isLoadingFirstTime: boolean
  fetchStatus: 'fetching' | 'done' | 'error'
}

export interface IChips {
  name?: string
}

@Component({
  selector: 'ws-app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})

export class DashboardComponent implements OnInit {
  startDate = '2018-04-01'
  endDate = '2020-03-31'
  specialDates: number[] = []
  followContent: NSProfileData.IFollowing[] = []
  channelsFollow: NsContent.IContentMinimal[] = []
  contentType = 'Course'
  timeEvent = new Date()
  isCompleted = 0
  userPointsEarned = 0
  orgWidePointsPercent = 0
  orgWideTimePercent = 0
  totalLearningHours = -1
  badgesData: any | null = null
  badgesEarned: any[] | null = null
  interests: string[] | null = null
  nsoArtifacts: NSProfileData.INsoResponse | null = null
  userName = ''
  userEmail = ''
  departmentName = ''
  country = ''
  currentRole = ''
  domains: IChips[] = []
  expertises: IChips[] = []
  profileLink: string | undefined = ''
  userProfilePicture = ''
  skillData: any
  skillFetchStatus: TFetchStatus = 'none'
  badgeApiFetchStatus: TFetchStatus = 'none'
  interestFetchStatus: TFetchStatus = 'none'
  userDataFetchStatus: TFetchStatus = 'none'
  nsoArtifactsFetchStatus: TFetchStatus = 'none'
  followFetchStatus: TFetchStatus = 'none'
  historyFetchStatus: TFetchStatus = 'none'
  apiFetchStatus: TFetchStatus = 'none'
  pointsEarn: number | null = 0
  timeSpentData: NSProfileData.ITimeSpentResponse | null = null
  timeSpent = 0
  enabledTabs = this.activatedRoute.snapshot.data.pageData.data.enabledTabs.dashboard
  widgetResolverData: NsWidgetResolver.IRenderConfigWithTypedData<NsContentStripMultiple.IContentStripMultiple> = {
    widgetData: {
      strips: [
        {
          key: 'continueLearning',
          title: 'Last viewed',

          stripConfig: {
            cardSubType: 'standard',
            deletedMode: 'hide',
            intranetMode: 'greyOut',
          },
          request: {
            api: {
              path: '/apis/protected/v8/user/history',
              queryParams: {
                pageSize: 20,
              },
            },
          },
        },
      ],
    },
    widgetType: ROOT_WIDGET_CONFIG.contentStrip._type,
    widgetSubType: ROOT_WIDGET_CONFIG.contentStrip.multiStrip,
    widgetHostClass: 'block sm:-mx-10 -mx-6',
  }

  coursePending: NSLearningHistory.ILearningHistoryItem[] = []
  lhContent: ILearningHistoryContent[] = []
  selectedStatusType = 'inprogress'
  selectedTabIndex = 0
  contentTypes = ['learning path', 'course', 'collection', 'resource', 'certification']
  pageSize = 10
  loadingContent = true
  pageNum = ''
  ongoingCertifications: NSLearningHistory.ILearningHistoryItem[] = []
  passedCertifications: NSLearningHistory.ILearningHistoryItem[] = []
  defaultProfileImage = '../../../../../../../../../../../fusion-assets/profileimage.png'

  @ViewChild('video', { static: false }) video: any

  constructor(
    private configSvc: ConfigurationsService,
    private initService: InitService,
    // private badgesSvc: BadgesService,
    private profileSvc: ProfileService,
    private learnHstSvc: LearningHistoryService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog
  ) {
    if (this.configSvc.userProfile) {
      this.userName = this.configSvc.userProfile.givenName || ''
      this.country = this.configSvc.userProfile.country || ''
      this.currentRole = this.configSvc.userProfile.currentRole || ''
      this.initService.getUserProfile()
      // forkJoin({
      //   domains: this.profileSvc.getDomain(),
      //   expertise: this.profileSvc.getExpertise(),
      // })
      // .subscribe(({ domains, expertise }) => {
      //   this.domains = domains ? domains : []
      //   this.expertises = expertise ? expertise : []
      // })


      this.domains = this.configSvc.userProfile.areaOfWork ? 
        this.configSvc.userProfile.areaOfWork.split(',') as IChips[] : []
      this.expertises = this.configSvc.userProfile.areaOfExpertise ?
       this.configSvc.userProfile.areaOfExpertise.split(',') as IChips[] : []

      this.profileLink = (this.configSvc.userProfile.userProperties && this.configSvc.userProfile.userProperties !== 'null') ?
            this.configSvc.userProfile.userProperties.profileLink : ''
      this.userEmail = this.configSvc.userProfile.email || ''
      this.departmentName = (this.configSvc.userProfile.departmentName && this.configSvc.userProfile.departmentName !== 'null')
        ? this.configSvc.userProfile.departmentName : ''
      if (this.configSvc.userProfile.source_profile_picture &&
        this.configSvc.userProfile.source_profile_picture !== 'null' &&
        this.configSvc.userProfile.source_profile_picture !== '') {
           this.userProfilePicture = this.getAuthoringUrl(this.configSvc.userProfile.source_profile_picture)
        }
      }
  }

  ngOnInit() {
    this.badgeApiFetchStatus = 'fetching'
    this.userDataFetchStatus = 'fetching'
    this.nsoArtifactsFetchStatus = 'fetching'
    this.interestFetchStatus = 'fetching'
    this.followFetchStatus = 'fetching'
    this.historyFetchStatus = 'fetching'
    this.apiFetchStatus = 'fetching'


    // this.interestSvc.fetchUserInterestsV2().subscribe(
    //   (data: string[]) => {
    //     this.interests = data
    //     this.interestFetchStatus = 'done'
    //   },
    //   () => {
    //     this.interestFetchStatus = 'error'
    //   },
    // )



    // this.badgesSvc.fetchBadges().subscribe(
    //   (data: IBadgeResponse) => {
    //     this.badgesData = data
    //     this.badgesEarned = this.badgesData.earned
    //     this.pointsEarn =
    //       this.badgesData.totalPoints[0].collaborative_points +
    //       this.badgesData.totalPoints[0].learning_points
    //     this.badgeApiFetchStatus = 'done'
    //   },
    //   () => {
    //     this.badgeApiFetchStatus = 'error'
    //   },
    // )
    if (this.enabledTabs.subFeatures.calendar) {
      this.profileSvc.timeSpent(this.startDate, this.endDate, this.contentType, this.isCompleted).subscribe(
        (timeSpentTrack: NSProfileData.ITimeSpentResponse) => {
          this.timeSpentData = timeSpentTrack
          this.apiFetchStatus = 'done'
          if (this.timeSpentData) {
            this.userPointsEarned = this.timeSpentData.points_and_ranks.user_points_earned
            this.orgWideTimePercent = Math.round(
              this.timeSpentData.timespent_user_vs_org_wide.usage_percent,
            )
            this.orgWidePointsPercent = Math.round(
              this.timeSpentData.points_and_ranks.points_user_vs_org_wide.points_percent,
            )
            this.totalLearningHours = Math.round(this.timeSpentData.time_spent_by_user)

            // this.trackWiseDataFetch(this.learningTimeData.track_wise_user_timespent)
            this.specialDatesSet()
          }
        },
        () => {
          this.apiFetchStatus = 'error'
        })
    }
    if (this.enabledTabs.subFeatures.pendingCourses) {
      this.learnHstSvc.fetchContentProgress(this.pageNum, this.pageSize, this.selectedStatusType, 'course').subscribe(
        (data: NSLearningHistory.ILearningHistory) => {
          this.coursePending = data.result.sort((a: any, b: any) => (a.timeLeft > b.timeLeft ? 1 : a.timeLeft < b.timeLeft ? -1 : 0))
          this.historyFetchStatus = 'done'
        },
        () => {
          this.historyFetchStatus = 'done'
        })
    }
  }

  specialDatesSet() {
    if (this.timeSpentData) {
      const timeSpentDateWise = this.timeSpentData.date_wise.filter(data => data.value !== 0)
      this.specialDates = timeSpentDateWise.map(data => data.key)
    }
  }
  calendarEvent(event: string) {
    this.timeEvent = new Date(event)
    const clickedDate = this.timeEvent.getTime() + 330 * 60000
    if (this.timeSpentData) {
      this.timeSpentData.date_wise.reverse().find((cur: NSProfileData.IProfileData) => {
        if (clickedDate === cur.key) {
          this.timeSpent = cur.value
          return
        }
      })
    }
  }
  // new changes in edit-profile
  edituserdetails() {
    this.profileSvc.updateStatus(true)
    this.router.navigate(['/app/profile/edit-profile'])
  }

  open(config?: MatDialogConfig) {
    return this.dialog.open(this.video, config)
  }

  getAuthoringUrl(url: string): string {
    return url
      ? `/apis/authContent/${
      url.includes('/content-store/') ? new URL(url).pathname.slice(1) : encodeURIComponent(url)
      }`
      : ''
  }

}
