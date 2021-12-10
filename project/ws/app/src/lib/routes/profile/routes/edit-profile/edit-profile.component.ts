
import { Component, OnInit, Input } from '@angular/core'
import { InitService } from 'src/app/services/init.service'
import { FormGroup, FormControl } from '@angular/forms'
import { ProfileService } from '../../services/profile.service'
import { MatSnackBar } from '@angular/material'
import { UploadService } from '../../../../../../../author/src/lib/routing/modules/editor/shared/services/upload.service'
import { CONTENT_BASE_STATIC } from '../../../../../../../author/src/lib/constants/apiEndpoints'
import { Router, ActivatedRoute } from '@angular/router'
import { FOLDER_NAME_EDIT_PROFILE } from '../../../../../../../author/src/lib/constants/constant'
import { ConfigurationsService, UtilityService } from '@ws-widget/utils/src/public-api'
import { IWidgetsPlayerMediaData } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import {MatChipInputEvent} from '@angular/material/chips';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
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
export interface Chips {
  name?: string;
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
  domains:Chips[] = []
  expertises:Chips[] = []
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
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
  constructor(
    private initService: InitService,
    private profileSvc: ProfileService,
    private uploadService: UploadService,
    private snackBar: MatSnackBar,
    private activateRoute: ActivatedRoute,
    private utilitySvc: UtilityService,
    private router: Router,
    private configSvc: ConfigurationsService
  ) { }
  url = ''
  profileUrlParams = ''
  relativeUrl = ''
  isEnable = false
  profileForm: FormGroup = new FormGroup({
    userFirstName: new FormControl(''),
    userOrganisation: new FormControl(''),
    userCountry: new FormControl(''),
    userRole: new FormControl(''),
    userDomain: new FormControl([]),
    userExpertise: new FormControl([]),
    sourceProfilePicture: new FormControl(''),
    profileLink: new FormControl('')
  })

  userProfile: any
  // userPropertiesData: NsEditProfile.IUserProperties = {} as NsEditProfile.IUserProperties
  isLoad = false

  ngOnInit() {
    //this.loadVideo();
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
    if (this.userProfile) {
      this.profileForm.controls.userFirstName.setValue(this.userProfile.givenName
        && this.userProfile.givenName !== 'null' ? this.userProfile.givenName : '' + ' ' +this.userProfile.lastName
        && this.userProfile.lastName !== 'null' ? this.userProfile.lastName : '')
      this.profileForm.controls.userOrganisation.setValue(this.userProfile.departmentName &&
        this.userProfile.departmentName !== 'null' ? this.userProfile.departmentName : '')
      this.profileForm.controls.userCountry.setValue('Afghanistan')
      this.profileForm.controls.userRole.setValue('dev')
      this.profileForm.controls['userDomain'].setValue(['dev'])
      this.profileForm.controls.userExpertise.setValue(['dev'])
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
    if (!(this.profileForm.controls.userFirstName.value.trim()).match(/^[A-Za-z]+$/)) {
      this.snackBar.open('First name is invalid or empty', '', {
        duration: 1000,
      })
    } else if (this.profileForm.valid) {
      this.isLoad = true
      const editresponse = await this.profileSvc.editProfile(this.userProfile.userId, this.profileForm.controls)
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
                this.router.navigate(['/app/setup/home/interest'])
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
    this.router.navigate(['/app/setup/home/interest'])
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
    const value = (event.value || '').trim();

    // Add our fruit
    if (value && !this.domains.some(dom => dom.name === value) && chipList.length <= 5) {
      chipList.push({name: value});
    }

    // Clear the input value
    event.input.value = '';
  }

  remove(chip: Chips, chipList: Chips[]): void {
    const index = chipList.indexOf(chip);

    if (index >= 0) {
      chipList.splice(index, 1);
    }
  }
}
