import { ISearchContent } from './../../../../../../interface/search'
import { COMMA, ENTER } from '@angular/cdk/keycodes'
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  AfterViewChecked,
} from '@angular/core'
import { FormBuilder, FormControl, FormGroup } from '@angular/forms'
import { MatAutocompleteSelectedEvent } from '@angular/material'
import { MatChipInputEvent } from '@angular/material/chips'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { VIEWER_ROUTE_FROM_MIME } from '@ws-widget/collection/src/public-api'
import { ConfigurationsService, ImageCropComponent, ValueService } from '@ws-widget/utils'
import { CONTENT_BASE_STATIC } from '@ws/author/src/lib/constants/apiEndpoints'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { IMAGE_MAX_SIZE, IMAGE_SUPPORT_TYPES } from '@ws/author/src/lib/constants/upload'
import { NSContent } from '@ws/author/src/lib/interface/content'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { EditorContentService } from '@ws/author/src/lib/routing/modules/editor/services/editor-content.service'
import { EditorService } from '@ws/author/src/lib/routing/modules/editor/services/editor.service'
import { Observable, of, Subscription, Subject } from 'rxjs'
import { InterestService } from '../../../../../../../../../app/src/lib/routes/profile/routes/interest/services/interest.service'
import { UploadService } from '../../services/upload.service'
import { CatalogSelectComponent } from '../catalog-select/catalog-select.component'
import { IFormMeta } from './../../../../../../interface/form'
import { AccessControlService } from './../../../../../../modules/shared/services/access-control.service'
import { AuthInitService } from './../../../../../../services/init.service'
import { LoaderService } from './../../../../../../services/loader.service'
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  startWith,
  switchMap,
  map,
  pairwise,
  delay,
} from 'rxjs/operators'
import { FeedbackFormComponent } from '@ws/author/src/lib/modules/shared/components/feedback-form/feedback-form.component'
import { LicenseInfoDisplayDialogComponent } from '../license-info-display-dialog/license-info-display-dialog.component'
import { AssetTypeInfoDisplayDialogComponent } from '../asset-type-info-display-dialog/asset-type-info-display-dialog.component'
import { ActivatedRoute } from '@angular/router'
import { cloneDeep } from 'lodash'
import { CollectionResolverService } from '../../../routing/modules/collection/services/resolver.service'

interface ILicenseMetaInfo {
  parent: string[],
  details: string,
  name: string,
  link: string,
}

interface ICurrentLicenseDialogInfo {
  details: string,
  name: string
}

interface IAssetTypeMetaInfo {
  type: string,
  description: string
}

@Component({
  selector: 'ws-auth-edit-meta',
  templateUrl: './edit-meta.component.html',
  styleUrls: ['./edit-meta.component.scss'],
})
export class EditMetaComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {
  contentMeta!: NSContent.IContentMeta
  isMobile = false
  promptUserForAssetType = false
  @Output() data = new EventEmitter<string>()
  @Input() isSubmitPressed = false
  @Input() nextAction = 'done'
  contentTracker = {
    previousContent: '',
  }
  displayRadioSystem = false
  assetRelatedTabsUpdated = false
  previousAssetType = ''
  clearArtifactForm = false
  spaceLicenseTnCAgreed = false
  displayPolicyForm = false
  location = CONTENT_BASE_STATIC
  selectable = true
  removable = true
  addOnBlur = true
  addConcepts = false
  isFileUploaded = false
  fileUploadForm!: FormGroup
  creatorContactsCtrl!: FormControl
  prePostContentsCtrl = new FormControl()
  skillCtrl = new FormControl()
  trackContactsCtrl!: FormControl
  publisherDetailsCtrl!: FormControl
  editorsCtrl!: FormControl
  creatorDetailsCtrl!: FormControl
  audienceCtrl!: FormControl
  jobProfileCtrl!: FormControl
  regionCtrl!: FormControl
  accessPathsCtrl!: FormControl
  keywordsCtrl!: FormControl
  contentForm!: FormGroup
  selectedSkills: string[] = []
  canUpdate = true
  ordinals!: any
  resourceTypes: string[] = []
  employeeList: any[] = []
  contentList: ISearchContent[] = []
  audienceList: any[] = []
  jobProfileList: any[] = []
  regionList: any[] = []
  accessPathList: any[] = []
  infoType = ''
  isClient1 = false
  isClient2 = false
  fetchTagsStatus: 'done' | 'fetching' | null = null
  readonly separatorKeysCodes: number[] = [ENTER, COMMA]
  selectedIndex = 0
  hours = 0
  minutes = 0
  seconds = 0
  technologyAssetFormEnabled = false
  connectionAssetFormEnabled = false
  knowledgeAssetFormEnabled = false
  currentLicenseList: [string] = ['']
  @Input() parentContent: string | null = null
  routerSubscription!: Subscription
  imageTypes = IMAGE_SUPPORT_TYPES
  canExpiry = true
  showMoreGlance = false
  complexityLevelList: string[] = []
  isEditEnabled = false
  minDate = new Date(new Date().setDate(new Date().getDate() + 1))
  licenseMetaList: ILicenseMetaInfo[] | any[] = []
  currentLicenseData: ICurrentLicenseDialogInfo[] | undefined = undefined
  assestTypeMetaData: IAssetTypeMetaInfo[] | any[] = []
  currentAssestTypeData: IAssetTypeMetaInfo[] | undefined = undefined
  showOther = false
  staticValidation$: any
  allowedToCatalog = true

  @ViewChild('creatorContactsView', { static: false }) creatorContactsView!: ElementRef
  @ViewChild('trackContactsView', { static: false }) trackContactsView!: ElementRef
  @ViewChild('publisherDetailsView', { static: false }) publisherDetailsView!: ElementRef
  @ViewChild('editorsView', { static: false }) editorsView!: ElementRef
  @ViewChild('creatorDetailsView', { static: false }) creatorDetailsView!: ElementRef
  @ViewChild('audienceView', { static: false }) audienceView!: ElementRef
  @ViewChild('jobProfileView', { static: false }) jobProfileView!: ElementRef
  @ViewChild('regionView', { static: false }) regionView!: ElementRef
  @ViewChild('accessPathsView', { static: false }) accessPathsView!: ElementRef
  @ViewChild('keywordsSearch', { static: true }) keywordsSearch!: ElementRef<any>
  skillList = <any[]>[]

  timer: any
  showRoleRequest = false
  allowedRoles: any
  notAllowedRoles: any
  filteredOptions$: Observable<string[]> = of([])
  mycustomObs: Subject<boolean> | null = null
  tabTracker$: any = null

  constructor(
    private formBuilder: FormBuilder,
    private uploadService: UploadService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private editorService: EditorService,
    private contentService: EditorContentService,
    private configSvc: ConfigurationsService,
    private ref: ChangeDetectorRef,
    private interestSvc: InterestService,
    private loader: LoaderService,
    private authInitService: AuthInitService,
    private accessService: AccessControlService,
    private valueSvc: ValueService,
    private route: ActivatedRoute,
    public editorSvc: CollectionResolverService,
  ) {
    this.contentTracker.previousContent = this.contentService.currentContent
  }

  ngAfterViewInit() {
    this.ref.detach()
    this.timer = setInterval(() => {
      this.ref.detectChanges()
      // tslint:disable-next-line: align
    }, 100)
    this.mycustomObs = new Subject<any>()
    this.trackTabChanges()
  }
  trackTabChanges() {
    if (this.mycustomObs) {
      this.tabTracker$ = this.mycustomObs.pipe(delay(100)).subscribe(response => {
        this.dispatchEventForSideNav()
      })
    }
  }
  ngAfterViewChecked() {
    if (this.mycustomObs) {
      this.mycustomObs.next(true)
    }
  }

  ngOnInit() {
    this.editorSvc.sideNavStatus.subscribe(() => {
      this.dispatchEventForSideNav()
    })
    this.route.data.subscribe(data => {
      this.allowedRoles = data.pageData.data.allowedRoles
      this.notAllowedRoles = data.pageData.data.notAllowedRoles
    })
    this.staticValidation$ = this.contentService.staticValidationEvent.pipe(filter(v => v))
    this.staticValidation$.subscribe((_: any) => {
      this.emitPushEvent()
    })
    this.valueSvc.isXSmall$.subscribe(isMobile => (this.isMobile = isMobile))
    this.showRoleRequest = this.authInitService.authAdditionalConfig.allowRoleRequest
    this.isClient1 = this.accessService.rootOrg.toLowerCase() === 'client1'
    this.isClient2 = this.accessService.rootOrg.toLowerCase() === 'client2'
    this.ordinals = this.authInitService.ordinals
    this.audienceList = this.ordinals.audience
    this.jobProfileList = this.ordinals.jobProfile
    this.complexityLevelList = this.ordinals.audience
    this.processLicenseDetails()

    this.processAssetTypeDetails()

    this.creatorContactsCtrl = new FormControl()
    this.trackContactsCtrl = new FormControl()
    this.publisherDetailsCtrl = new FormControl()
    this.editorsCtrl = new FormControl()
    this.creatorDetailsCtrl = new FormControl()
    this.keywordsCtrl = new FormControl('')

    this.audienceCtrl = new FormControl()
    this.jobProfileCtrl = new FormControl()
    this.regionCtrl = new FormControl()
    this.accessPathsCtrl = new FormControl()
    this.accessPathsCtrl.disable()
    this.prePostContentsCtrl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter(val => typeof val === 'string'),
        switchMap((value: string) => {
          if (typeof value === 'string' && value) {
            this.contentList = <ISearchContent[]>[]
            this.fetchTagsStatus = 'fetching'
            return this.editorService.searchV6Content(
              value,
              this.contentMeta && this.contentMeta.locale ? this.contentMeta.locale : 'en',
            )
          }
          return of([])
        }),
      )
      .subscribe(
        (content: ISearchContent[]) => {
          this.contentList = content || <string[]>[]
          this.fetchTagsStatus = 'done'
        },
        () => {
          this.fetchTagsStatus = 'done'
        },
      )
    this.skillCtrl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter(val => typeof val === 'string'),
        switchMap((value: string) => {
          if (typeof value === 'string' && value) {
            this.skillList = <any[]>[]
            this.fetchTagsStatus = 'fetching'
            return this.editorService.searchSkills(value)
          }
          return of([])
        }),
      )
      .subscribe(
        (content: any[]) => {
          this.skillList = content || <any[]>[]
          this.fetchTagsStatus = 'done'
        },
        () => {
          this.fetchTagsStatus = 'done'
        },
      )
    this.creatorContactsCtrl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter(val => typeof val === 'string'),
        switchMap((value: string) => {
          if (typeof value === 'string' && value) {
            this.employeeList = <any[]>[]
            this.fetchTagsStatus = 'fetching'
            return this.editorService.fetchCuratorList(value)
          }
          return of([])
        }),
      )
      .subscribe(
        users => {
          this.employeeList = users || <string[]>[]
          this.fetchTagsStatus = 'done'
        },
        () => {
          this.fetchTagsStatus = 'done'
        },
      )

    this.trackContactsCtrl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter(val => typeof val === 'string'),
        switchMap((value: string) => {
          if (typeof value === 'string' && value) {
            this.employeeList = <any[]>[]
            this.fetchTagsStatus = 'fetching'
            return this.editorService.fetchEmployeeList(value)
          }
          return of([])
        }),
      )
      .subscribe(
        users => {
          this.employeeList = users || <string[]>[]
          this.fetchTagsStatus = 'done'
        },
        () => {
          this.fetchTagsStatus = 'done'
        },
      )

    this.publisherDetailsCtrl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter(val => typeof val === 'string'),
        switchMap((value: string) => {
          if (typeof value === 'string' && value) {
            this.employeeList = <any[]>[]
            this.fetchTagsStatus = 'fetching'
            return this.editorService.fetchPublishersList(value)
          }
          return of([])
        }),
      )
      .subscribe(
        users => {
          this.employeeList = users || <string[]>[]
          this.fetchTagsStatus = 'done'
        },
        () => {
          this.fetchTagsStatus = 'done'
        },
      )

    this.editorsCtrl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter(val => typeof val === 'string'),
        switchMap((value: string) => {
          if (typeof value === 'string' && value) {
            this.employeeList = <any[]>[]
            this.fetchTagsStatus = 'fetching'
            return this.editorService.fetchEmployeeList(value)
          }
          return of([])
        }),
      )
      .subscribe(
        users => {
          this.employeeList = users || <string[]>[]
          this.fetchTagsStatus = 'done'
        },
        () => {
          this.fetchTagsStatus = 'done'
        },
      )

    this.creatorDetailsCtrl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter(val => typeof val === 'string'),
        switchMap((value: string) => {
          if (typeof value === 'string' && value) {
            this.employeeList = <any[]>[]
            this.fetchTagsStatus = 'fetching'
            return this.editorService.fetchEmployeeList(value)
          }
          return of([])
        }),
      )
      .subscribe(
        users => {
          this.employeeList = users || <string[]>[]
          this.fetchTagsStatus = 'done'
        },
        () => {
          this.fetchTagsStatus = 'done'
        },
      )

    this.audienceCtrl.valueChanges.subscribe(() => this.fetchAudience())

    this.jobProfileCtrl.valueChanges.subscribe(() => this.fetchJobProfile())

    this.regionCtrl.valueChanges
      .pipe(
        debounceTime(400),
        filter(v => v),
      )
      .subscribe(() => this.fetchRegion())

    this.accessPathsCtrl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter(val => typeof val === 'string'),
        switchMap((value: string) => {
          if (typeof value === 'string' && value) {
            this.accessPathList = <string[]>[]
            this.fetchTagsStatus = 'fetching'
            return this.editorService.getAccessPath()
          }
          return of([])
        }),
      )
      .subscribe(
        paths => {
          this.accessPathList = paths.filter(v =>
            v.toLowerCase().includes(this.accessPathsCtrl.value.toLowerCase()),
          )
          this.fetchTagsStatus = 'done'
        },
        () => {
          this.fetchTagsStatus = 'done'
        },
      )

    this.contentService.changeActiveCont.subscribe(data => {
      this.content = this.contentService.getUpdatedMeta(data)
      if (!this.assetRelatedTabsUpdated) {
        this.setDefaultTabsAndFormConfigs()
      }
      if (this.contentMeta && this.canUpdate) {
        this.storeData()
      }
    })

    this.filteredOptions$ = this.keywordsCtrl.valueChanges.pipe(
      startWith(this.keywordsCtrl.value),
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(value => this.interestSvc.fetchAutocompleteInterestsV2(value)),
    )
  }

  processLicenseDetails() {
    if (Array.isArray(this.authInitService.licenseMeta)) {
      this.licenseMetaList = [...this.authInitService.licenseMeta] as never[]
    }
  }

  processAssetTypeDetails() {
    if (Array.isArray(this.authInitService.assetTypeMeta)) {
      this.assestTypeMetaData = [...this.authInitService.assetTypeMeta] as never[]
    }
  }
  optionSelected(keyword: string) {
    this.keywordsCtrl.setValue(' ')
    // this.keywordsSearch.nativeElement.blur()
    if (keyword && keyword.length) {
      const value = this.contentForm.controls.keywords.value || []
      if (value.indexOf(keyword) === -1) {
        value.push(keyword)
        this.contentForm.controls.keywords.setValue(value)
      }
    }
  }

  ngOnDestroy() {
    if (this.staticValidation$) {
      this.staticValidation$.unsubscribe()
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe()
    }
    this.loader.changeLoad.next(false)
    this.ref.detach()
    clearInterval(this.timer)
  }

  private set content(contentMeta: NSContent.IContentMeta) {
    this.contentMeta = contentMeta
    // tslint:disable-next-line: prefer-template
    this.isEditEnabled = this.contentService.isAllowedToEdit(
      contentMeta,
      false,
      this.parentContent ? this.contentService.getUpdatedMeta(this.parentContent) : undefined,
    )
    this.contentMeta.name = contentMeta.name === 'Untitled Content' ? '' : contentMeta.name
    this.canExpiry = this.contentMeta.expiryDate !== '99991231T235959+0000'
    if (this.canExpiry) {
      this.contentMeta.expiryDate =
        contentMeta.expiryDate && contentMeta.expiryDate.indexOf('+') === 15
          ? <any>this.convertToISODate(contentMeta.expiryDate)
          : ''
    }
    const date = (this.contentMeta.expiryDate as any) as Date
    if (this.minDate > date) {
      this.contentMeta.expiryDate = new Date(this.minDate) as any
    }
    this.assignFields()
    this.setDuration(contentMeta.duration || 0)
    this.filterOrdinals()
    // this.changeResourceType()
  }

  filterOrdinals() {
    this.complexityLevelList = []
    this.ordinals.complexityLevel.map((v: any) => {
      if (v.condition) {
        let canAdd = false
          // tslint:disable-next-line: whitespace
          ; (v.condition.showFor || []).map((con: any) => {
            let innerCondition = false
            Object.keys(con).map(meta => {
              if (
                con[meta].indexOf(
                  (this.contentForm.controls[meta] && this.contentForm.controls[meta].value) ||
                  this.contentMeta[meta as keyof NSContent.IContentMeta],
                ) > -1
              ) {
                innerCondition = true
              }
            })
            if (innerCondition) {
              canAdd = true
            }
          })
        if (canAdd) {
          // tslint:disable-next-line: semicolon // tslint:disable-next-line: whitespace
          ; (v.condition.nowShowFor || []).map((con: any) => {
            let innerCondition = false
            Object.keys(con).map(meta => {
              if (
                con[meta].indexOf(
                  (this.contentForm.controls[meta] && this.contentForm.controls[meta].value) ||
                  this.contentMeta[meta as keyof NSContent.IContentMeta],
                ) < 0
              ) {
                innerCondition = true
              }
            })
            if (innerCondition) {
              canAdd = false
            }
          })
        }
        if (canAdd) {
          this.complexityLevelList.push(v.value)
        }
      } else {
        if (typeof v === 'string') {
          this.complexityLevelList.push(v)
        } else {
          this.complexityLevelList.push(v.value)
        }
      }
    })
  }

  /* populateSubmittedByInCreators() {
    // add a new default object in curators field which will be same as current logged in user
    if (this.contentMeta.status !== 'Reviewed' && this.configSvc.userProfile) {
      // only add the current user if it is not present in the list already
      if (this.contentMeta.creatorContacts.findIndex(contact => contact.id === (this.configSvc.userProfile as any).userId) < 0) {
        this.contentForm.controls.creatorContacts.setValue([...this.contentForm.controls.creatorContacts.value, {
          name: this.configSvc.userProfile ? this.configSvc.userProfile.userName : '',
          email: this.configSvc.userProfile ? this.configSvc.userProfile.email : '',
          id: this.configSvc.userProfile ? this.configSvc.userProfile.userId : '',
        }])
      }
    }
  } */

  assignExpiryDate() {
    this.canExpiry = !this.canExpiry
    this.contentForm.controls.expiryDate.setValue(
      this.canExpiry
        ? new Date(new Date().setMonth(new Date().getMonth() + 6))
        : '99991231T235959+0000',
    )
  }
  assignFields() {
    if (!this.contentForm) {
      this.createForm()
    }
    this.canUpdate = false
    Object.keys(this.contentForm.controls).map(v => {
      try {
        if (
          this.contentMeta[v as keyof NSContent.IContentMeta] ||
          (this.authInitService.authConfig[v as keyof IFormMeta].type === 'boolean' &&
            this.contentMeta[v as keyof NSContent.IContentMeta] === false)
        ) {
          this.contentForm.controls[v].setValue(this.contentMeta[v as keyof NSContent.IContentMeta])
          /* if (v === 'creatorContacts') {
            this.populateSubmittedByInCreators()
          } */
        } else {
          if (v === 'expiryDate') {
            this.contentForm.controls[v].setValue(
              new Date(new Date().setMonth(new Date().getMonth() + 6)),
            )
          } else {
            this.contentForm.controls[v].setValue(
              JSON.parse(
                JSON.stringify(
                  this.authInitService.authConfig[v as keyof IFormMeta].defaultValue[
                    this.contentMeta.contentType
                    // tslint:disable-next-line: ter-computed-property-spacing
                  ][0].value,
                ),
              ),
            )
          }
        }
        if (this.isSubmitPressed) {
          this.contentForm.controls[v].markAsDirty()
          this.contentForm.controls[v].markAsTouched()
        } else {
          this.contentForm.controls[v].markAsPristine()
          this.contentForm.controls[v].markAsUntouched()
        }
      } catch (ex) { }
    })
    this.canUpdate = true
    this.storeData()
    if (this.isSubmitPressed) {
      this.contentForm.markAsDirty()
      this.contentForm.markAsTouched()
    } else {
      this.contentForm.markAsPristine()
      this.contentForm.markAsUntouched()
    }
  }

  convertToISODate(date = ''): Date {
    try {
      return new Date(
        `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}${date.substring(
          8,
          11,
        )}:${date.substring(11, 13)}:${date.substring(13, 15)}.000Z`,
      )
    } catch (ex) {
      return new Date(new Date().setMonth(new Date().getMonth() + 6))
    }
  }

  changeMimeType() {
    const artifactUrl =
      this.contentService.getUpdatedMeta(this.contentMeta.identifier).artifactUrl || ''
    if (this.contentForm.controls.contentType.value === 'Course') {
      this.contentForm.controls.mimeType.setValue('application/vnd.ekstep.content-collection')
    } else {
      // this.contentForm.controls.mimeType.setValue('application/html')
      if (
        this.configSvc.instanceConfig &&
        this.configSvc.instanceConfig.authoring &&
        this.configSvc.instanceConfig.authoring.urlPatternMatching
      ) {
        this.configSvc.instanceConfig.authoring.urlPatternMatching.map(v => {
          if (artifactUrl.match(v.pattern) && v.allowIframe && v.source === 'youtube') {
            this.contentForm.controls.mimeType.setValue('video/x-youtube')
          }
        })
      }
    }
  }

  // changeResourceType() {
  //   if (this.contentForm.controls.contentType.value === 'Resource') {
  //     this.resourceTypes = this.ordinals.resourceType
  //   } else {
  //     this.resourceTypes = this.ordinals['Offering Mode']
  //   }

  //   if (this.resourceTypes.indexOf(this.contentForm.controls.categoryType.value) < 0) {
  //     this.contentForm.controls.resourceType.setValue('')
  //   }
  // }

  private setDuration(seconds: any) {
    const minutes = seconds > 59 ? Math.floor(seconds / 60) : 0
    const second = seconds % 60
    this.hours = minutes ? (minutes > 59 ? Math.floor(minutes / 60) : 0) : 0
    this.minutes = minutes ? minutes % 60 : 0
    this.seconds = second || 0
  }

  timeToSeconds() {
    let total = 0
    total += this.seconds ? (this.seconds < 60 ? this.seconds : 59) : 0
    total += this.minutes ? (this.minutes < 60 ? this.minutes : 59) * 60 : 0
    total += this.hours ? this.hours * 60 * 60 : 0
    this.contentForm.controls.duration.setValue(total)
  }

  showInfo(type: string) {
    this.infoType = this.infoType === type ? '' : type
  }

  getCurrentMeta() {
    const currentFormData = JSON.parse(JSON.stringify(this.contentForm.value))
    const updatedMEtaFromseperateComponents = this.contentService.getUpdatedMeta(this.contentService.currentContent)
    const finalCurrentMeta = {
      ...currentFormData,
      mimeType: updatedMEtaFromseperateComponents.mimeType,
      artifactUrl: updatedMEtaFromseperateComponents.artifactUrl,
      artifactUploadUrl: updatedMEtaFromseperateComponents.artifactUploadUrl,
      artifactLinkUrl: updatedMEtaFromseperateComponents.artifactLinkUrl,

    }
    return cloneDeep(finalCurrentMeta)
  }

  storeData() {
    try {
      const meta = <any>{}
      const currentMeta: NSContent.IContentMeta = this.getCurrentMeta()
      const originalMeta = this.contentService.getOriginalMeta(this.contentMeta.identifier)
      if (originalMeta && this.isEditEnabled) {
        const expiryDate = this.contentForm.value.expiryDate
        if (this.canExpiry) {
          currentMeta.expiryDate = `${
            expiryDate.toISOString().replace(/-/g, '').replace(/:/g, '').split('.')[0]
            }+0000`
        }
        Object.keys(currentMeta).map(v => {
          if (v === 'sourceName') {
            meta[v] = currentMeta[v]
          }
          if (v === 'spaceLicense') {
            meta[v] = currentMeta[v]
          }
          if (
            JSON.stringify(currentMeta[v as keyof NSContent.IContentMeta]) !==
            JSON.stringify(originalMeta[v as keyof NSContent.IContentMeta])
          ) {
            if (
              currentMeta[v as keyof NSContent.IContentMeta] ||
              (this.authInitService.authConfig[v as keyof IFormMeta].type === 'boolean' &&
                currentMeta[v as keyof NSContent.IContentMeta] === false)
            ) {
              meta[v as keyof NSContent.IContentMeta] = currentMeta[v as keyof NSContent.IContentMeta]
            } else {
              meta[v as keyof NSContent.IContentMeta] = JSON.parse(
                JSON.stringify(
                  this.authInitService.authConfig[v as keyof IFormMeta].defaultValue[
                    originalMeta.contentType
                    // tslint:disable-next-line: ter-computed-property-spacing
                  ][0].value,
                ),
              )
            }
          }
        })
        // handle mimeType status for different assetType
        const newMeta = this.handleMimeTypeBeforeStore(meta) as NSContent.IContentMeta
        this.contentService.setUpdatedMeta(newMeta, this.contentMeta.identifier)
        // cons?ole.log(newMeta)
      } else if (this.showAccToRoles('catalogPath')) {
        meta.catalogPaths = []
        meta.catalogPaths = [...currentMeta.catalogPaths]
        this.contentService.setUpdatedMeta(meta, this.contentMeta.identifier)
      }
    } catch (e) {
      throw new Error(e)
      // console.error('Error occured while saving data ', e)
    }
  }

  handleMimeTypeBeforeStore(meta: NSContent.IContentMeta) {
    if (['Technology'].includes(this.contentForm.controls.assetType.value)) {
      meta.mimeType = 'application/html'
    }
    return meta
  }

  updateContentService(meta: string, value: any, event = false) {
    this.contentForm.controls[meta].setValue(value, { events: event })
    this.contentService.setUpdatedMeta({ [meta]: value } as any, this.contentMeta.identifier)
  }

  formNext(index: number) {
    if (index >= 4 && !this.contentForm.controls.spaceLicenseTnCAgreed.value) {
      this.triggerLTNCNotification()
    } else {
      this.selectedIndex = index
    }
  }

  triggerLTNCNotification() {
    this.snackBar.openFromComponent(NotificationComponent, {
      data: {
        type: Notify.ACCEPT_LICENSE_TNC,
      },
      duration: NOTIFICATION_TIME * 1000,
    })
  }

  addKeyword(event: MatChipInputEvent): void {
    const input = event.input
    event.value
      .split(/[,]+/)
      .map((val: string) => val.trim())
      .forEach((value: string) => this.optionSelected(value))
    input.value = ''
  }

  addContent(event: MatAutocompleteSelectedEvent, meta: string): void {
    const value = this.contentForm.controls[meta].value || []
    if (value.find((v: { identifier: string }) => v.identifier === event.option.value.identifier)) {
      return
    }
    value.push({
      identifier: event.option.value.identifier,
      name: event.option.value.name,
    })
    this.contentForm.controls[meta].setValue(value)
    this.prePostContentsCtrl.setValue(null)
  }

  addReferences(event: MatChipInputEvent): void {
    const input = event.input
    const value = event.value

    // Add our fruit
    if ((value || '').trim().length) {
      const oldArray = this.contentForm.controls.references.value || []
      oldArray.push({ title: '', url: value })
      this.contentForm.controls.references.setValue(oldArray)
    }

    // Reset the input value
    if (input) {
      input.value = ''
    }
  }

  removeKeyword(keyword: any): void {
    const index = this.contentForm.controls.keywords.value.indexOf(keyword)
    this.contentForm.controls.keywords.value.splice(index, 1)
    this.contentForm.controls.keywords.setValue(this.contentForm.controls.keywords.value)
  }

  remove(index: number, meta: string): void {
    this.contentForm.controls[meta].value.splice(index, 1)
    this.contentForm.controls[meta].setValue(this.contentForm.controls[meta].value)
  }

  compareSkillFn(value1: { identifier: string }, value2: { identifier: string }) {
    return value1 && value2 ? value1.identifier === value2.identifier : value1 === value2
  }

  addCreatorDetails(event: MatChipInputEvent): void {
    const input = event.input
    const value = (event.value || '').trim()
    if (value) {
      this.contentForm.controls.creatorDetails.value.push({ id: '', name: value })
      this.contentForm.controls.creatorDetails.setValue(
        this.contentForm.controls.creatorDetails.value,
      )
    }
    // Reset the input value
    if (input) {
      input.value = ''
    }
  }

  removeCreatorDetails(keyword: any): void {
    const index = this.contentForm.controls.creatorDetails.value.indexOf(keyword)
    this.contentForm.controls.creatorDetails.value.splice(index, 1)
    this.contentForm.controls.creatorDetails.setValue(
      this.contentForm.controls.creatorDetails.value,
    )
  }
  addToForm(event: MatAutocompleteSelectedEvent, meta: string) {
    const value = this.contentForm.controls[meta].value || []
    if (value.find((v: { identifier: string }) => v.identifier === event.option.value.identifier)) {
      return
    }
    value.push(event.option.value)
    this.contentForm.controls[meta].setValue(value)
    this.prePostContentsCtrl.setValue(null)
  }
  addToFormControl(event: MatAutocompleteSelectedEvent, fieldName: string): void {
    const value = (event.option.value || '').trim()
    if (value && this.contentForm.controls[fieldName].value.indexOf(value) === -1) {
      this.contentForm.controls[fieldName].value.push(value)
      this.contentForm.controls[fieldName].setValue(this.contentForm.controls[fieldName].value)
    }

    this[`${fieldName}View` as keyof EditMetaComponent].nativeElement.value = ''
    this[`${fieldName}Ctrl` as keyof EditMetaComponent].setValue(null)
  }

  removeFromFormControl(keyword: any, fieldName: string): void {
    const index = this.contentForm.controls[fieldName].value.indexOf(keyword)
    this.contentForm.controls[fieldName].value.splice(index, 1)
    this.contentForm.controls[fieldName].setValue(this.contentForm.controls[fieldName].value)
  }

  conceptToggle() {
    this.addConcepts = !this.addConcepts
  }

  uploadAppIcon(file: File) {
    const formdata = new FormData()
    const fileName = file.name.replace(/[^A-Za-z0-9.]/g, '')
    if (!(IMAGE_SUPPORT_TYPES.indexOf(`.${fileName.toLowerCase().split('.').pop()}`) > -1)) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.INVALID_FORMAT,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
      return
    }

    if (file.size > IMAGE_MAX_SIZE) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.SIZE_ERROR,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
      return
    }

    const dialogRef = this.dialog.open(ImageCropComponent, {
      width: '70%',
      data: {
        isRoundCrop: false,
        imageFile: file,
        width: 265,
        height: 150,
        isThumbnail: true,
        imageFileName: fileName,
      },
    })
    dialogRef.afterClosed().subscribe({
      next: (result: File) => {
        if (result) {
          formdata.append('content', result, fileName)
          this.loader.changeLoad.next(true)
          this.uploadService
            .upload(formdata, {
              contentId: this.contentMeta.identifier,
              contentType: CONTENT_BASE_STATIC,
            })
            .subscribe(
              data => {
                if (data.code) {
                  this.loader.changeLoad.next(false)
                  this.canUpdate = false
                  this.contentForm.controls.appIcon.setValue(data.artifactURL)
                  this.contentForm.controls.thumbnail.setValue(data.artifactURL)
                  this.contentForm.controls.posterImage.setValue(data.artifactURL)
                  this.canUpdate = true
                  this.storeData()
                  this.snackBar.openFromComponent(NotificationComponent, {
                    data: {
                      type: Notify.UPLOAD_SUCCESS,
                    },
                    duration: NOTIFICATION_TIME * 1000,
                  })
                }
              },
              () => {
                this.loader.changeLoad.next(false)
                this.snackBar.openFromComponent(NotificationComponent, {
                  data: {
                    type: Notify.UPLOAD_FAIL,
                  },
                  duration: NOTIFICATION_TIME * 1000,
                })
              },
            )
        }
      },
    })
  }

  changeToDefaultImg($event: any) {
    // console.log($event.target.value)
    $event.target.src = this.configSvc.instanceConfig
      ? this.configSvc.instanceConfig.logos.defaultContent
      : ''
  }

  showError(meta: string) {
    /* if (meta === 'sourceName') {
      console.log('required ', this.contentService.checkCondition(this.contentMeta.identifier, meta, 'required'))
      console.log('isnotPresent ', !this.contentService.isPresent(meta, this.contentMeta.identifier))
      console.log('isSubmitted ', this.isSubmitPressed)
      console.log('meta value ', this.contentForm.controls[meta].value)
      console.log('istouched ', this.contentForm.controls[meta].touched)
    } */
    if (
      this.contentService.checkCondition(this.contentMeta.identifier, meta, 'required') &&
      !this.contentService.isPresent(meta, this.contentMeta.identifier)
    ) {
      if (this.isSubmitPressed) {
        return true
      }
      if (this.contentForm.controls[meta] && this.contentForm.controls[meta].touched) {
        return true
      }
      return false
    }
    return false
  }

  removeEmployee(employee: NSContent.IAuthorDetails, field: string): void {
    const value =
      this.contentForm.controls[field].value.filter((v: { id: string }) => v.id !== employee.id) ||
      []
    this.contentForm.controls[field].setValue(value)
  }

  addEmployee(event: MatAutocompleteSelectedEvent, field: string) {
    if (event.option.value && event.option.value.id) {
      this.loader.changeLoad.next(true)
      const observable =
        ['trackContacts', 'publisherDetails'].includes(field) &&
          this.accessService.authoringConfig.doUniqueCheck
          ? this.editorService
            .checkRole(event.option.value.id)
            .pipe(
              map(
                (v: string[]) =>
                  v.includes('admin') ||
                  v.includes('editor') ||
                  (field === 'trackContacts' && v.includes('reviewer')) ||
                  (field === 'publisherDetails' && v.includes('publisher')) ||
                  (field === 'publisherDetails' &&
                    event.option.value.id === this.accessService.userId &&
                    this.isClient1 &&
                    this.contentMeta.contentType === 'Resource'),
              ),
            )
          : of(true)
      observable.subscribe(
        (data: boolean) => {
          if (data) {
            const value = this.contentForm.controls[field].value
            value.push({
              id: event.option.value.id,
              name: event.option.value.displayName,
            })
            this.contentForm.controls[field].setValue(value)
          } else {
            this.infoType = field === 'publisherDetails' ? 'publishers' : 'reviewers'
            this.snackBar.openFromComponent(NotificationComponent, {
              data: {
                type: Notify.NO_ROLE,
              },
              duration: NOTIFICATION_TIME * 2 * 1000,
              panelClass: ['warning-popup'],
            })
          }
          this[`${field}View` as keyof EditMetaComponent].nativeElement.value = ''
          this[`${field}Ctrl` as keyof EditMetaComponent].setValue(null)
        },
        () => {
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.FAIL,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
        },
        () => {
          this.loader.changeLoad.next(false)
          this[`${field}View` as keyof EditMetaComponent].nativeElement.value = ''
          this[`${field}Ctrl` as keyof EditMetaComponent].setValue(null)
        },
      )
    }
  }

  removeField(event: MatChipInputEvent) {
    // Reset the input value
    if (event.input) {
      event.input.value = ''
    }
  }

  private fetchAudience() {
    if ((this.audienceCtrl.value || '').trim()) {
      this.audienceList = this.ordinals.audience.filter(
        (v: any) => v.toLowerCase().indexOf(this.audienceCtrl.value.toLowerCase()) > -1,
      )
    } else {
      this.audienceList = this.ordinals.audience.slice()
    }
  }

  private fetchJobProfile() {
    if ((this.jobProfileCtrl.value || '').trim()) {
      this.jobProfileList = this.ordinals.jobProfile.filter(
        (v: any) => v.toLowerCase().indexOf(this.jobProfileCtrl.value.toLowerCase()) > -1,
      )
    } else {
      this.jobProfileList = this.ordinals.jobProfile.slice()
    }
  }

  private fetchRegion() {
    if ((this.regionCtrl.value || '').trim()) {
      this.regionList = this.ordinals.region.filter(
        (v: any) => v.toLowerCase().indexOf(this.regionCtrl.value.toLowerCase()) > -1,
      )
    } else {
      this.regionList = []
    }
  }

  openRoleRequest(role: 'reviewer' | 'publisher') {
    this.dialog.open(FeedbackFormComponent, {
      width: this.isMobile ? '90vw' : '600px',
      height: 'auto',
      data: role,
    })
  }

  // private fetchAccessRestrictions() {
  //   if (this.accessPathsCtrl.value.trim()) {
  //     this.accessPathList = this.ordinals.resourceCategory.filter((v: any) => v.toLowerCase().
  //       indexOf(this.accessPathsCtrl.value.toLowerCase()) === 0)
  //   } else {
  //     this.accessPathList = this.ordinals.resourceCategory.slice()
  //   }
  // }

  checkCondition(meta: string, type: 'show' | 'required' | 'disabled'): boolean {
    if (type === 'disabled' && !this.isEditEnabled) {
      return true
    }
    return this.contentService.checkCondition(this.contentMeta.identifier, meta, type)
  }

  allowedCreatorContacts() {
    if (
      this.configSvc.userRoles && this.configSvc.userRoles.has('editor') &&
      this.contentService.getOriginalMeta(this.contentService.currentContent).contentType === 'Resource'
      ) {
        // console.log('this is an editor, allowed to edit curator for resource, returning false')
      return false
    }
    // console.log('not an editor, returning ', this.checkCondition('creatorContacts', 'disabled'))
    return this.checkCondition('creatorContacts', 'disabled')
  }

  createForm() {
    this.contentForm = this.formBuilder.group({
      accessPaths: [],
      accessibility: [],
      appIcon: [],
      audience: [],
      assetType: [],
      body: [],
      catalogPaths: [],
      category: [],
      categoryType: [],
      certificationList: [],
      certificationUrl: [],
      clients: [],
      codebase: [],
      complexityLevel: [],
      concepts: [],
      contentIdAtSource: [],
      contentType: [],
      creatorContacts: [],
      customClassifiers: [],
      description: [],
      dimension: [],
      documentation: [],
      duration: [],
      editors: [],
      email_id: [],
      equivalentCertifications: [],
      expiryDate: [],
      exclusiveContent: [],
      idealScreenSize: [],
      introductoryVideo: [],
      introductoryVideoIcon: [],
      interface_api: [],
      fileType: [],
      jobProfile: [],
      kArtifacts: [],
      keywords: [],
      learningMode: [],
      learningObjective: [],
      learningTrack: [],
      spaceLicense: [],
      otherSourceName: [],
      otherSpaceLicense: [],
      spaceLicenseAttribution: [],
      spaceLicenseCopyright: [],
      spaceLicenseTnCAgreed: [],
      spaceAreaOfExpertise: [],
      locale: [],
      mimeType: [],
      name: [],
      nodeType: [],
      org: [],
      creatorDetails: [],
      passPercentage: [],
      plagScan: [],
      playgroundInstructions: [],
      playgroundResources: [],
      postContents: [],
      posterImage: [],
      preContents: [],
      preRequisites: [],
      projectCode: [],
      publicationId: [],
      publisherDetails: [],
      profile_link: [],
      references: [],
      region: [],
      registrationInstructions: [],
      resourceCategory: [],
      resourceType: [],
      sampleCertificates: [],
      sandbox: [],
      skills: [],
      softwareRequirements: [],
      sourceName: [],
      status: [],
      studyDuration: [],
      studyMaterials: [],
      subTitle: [],
      subTitles: [],
      systemRequirements: [],
      thumbnail: [],
      trackContacts: [],
      transcoding: [],
      theme: [],
      unit: [],
      verifiers: [],
      visibility: [],
      isSearchable: [],
      spaceAssetType: [],
      spaceProfileType: [],
    })
    this.contentForm.controls.assetType.valueChanges.pipe(
      startWith(null),
      pairwise()
      /* filter((_values: [string, string]) => {
        if ((_values[1] && (_values[0] || !_values[0]))) {
          return true
        }
        return false
      })*/)
      .subscribe((_assetValueArray: [string, string]) => {
        // this.contentForm.controls.assetType.setValue(_assetValueArray[1])
        // console.log('meta before sequence looks like ', this.contentService.getUpdatedMeta(this.contentService.currentContent))
        this.setDefaultMessageonSpecificDetails(_assetValueArray[1])
        this.setPolicyForm(_assetValueArray[1])
        this.updateLicenseType(_assetValueArray[1])
        this.updateLicenceInfoTable(_assetValueArray[1])
        this.updateAssetTypeInfoTable()
        // tslint:disable-next-line: max-line-length
        if (this.contentService.getUpdatedMeta(this.contentService.currentContent).contentType === 'Resource' && _assetValueArray[1]) {
          this.enableSpecificAssetForm([_assetValueArray[0], _assetValueArray[1]])
        }
        // console.log('meta after sequence looks like ', this.contentService.getUpdatedMeta(this.contentService.currentContent))
      })

    this.contentForm.valueChanges.pipe(debounceTime(500)).subscribe(() => {
      this.contentForm.markAsPristine()
      if (this.canUpdate) {
        this.storeData()
      }
    })

    this.contentForm.controls.theme.valueChanges.subscribe(() => {
      const selectedThemeValues = this.contentForm.controls.theme.value
      if (selectedThemeValues.length > 1 && selectedThemeValues.includes('None')) {
        this.contentForm.controls.theme.setValue(['None'])
      }
    })

    this.contentForm.controls.profile_link.valueChanges.subscribe((_profileText: string) => {
      this.updateArtifactUrl(_profileText)
    })

    this.contentForm.controls.codebase.valueChanges.subscribe((_codebaseText: string) => {
      this.updateArtifactUrl(_codebaseText)
    })

    this.contentForm.controls.spaceAssetType.valueChanges.pipe(
      startWith(null),
      pairwise(),
      filter((_v: [string, string]) => _v[0] !== _v[1])
    ).subscribe((_spaceAssetTypeArray: [string, string]) => {
      if (_spaceAssetTypeArray[0]) {
        const newMeta = {
          spaceAssetType: _spaceAssetTypeArray[1],
        } as NSContent.IContentMeta
        if (!this.contentForm.controls.spaceAssetType.pristine) {
          newMeta.artifactLinkUrl = ''
          newMeta.artifactUploadUrl = ''
        }
        if (_spaceAssetTypeArray[1] === 'asset_link') {
          newMeta.mimeType = 'application/html'
        }
        // console.log(this.contentService.getUpdatedMeta(this.contentService.currentContent))
        this.contentService.setUpdatedMeta(newMeta, this.contentService.currentContent)
      }
    })

    this.contentForm.controls.spaceProfileType.valueChanges.pipe(
      startWith(null),
      pairwise(),
      filter((_v: [string, string]) => _v[0] !== _v[1])
    ).subscribe((_spaceProfileTypeArray: [string, string]) => {
      if (_spaceProfileTypeArray[0]) {
        const newMeta = {
          spaceProfileType: _spaceProfileTypeArray[1],
        } as NSContent.IContentMeta
        if (!this.contentForm.controls.spaceProfileType.pristine) {
          newMeta.artifactLinkUrl = ''
          newMeta.artifactUploadUrl = ''
          newMeta.artifactUrl = ''
        }
        if (_spaceProfileTypeArray[1] === 'profile_link') {
          newMeta.mimeType = 'application/html'
        }
        // console.log(this.contentService.getUpdatedMeta(this.contentService.currentContent))
        this.contentService.setUpdatedMeta(newMeta, this.contentService.currentContent)
      }
    })

    this.contentForm.controls.sourceName.valueChanges.subscribe(() => {
      // const selectedsourceNameValues = this.contentForm.controls.sourceName.value
      // console.log('value ', this.contentForm.controls.sourceName, this.contentForm.controls.otherSourceName)
      /* if (selectedsourceNameValues.length > 1 && selectedsourceNameValues.includes('N/A')) {
        this.contentForm.controls.sourceName.setValue(['N/A'])
      } */
      if (!this.contentForm.controls.sourceName.value.includes('Other')) {
        this.contentForm.controls.otherSourceName.setValue('')
        this.contentForm.controls.otherSourceName.markAsUntouched()
        // this.showOther = false
      }
      /* if (selectedsourceNameValues.length > 1 && this.contentForm.controls.sourceName.value.includes('Other')) {
        this.contentForm.controls.sourceName.setValue(['Other'])
      } */
      /* if (this.contentForm.controls.sourceName.value.includes('Other')) {
        this.showOther = true
      } */
      // tslint:disable-next-line: max-line-length
      // this.contentForm.controls.sourceShortName.setValue(this.contentForm.controls.sourceName.value)      // console.log('source name ', this.contentForm.controls.sourceName.value)
      // console.log(this.contentService.getUpdatedMeta(this.contentService.currentContent))
    })

    this.contentForm.controls.spaceLicense.valueChanges.subscribe(() => {
      if (this.contentForm.controls.otherSpaceLicense.value !== 'Other') {
        this.contentForm.controls.otherSpaceLicense.setValue('')
        this.contentForm.controls.otherSpaceLicense.markAsUntouched()
      }
    })
    // to set the body same as description entered
    this.contentForm.controls.description.valueChanges.subscribe(_newDescription => {
      this.contentForm.controls.body.setValue(_newDescription)
    })

    this.contentForm.controls.contentType.valueChanges.subscribe(() => {
      // this.changeResourceType()
      this.filterOrdinals()
      this.changeMimeType()
      this.contentForm.controls.category.setValue(this.contentForm.controls.contentType.value)
    })
    this.contentForm.controls.resourceType.valueChanges.subscribe(() => {
      this.contentForm.controls.categoryType.setValue(this.contentForm.controls.resourceType.value)
    })
    this.contentForm.controls.resourceCategory.valueChanges.subscribe(() => {
      this.contentForm.controls.customClassifiers.setValue(
        this.contentForm.controls.resourceCategory.value,
      )
    })
  }
  openCatalogSelector() {
    const oldCatalogs = this.addCommonToCatalog(this.contentForm.controls.catalogPaths.value)
    const dialogRef = this.dialog.open(CatalogSelectComponent, {
      width: '70%',
      maxHeight: '90vh',

      data: JSON.parse(JSON.stringify(oldCatalogs)),
    })
    dialogRef.afterClosed().subscribe((response: string[]) => {
      // const catalogs = this.removeCommonFromCatalog(response)
      if (Array.isArray(response)) {
        this.contentForm.controls.catalogPaths.setValue(response)
      }
    })
  }

  updateArtifactUrl(textToUpdate: string) {
    if (textToUpdate && this.contentForm.controls.contentType.value === 'Resource') {
      const meta = {
        artifactUrl: textToUpdate,
        isInIntranet: false,
      } as NSContent.IContentMeta
      this.contentService.setUpdatedMeta(meta, this.contentService.currentContent)
    }
  }

  updateLicenseType(assetType: string) {
    if (assetType) {
      const selectedLicense = this.ordinals.license.find((licenseObject: { parent: string, values: [string] }) => {
        return licenseObject.parent.toLowerCase() === assetType.toLowerCase()
      })
      if (selectedLicense && selectedLicense.values.length) {
        this.currentLicenseList = Object.assign([], selectedLicense.values)
        return
      }
    }
    this.currentLicenseList[0] = 'N/A'
  }

  setDefaultTabsAndFormConfigs() {
    this.technologyAssetFormEnabled = false
    this.connectionAssetFormEnabled = false
    this.knowledgeAssetFormEnabled = false
    this.displayRadioSystem = false
    this.assetRelatedTabsUpdated = true
    window.setTimeout(
      () => {
        this.assetRelatedTabsUpdated = false
        // tslint:disable-next-line: align
      }, 0)
  }

  enableSpecificAssetForm(assetTypeArray: [string, string]) {
    if (!this.assetRelatedTabsUpdated) {
      this.setDefaultTabsAndFormConfigs()
    }
    if (!this.contentForm.controls.assetType.pristine && assetTypeArray[0] !== assetTypeArray[1]) {
      this.cleanAssetRelatedFields(assetTypeArray[1], assetTypeArray[0])
    }
    if (assetTypeArray[1]) {
      switch (assetTypeArray[1]) {
        case 'Technology':
          this.technologyAssetFormEnabled = true
          break
        case 'Connection':
          this.connectionAssetFormEnabled = true
          break
        case 'Knowledge':
          this.knowledgeAssetFormEnabled = true
          this.displayRadioSystem = true
          break
        case 'Protocol':
        case 'Data':
          this.displayRadioSystem = true
          break
        default:
          if (!this.assetRelatedTabsUpdated) {
            this.setDefaultTabsAndFormConfigs()
          }
      }
    }
  }

  cleanAssetRelatedFields(assetTypeNext: string, _assetTypePrev?: string) {
    this.contentForm.controls.assetType.markAsPristine()
    // console.log('here')
    const newMeta = {
      artifactLinkUrl: '',
      artifactUploadUrl: '',
      artifactUrl: '',
      profile_link: '',
      codebase: '',
      resourceType: '',
      assetType: assetTypeNext,
      // tslint:disable-next-line: max-line-length
      spaceAssetType: ['Connection', 'Technology'].includes(this.contentForm.controls.assetType.value) ? '' : this.contentForm.controls.spaceAssetType.value,
    } as NSContent.IContentMeta
    this.contentForm.controls.codebase.setValue(null)
    this.contentForm.controls.profile_link.setValue(null)
    this.contentForm.controls.resourceType.setValue('')
    this.clearArtifactForm = false
    this.contentService.setUpdatedMeta(newMeta, this.contentService.currentContent)
  }

  removeSkill(skill: string) {
    const index = this.selectedSkills.indexOf(skill)
    this.selectedSkills.splice(index, 1)
  }

  // removeCatalog(index: number) {
  //   const catalogs = this.contentForm.controls.catalogPaths.value
  //   catalogs.splice(index, 1)
  //   this.contentForm.controls.catalogPaths.setValue(catalogs)
  // }

  // removeCommonFromCatalog(catalogs: string[]): string[] {
  //   const newCatalog: any[] = []
  //   catalogs.forEach(catalog => {
  //     let start = 0
  //     let end = 0
  //     start = catalog.indexOf('>')
  //     end = catalog.length
  //     newCatalog.push(catalog.slice(start + 1, end))
  //   })
  //   return newCatalog
  // }

  copyData(type: 'keyword' | 'previewUrl') {
    const selBox = document.createElement('textarea')
    selBox.style.position = 'fixed'
    selBox.style.left = '0'
    selBox.style.top = '0'
    selBox.style.opacity = '0'
    if (type === 'keyword') {
      selBox.value = this.contentForm.controls.keywords.value
    } else if (type === 'previewUrl') {
      selBox.value =
        // tslint:disable-next-line: max-line-length
        `${window.location.origin}/author/viewer/${VIEWER_ROUTE_FROM_MIME(
          this.contentForm.controls.mimeType.value,
        )}/${this.contentMeta.identifier}`
    }
    document.body.appendChild(selBox)
    selBox.focus()
    selBox.select()
    document.execCommand('copy')
    document.body.removeChild(selBox)
    this.snackBar.openFromComponent(NotificationComponent, {
      data: {
        type: Notify.COPY,
      },
      duration: NOTIFICATION_TIME * 1000,
    })
  }

  addCommonToCatalog(catalogs: string[]): string[] {
    const newCatalog: any[] = []
    catalogs.forEach(catalog => {
      const prefix = 'Common>'
      if (catalog.indexOf(prefix) > -1) {
        newCatalog.push(catalog)
      } else {
        newCatalog.push(prefix.concat(catalog))
      }
    })
    return newCatalog
  }

  showLicenseDetails() {
    // to filter out the specific license details as slected in asset Type and then show it in the table
    if (this.currentLicenseData) {
      this.dialog.open(LicenseInfoDisplayDialogComponent, {
        panelClass: 'license-class',
        width: '70%',
        data: {
          items: this.currentLicenseData,
        },
      })
    }
  }

  updateLicenceInfoTable(assetType: string) {
    if (assetType) {
      this.currentLicenseData = this.licenseMetaList.filter(
        (licenseObj: ILicenseMetaInfo) => {
          return licenseObj.parent.includes(assetType)
        }).map((filteredLicenseObj: ILicenseMetaInfo) => {
          return {
            name: filteredLicenseObj.name,
            details: filteredLicenseObj.details,
            link: filteredLicenseObj.link,
          }
        })
    } else {
      this.currentLicenseData = undefined
    }
  }

  updateAssetTypeInfoTable() {
    if (this.assestTypeMetaData) {
      this.currentAssestTypeData = this.assestTypeMetaData
    } else {
      this.currentAssestTypeData = undefined
    }
  }

  showAssetTypeDetails() {
    if (this.currentAssestTypeData) {
      this.dialog.open(AssetTypeInfoDisplayDialogComponent, {
        panelClass: 'asset-class',
        width: '70%',
        data: {
          items: this.currentAssestTypeData,
        },
      })
    }
  }

  setDefaultMessageonSpecificDetails(assetTypeSelected: string) {
    if (!assetTypeSelected) {
      this.promptUserForAssetType = true
    } else {
      this.promptUserForAssetType = false
    }
  }

  checkSpecificDetailsVisibility() {
    // && this.contentForm?.controls?.assetType.value !== 'Data'
    return this.checkCondition('assetType', 'show')
  }

  updateLicenseTnCAgreed(_checkboxEvent: any) {
    this.contentForm.controls.spaceLicenseTnCAgreed.setValue(_checkboxEvent.checked || false)
  }

  openLicenseTnc() {
    window.open('/public/termsofuse', '_blank')
  }

  setPolicyForm(_assetTypeValue: string) {
    if (_assetTypeValue) {
      this.displayPolicyForm = true
      this.contentForm.controls.spaceLicenseTnCAgreed.setValue(false)
    } else {
      if (this.contentMeta.contentType !== 'Resource') {
        this.displayPolicyForm = true
        this.spaceLicenseTnCAgreed = false
      } else {
        this.displayPolicyForm = false
        this.spaceLicenseTnCAgreed = true
        this.contentForm.controls.spaceLicenseTnCAgreed.setValue(true)
      }
    }
    this.contentForm.controls.spaceLicense.setValue('')
    this.contentForm.controls.spaceLicenseAttribution.setValue('')
    this.contentForm.controls.spaceLicenseCopyright.setValue('')
    this.contentForm.controls.spaceLicense.markAsUntouched()
    this.contentForm.controls.spaceLicenseAttribution.markAsUntouched()
    this.contentForm.controls.spaceLicenseCopyright.markAsUntouched()
  }

  emitPushEvent(_event?: string) {
    const updatedMeta = this.contentService.getUpdatedMeta(this.contentService.currentContent) as NSContent.IContentMeta
    // const meta = { } as NSContent.IContentMeta
    let allOk = true
    // console.log('updated meta before updation looks like ', updatedMeta)
    if (this.contentForm.controls.contentType.value === 'Resource') {
      if (['Protocol', 'Knowledge', 'Data'].includes(this.contentForm.controls.assetType.value)) {
        switch (this.contentForm.controls.spaceAssetType.value) {
          case '': {
            allOk = false
            this.snackBar.openFromComponent(NotificationComponent, {
              data: {
                type: Notify.FILL_SPACE_ASSET_TYPE,
              },
              duration: NOTIFICATION_TIME * 1000,
            })
          }
            break
          case 'asset_link':
            {
              if (!updatedMeta.artifactLinkUrl || !updatedMeta.artifactLinkUrl.length) {
                allOk = false
                this.snackBar.openFromComponent(NotificationComponent, {
                  data: {
                    type: Notify.VALID_ASSET_LINK_URL_FAILURE,
                  },
                  duration: NOTIFICATION_TIME * 1000,
                })
              }
            }
            break
          case 'asset_upload': {
            if (!updatedMeta.artifactUploadUrl || !updatedMeta.artifactUploadUrl.length) {
              allOk = false
              this.snackBar.openFromComponent(NotificationComponent, {
                data: {
                  type: Notify.VALID_ASSET_UPLOAD_URL_FAILURE,
                },
                duration: NOTIFICATION_TIME * 1000,
              })
            }
          }
        }
        // update spaceAssetType for proper sync
        if (this.contentForm.controls.spaceAssetType.value) {
          // tslint:disable-next-line: max-line-length
          const spaceAssetTypeMeta = { spaceAssetType: this.contentForm.controls.spaceAssetType.value } as NSContent.IContentMeta
          this.contentService.setUpdatedMeta(spaceAssetTypeMeta, this.contentService.currentContent)
        }
      }
    }
    if (this.contentForm.controls.spaceLicenseTnCAgreed.value) {
      if (allOk) {
        this.data.emit('push')
        this.isSubmitPressed = true
      }
    } else {
      this.triggerLTNCNotification()
    }
  }

  updateArtifactData(_inputEvent: any, _eventForArtifactType: 'link' | 'asset_upload' | 'profile_link' | 'profile_upload') {
    // console.log('input recieved as ', _inputEvent, _eventForArtifactType)
  }

  updateProfileLink(eventData: any, _eventType: string) {
    this.contentForm.controls.profile_link.setValue(eventData ? eventData : null)
    /* const updatedMeta = {
      profile_link: !eventData ? '' : eventData,
    } as NSContent.IContentMeta
    this.contentService.setUpdatedMeta(updatedMeta, this.contentService.currentContent)
    console.log('after update data looks like ', this.contentService.getUpdatedMeta(this.contentService.currentContent))
    console.log(`data for profile is ${eventData} ${eventType}`) */
    const updatedMeta = {} as NSContent.IContentMeta
    if (!this.contentForm.controls.profile_link.pristine) {
      if (_eventType === 'link') {
        updatedMeta.artifactUploadUrl = ''
      } else if (_eventType === 'upload') {
        updatedMeta.artifactLinkUrl = ''
      }
      this.contentService.setUpdatedMeta(updatedMeta, this.contentService.currentContent)
      this.storeData()
    }
  }
  /**
   * Decides whether to show or not show to a role, provided that content is not already live
   * @param roleKey The name of property to show or not show "eample: catalogPath should not be shown to publisher"
   * @returns boolean
   */
  showAccToRoles(roleKey: any) {
    if (this.contentService.getUpdatedMeta(this.contentService.currentContent).status !== 'Live') {
      // tslint:disable-next-line: max-line-length
    if (this.uploadService.isVisibileAccToRoles(this.allowedRoles[roleKey], this.notAllowedRoles[roleKey])) {
      return true
    }
    if (!this.uploadService.isVisibileAccToRoles(this.allowedRoles[roleKey], this.notAllowedRoles[roleKey])) {
      return false
    }
    return true
    }
    return false
  }
  dispatchEventForSideNav() {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    },         50)
  }
}
