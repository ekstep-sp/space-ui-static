
import { Component, OnInit, Input, ViewChild } from '@angular/core'
import { InitService } from 'src/app/services/init.service'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { ProfileService } from '../../services/profile.service'
import { MatSnackBar } from '@angular/material'
import { UploadService } from '../../../../../../../author/src/lib/routing/modules/editor/shared/services/upload.service'
import { CONTENT_BASE_STATIC } from '../../../../../../../author/src/lib/constants/apiEndpoints'
import { Router, ActivatedRoute } from '@angular/router'
import { FOLDER_NAME_EDIT_PROFILE } from '../../../../../../../author/src/lib/constants/constant'
import { ConfigurationsService, UtilityService } from '@ws-widget/utils/src/public-api'
import { IWidgetsPlayerMediaData } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { MatChipInputEvent } from '@angular/material/chips'
import { COMMA, ENTER } from '@angular/cdk/keycodes'
import { countryList } from '../../models/countries.model'
import { MatDialog, MatDialogConfig } from '@angular/material/dialog'
export namespace NsEditProfile {
  export interface IResponseBody {
    wid: string,
    userFirstName: string,
    userLastName: string,
    sourceProfilePicture: string,
    userProperties: IUserProperties,
  }
  export interface IUserProperties {
    bio: string,
    profileLink: string
  }
}
export interface IChips {
  name?: string
}
@Component({
  selector: 'ws-app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent implements OnInit {
  @Input() enableToolbar = true
  @Input() enableSkip = false
  isShowUploadMobile = false
  isShowUploadIOS = false
  isShowUploadAndroid = false
  isPartOfFirstTimeSetupV2 = false
  locale = ''
  appName = ''
  introVideos: any
  countryList = countryList
  domains: IChips[] = []
  expertises: IChips[] = []
  actualDomains: IChips[] = []
  actualExpertises: IChips[] = []
  addOnBlur = true
  readonly separatorKeysCodes = [ENTER, COMMA] as const
  paramsForEditProfile: NsEditProfile.IResponseBody = {} as NsEditProfile.IResponseBody
  widgetResolverData: NsWidgetResolver.IRenderConfigWithTypedData<
  IWidgetsPlayerMediaData
> = {
    widgetData: {
      url: 'https://www.youtube.com/embed/W86-mjWXQaw',
      autoplay: true,
      identifier: '',
    },
    widgetHostClass: 'video-full block',
    widgetSubType: 'playerVideo',
    widgetType: 'player',
    widgetHostStyle: {
      height: '100%',
      'max-width': '100%',
      'margin-left': 'auto',
      'margin-right': 'auto',
    },
  }
  @ViewChild('video', { static: false }) video: any

  constructor(
    private initService: InitService,
    private profileSvc: ProfileService,
    private uploadService: UploadService,
    private snackBar: MatSnackBar,
    private activateRoute: ActivatedRoute,
    private utilitySvc: UtilityService,
    private router: Router,
    private configSvc: ConfigurationsService,
    public dialog: MatDialog
  ) { }
  url = ''
  profileUrlParams = ''
  relativeUrl = ''
  isEnable = false
  profileForm: FormGroup = new FormGroup({
    userFirstName: new FormControl('', Validators.required),
    userOrganisation: new FormControl('', Validators.required),
    userCountry: new FormControl('', Validators.required),
    userRole: new FormControl('', Validators.required),
    userDomain: new FormControl([], Validators.required),
    userExpertise: new FormControl([], Validators.required),
    sourceProfilePicture: new FormControl(''),
    profileLink: new FormControl(''),
    isSubscribed: new FormControl(false, Validators.required)
  })

  userProfile: any
  // userPropertiesData: NsEditProfile.IUserProperties = {} as NsEditProfile.IUserProperties
  isLoad = false

  ngOnInit() {
    // this.loadVideo();
    this.activateRoute.data.subscribe(data => {
      this.isShowUploadMobile = data.pageData.data.isMobileUpload
      this.isShowUploadIOS = data.pageData.data.isIOSUpload
      this.isShowUploadAndroid = data.pageData.data.isAndroidUpload

      if (data.pageData) {
        this.profileSvc.setUserEditProfileConfig(data.pageData.data)
        this.relativeUrl = data.pageData.data.profileImage
      }
    })
    this.userProfile = this.initService.getUserProfile()
    // forkJoin({
    //   domains: this.profileSvc.getDomain(),
    //   expertise: this.profileSvc.getExpertise(),
    // })
    // .subscribe(({ domains, expertise }) => {
    //   this.domains = domains ? domains : []
    //   this.expertises = expertise ? expertise : []
    //   this.actualDomains = [...this.domains]
    //   this.actualExpertises = [...this.expertises]
    //   this.profileForm.controls.userDomain.setValue(this.domains)
    //   this.profileForm.controls.userExpertise.setValue(this.expertises)
    // })
    if (this.userProfile) {
      this.profileForm.controls.userFirstName.setValue(this.userProfile.givenName
        && this.userProfile.givenName !== 'null' ? this.userProfile.givenName : ` ${this.userProfile.lastName}`
        && this.userProfile.lastName !== 'null' ? this.userProfile.lastName : '')
      this.profileForm.controls.userOrganisation.setValue(this.userProfile.departmentName &&
        this.userProfile.departmentName !== 'null' ? this.userProfile.departmentName : '')
      this.profileForm.controls.userCountry.setValue(this.userProfile.country &&
        this.userProfile.country !== 'null' ? this.userProfile.country : '')
      this.profileForm.controls.userRole.setValue(this.userProfile.currentRole &&
        this.userProfile.currentRole !== 'null' ? this.userProfile.currentRole : '')

      this.profileForm.controls.userDomain.setValue(this.userProfile.areaOfWork &&
         this.userProfile.areaOfWork !== 'null' ? this.userProfile.areaOfWork.split(',') : [])
      this.domains = this.userProfile.areaOfWork &&
      this.userProfile.areaOfWork !== 'null' ? this.userProfile.areaOfWork.split(',') as IChips[]: []

      this.profileForm.controls.userExpertise.setValue(this.userProfile.areaOfExpertise &&
        this.userProfile.areaOfExpertise !== 'null' ? this.userProfile.areaOfExpertise.split(',') : [])
      this.expertises = this.userProfile.areaOfExpertise &&
        this.userProfile.areaOfExpertise !== 'null' ? this.userProfile.areaOfExpertise.split(',') as IChips[]: []
      this.profileForm.controls.isSubscribed.setValue(this.userProfile.isSubscribedToSpace ? this.userProfile.isSubscribedToSpace : false)
      if (this.userProfile.userProperties) {
        this.profileForm.controls.profileLink.setValue(this.userProfile.userProperties.profileLink
          && this.userProfile.userProperties.profileLink !== 'null' ? this.userProfile.userProperties.profileLink : '')
      }
      // tslint:disable-next-line: max-line-length
      if (this.userProfile.source_profile_picture && this.userProfile.source_profile_picture !== null && this.userProfile.source_profile_picture !== 'null' && this.userProfile.source_profile_picture !== '') {
        this.profileForm.controls.sourceProfilePicture.setValue(this.userProfile.source_profile_picture)
        this.url = this.getAuthoringUrl(this.userProfile.source_profile_picture)
      }
    }
  }
  onSelectFile(file: File) {
    this.isEnable = true
    const formdata = new FormData()
    const fileName = file.name.replace(/[^A-Za-z0-9.]/g, '')
    if (file) {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      // tslint:disable-next-line: no-shadowed-variable
      reader.onload = (file: any) => {
        this.url = file.target.result
      }
      formdata.append('content', file, fileName)
      // tslint:disable-next-line: no-console
      this.uploadService
        .upload(formdata, {
          contentId: FOLDER_NAME_EDIT_PROFILE,
          contentType: CONTENT_BASE_STATIC,
        })
        .subscribe(
          data => {
            if (data.code) {
              // this.profileUrlParams = data.artifactURL
              this.profileForm.controls.sourceProfilePicture.setValue(data.artifactURL)
              this.url = this.getAuthoringUrl(data.artifactURL)
            }
          })
    }
  }

  get showUploadMobile() {
    if (!this.utilitySvc.isMobile) {

      return true
    }

    if (this.isShowUploadMobile) {
      if (this.utilitySvc.isIos && this.isShowUploadIOS) {
        return true
      }
      if (this.utilitySvc.isAndroid && this.isShowUploadAndroid) {
        return true
      }

    }
    return false
  }

  // public delete() {
  //   this.url = 'https://png.pngitem.com/pimgs/s/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png'
  // }
  getAuthoringUrl(url: string): string {
    return url
      ? `/apis/authContent/${
      url.includes('/content-store/') ? new URL(url).pathname.slice(1) : encodeURIComponent(url)
      }`
      : ''
  }

  isDisabled() {
    if (this.profileForm.dirty || this.isEnable) {
      return false
    }
    return true
  }
  async onSubmit() {
    if (!(this.profileForm.controls.userFirstName.value.trim()).match(/^[A-Za-z\s]+$/)) {
      this.snackBar.open('Name is invalid or empty', '', {
        duration: 1000,
      })
    } else if (!(this.profileForm.controls.userOrganisation.value.trim())) {
      this.snackBar.open('Organisation is invalid or empty', '', {
        duration: 1000,
      })
    } else if (!(this.profileForm.controls.userRole.value.trim())) {
      this.snackBar.open('Current Role is invalid or empty', '', {
        duration: 1000,
      })
      } else if (this.domains.length === 0 || this.domains.length > 5) {
        this.snackBar.open('Domain is invalid or empty', '', {
          duration: 1000,
        })
        } else if (this.expertises.length === 0 || this.expertises.length > 5) {
          this.snackBar.open('Area of Expertise is invalid or empty', '', {
            duration: 1000,
          })
          }  else if (this.profileForm.valid) {
      this.isLoad = true
      // const domainDiff = this.actualDomains.filter(dom => !this.domains.includes(dom))
      // const expertiseDiff = this.actualExpertises.filter(exp => !this.expertises.includes(exp))
      // forkJoin({
      //   domains: this.profileSvc.deleteDomains(domainDiff),
      //   expertise: this.profileSvc.deteleExpertise(expertiseDiff),
      // }).subscribe(({}) => {
      // })
      const editresponse =
      await this.profileSvc.editProfile(this.userProfile.userId, this.profileForm.controls)
      this.isLoad = false
      if (editresponse.ok) {
        if (editresponse.DATA != null) {
          this.fetchInitialUserData()
          this.snackBar.open(editresponse.MESSAGE, '', {
            duration: 1000,
          })
          setTimeout(
            () => {
              if (this.enableSkip) {
                this.router.navigate(['/page/home'])
              } else {
                this.router.navigate(['/app/profile/dashboard'])
              }
            },
            1000
          )
        }
      } else {
        this.snackBar.open(editresponse.MESSAGE, '', {
          duration: 1000,
        })
      }
    }
  }
  fetchInitialUserData() {
    try {
      // this.initService.updatePidDetails()
      this.profileSvc.fecthDetailsFromPid()
    } catch (e) {
      this.snackBar.open('Reload to view latest changes', '', {
        duration: 1000,
      })
    }
  }
  skipToHomePage() {
    this.router.navigate(['/page/home'])
  }

  loadVideo() {
    if (this.configSvc.instanceConfig) {
      this.introVideos = this.configSvc.instanceConfig.introVideo
      this.appName = this.configSvc.instanceConfig.details.appName

    } if (this.configSvc.restrictedFeatures
      && !this.configSvc.restrictedFeatures.has('firstTimeSetupV2')) {
      this.isPartOfFirstTimeSetupV2 = true
    }

    this.locale = this.configSvc.userPreference && this.configSvc.userPreference.selectedLocale || ''
    this.locale = Object.keys(this.introVideos).includes(this.locale) ? this.locale : 'en'
    this.widgetResolverData = {
      ...this.widgetResolverData,
      widgetData: {
        ...this.widgetResolverData.widgetData,
        url: this.introVideos[this.locale],
      },
    }
  }

  add(event: MatChipInputEvent, chipList: any): void {
    const value = (event.value || '').trim()

    // Add
    if (value && value.length > 2 && !this.domains.some(dom => dom === value) && chipList.length < 5) {
      chipList.push(value)
    }
    this.profileForm.controls.userDomain.setValue(null)
    this.profileForm.controls.userDomain.setValue(chipList)
    event.input.value = ''
  }
  addExpertise(event: MatChipInputEvent, chipList: any): void {
    const value = (event.value || '').trim()

    // Add
    if (value && value.length > 2 && !this.expertises.some(dom => dom === value) && chipList.length < 5) {
      chipList.push(value)
    }
    this.profileForm.controls.userExpertise.setValue(null)
    this.profileForm.controls.userExpertise.setValue(chipList)
    event.input.value = ''
  }

  remove(chip: IChips, chipList: IChips[]): void {
    const index = chipList.indexOf(chip)

    if (index >= 0) {
      chipList.splice(index, 1)
    }
    this.profileForm.controls.userDomain.setValue(null)
    this.profileForm.controls.userDomain.setValue(chipList)
  }

  removeExpertise(chip: IChips, chipList: IChips[]): void {
    const index = chipList.indexOf(chip)

    if (index >= 0) {
      chipList.splice(index, 1)
    }
    this.profileForm.controls.userExpertise.setValue(null)
    this.profileForm.controls.userExpertise.setValue(chipList)
  }

  open(config?: MatDialogConfig) {
    return this.dialog.open(this.video, config)
  }

  subscribed(){
    this.profileForm.controls.isSubscribed.setValue(!this.profileForm.controls.isSubscribed.value)
  }
}
