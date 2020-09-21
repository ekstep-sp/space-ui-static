
import { Component, OnInit } from '@angular/core'
import { InitService } from 'src/app/services/init.service'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { ProfileService } from '../../services/profile.service'
import { MatSnackBar } from '@angular/material'
import { UploadService } from '../../../../../../../author/src/lib/routing/modules/editor/shared/services/upload.service'
import { CONTENT_BASE_STATIC } from '../../../../../../../author/src/lib/constants/apiEndpoints'
import { ActivatedRoute } from '@angular/router'
import { FOLDER_NAME_EDIT_PROFILE } from '../../../../../../../author/src/lib/constants/constant'

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
@Component({
  selector: 'ws-app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent implements OnInit {
  paramsForEditProfile: NsEditProfile.IResponseBody = {} as NsEditProfile.IResponseBody
  constructor(private initService: InitService,
    private profileSvc: ProfileService,
    private uploadService: UploadService,
    private snackBar: MatSnackBar,
    private activateRoute: ActivatedRoute) { }
  url = ''
  profileUrlParams = ''
  relativeUrl = ''
  isEnable = false
  profileForm: FormGroup = new FormGroup({
    userFirstName: new FormControl(''),
    userOrganisation: new FormControl(''),
    email: new FormControl({ value: '', disabled: true }),
    profileLink: new FormControl(''),
    bio: new FormControl('', Validators.maxLength(1000)),
    userLastName: new FormControl(''),
    sourceProfilePicture: new FormControl(''),
  })
  userProfile: any
  // userPropertiesData: NsEditProfile.IUserProperties = {} as NsEditProfile.IUserProperties
  isLoad = false
  ngOnInit() {

    this.userProfile = this.initService.getUserProfile()
    if (this.userProfile) {
      this.profileForm.controls.userFirstName.setValue(this.userProfile.givenName)
      this.profileForm.controls.userOrganisation.setValue(this.userProfile.departmentName)
      this.profileForm.controls.userLastName.setValue(this.userProfile.lastName)
      this.profileForm.controls.email.setValue(this.userProfile.email)
      if (this.userProfile.userProperties) {
        this.profileForm.controls.bio.setValue(this.userProfile.userProperties.bio)
        this.profileForm.controls.profileLink.setValue(this.userProfile.userProperties.profileLink)
      }
      if (this.userProfile.source_profile_picture) {
        this.profileForm.controls.sourceProfilePicture.setValue(this.userProfile.source_profile_picture)
        this.url = this.getAuthoringUrl(this.userProfile.source_profile_picture)
      }
    }
    this.activateRoute.data.subscribe(data => {
      if (data.pageData) {
        this.profileSvc.setUserEditProfileConfig(data.pageData.data)
        this.relativeUrl = data.pageData.data.profileImage
      }
    })
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
          this.snackBar.open(editresponse.MESSAGE, '', {
            duration: 1000,
          })
        }
      } else {
        this.snackBar.open(editresponse.MESSAGE, '', {
          duration: 1000,
        })
      }
    }
  }
}
