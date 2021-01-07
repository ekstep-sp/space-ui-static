import { NestedTreeControl } from '@angular/cdk/tree'
import { Component, EventEmitter, OnDestroy, OnInit, Output, Input } from '@angular/core'
import { MatTreeNestedDataSource } from '@angular/material'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'
import { ActivatedRoute, Router } from '@angular/router'
import {
  ContentProgressService,
  NsContent,
  VIEWER_ROUTE_FROM_MIME,
  WidgetContentService,
} from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import {
  // LoggerService,
  ConfigurationsService,
  UtilityService,
} from '@ws-widget/utils'
import { of, Subscription } from 'rxjs'
import { delay } from 'rxjs/operators'
// import { ViewerDataService } from '../../viewer-data.service'
import { ViewerUtilService } from '../../viewer-util.service'
import { SharedViewerDataService } from './../../../../../author/src/lib/modules/shared/services/shared-viewer-data.service'
interface IViewerTocCard {
  assetType: string | null
  contentUrls?: [any] | null
  identifier: string
  viewerUrl: string
  thumbnailUrl: string
  title: string
  duration: number
  type: string
  complexity: string
  children: null | IViewerTocCard[]
  iconType?: string,
  technicalContents?: null | IViewerTocCard[]
}

export type TCollectionCardType = 'content' | 'playlist' | 'goals'

interface ICollectionCard {
  type: TCollectionCardType | null
  id: string
  title: string
  thumbnail: string
  subText1: string
  subText2: string
  duration: number
  redirectUrl: string | null
}

@Component({
  selector: 'viewer-viewer-toc',
  templateUrl: './viewer-toc.component.html',
  styleUrls: ['./viewer-toc.component.scss'],
})
export class ViewerTocComponent implements OnInit, OnDestroy {
  @Output() hidenav = new EventEmitter<boolean>()
  @Input() forPreview = false
  @Output() techResourceChange = new EventEmitter<any>()
  @Input() technicalResource: any = null
  isExpand = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    // private logger: LoggerService,
    private contentSvc: WidgetContentService,
    private utilitySvc: UtilityService,
    private viewerDataSvc: SharedViewerDataService,
    private viewSvc: ViewerUtilService,
    private configSvc: ConfigurationsService,
    private contentProgressSvc: ContentProgressService,
    private router: Router,
  ) {
    this.nestedTreeControl = new NestedTreeControl<IViewerTocCard>(this._getChildren)
    this.nestedDataSource = new MatTreeNestedDataSource()
  }
  resourceId: string | null = null
  collection: IViewerTocCard | null = null
  queue: IViewerTocCard[] = []
  tocMode: 'FLAT' | 'TREE' = 'TREE'
  nestedTreeControl: NestedTreeControl<IViewerTocCard>
  nestedDataSource: MatTreeNestedDataSource<IViewerTocCard>
  defaultThumbnail: SafeUrl | null = null
  isFetching = true
  pathSet = new Set()
  contentProgressHash: { [id: string]: number } | null = null
  errorWidgetData: NsWidgetResolver.IRenderConfigWithTypedData<any> = {
    widgetType: 'errorResolver',
    widgetSubType: 'errorResolver',
    widgetData: {
      errorType: '',
    },
  }
  enumContentTypes = NsContent.EDisplayContentTypes
  collectionCard: ICollectionCard | null = null
  isErrorOccurred = false
  private paramSubscription: Subscription | null = null
  private viewerDataServiceSubscription: Subscription | null = null
  hasNestedChild = (_: number, nodeData: IViewerTocCard) =>
    nodeData && nodeData.children && nodeData.children.length
  hasTechResource = (_: number, nodeData: IViewerTocCard) =>
    nodeData && nodeData.technicalContents && nodeData.technicalContents.length
  private _getChildren = (node: IViewerTocCard) => {
    return node && node.children ? node.children : []
  }
  ngOnInit() {

    if (this.configSvc.instanceConfig) {
      this.defaultThumbnail = this.domSanitizer.bypassSecurityTrustResourceUrl(
        this.configSvc.instanceConfig.logos.defaultContent,
      )
    }
    if (this.technicalResource) {
      this.getDataForTechResourceAndLoadDefaultLink()
    } else {
    this.paramSubscription = this.activatedRoute.queryParamMap.subscribe(async params => {
      const collectionId = params.get('collectionId')
      const collectionType = params.get('collectionType')
      if (collectionId && collectionType) {
        if (
          collectionType.toLowerCase() ===
          NsContent.EMiscPlayerSupportedCollectionTypes.PLAYLIST.toLowerCase()
        ) {
          this.collection = await this.getPlaylistContent(collectionId, collectionType)
        } else if (
          collectionType.toLowerCase() === NsContent.EContentTypes.MODULE.toLowerCase() ||
          collectionType.toLowerCase() === NsContent.EContentTypes.COURSE.toLowerCase() ||
          collectionType.toLowerCase() === NsContent.EContentTypes.PROGRAM.toLowerCase()
        ) {
          this.collection = await this.getCollection(collectionId, collectionType)
        } else {
          this.isErrorOccurred = true
        }
        if (this.collection) {
          this.queue = this.utilitySvc.getLeafNodes(this.collection, [])
        }
      }
      if (this.resourceId) {
        this.processCurrentResourceChange()
      }
    })
    this.viewerDataServiceSubscription = this.viewerDataSvc.changedSubject.subscribe(_data => {
      if (this.resourceId !== this.viewerDataSvc.resourceId) {
        this.resourceId = this.viewerDataSvc.resourceId
        this.processCurrentResourceChange()
      }
    })
  }
  }

  async getDataForTechResourceAndLoadDefaultLink() {
    const collectionId = this.technicalResource && this.technicalResource.identifier ? this.technicalResource.identifier : ''
    this.collection = await this.getCollection(collectionId, '')
    if(this.collection){
      this.openSubResource(this.collection.viewerUrl)
    }
  }
  private getContentProgressHash() {
    this.contentProgressSvc.getProgressHash().subscribe(progressHash => {
      this.contentProgressHash = progressHash
    })
  }

  ngOnDestroy() {
    if (this.paramSubscription) {
      this.paramSubscription.unsubscribe()
    }
    if (this.viewerDataServiceSubscription) {
      this.viewerDataServiceSubscription.unsubscribe()
    }
  }
  changeTocMode() {
    if (this.tocMode === 'FLAT') {
      this.tocMode = 'TREE'
      // this.processCollectionForTree()
    } else {
      this.tocMode = 'FLAT'
    }
  }

  private processCurrentResourceChange() {
    if (this.collection && this.resourceId) {
      const currentIndex = this.queue.findIndex(c => c.identifier === this.resourceId)
      const next =
        currentIndex + 1 < this.queue.length ? this.queue[currentIndex + 1].viewerUrl : null
      const prev = currentIndex - 1 >= 0 ? this.queue[currentIndex - 1].viewerUrl : null
      this.viewerDataSvc.updateNextPrevResource(Boolean(this.collection), prev, next)
      this.processCollectionForTree()
      this.expandThePath()
      // this.expandAll(this.nestedTreeControl)
      // this.nestedTreeControl.expandAll()
      this.getContentProgressHash()
    }
  }

  expandAll(source: any) {
    this.nestedTreeControl.expand(source)
  }
  private async getCollection(
    collectionId: string,
    _collectionType: string,
  ): Promise<IViewerTocCard | null> {
    try {
      const content: NsContent.IContent = await (this.forPreview
        ? this.contentSvc.fetchAuthoringContent(collectionId)
        : this.contentSvc.fetchContent(collectionId, 'detail')
      ).toPromise()
      this.collectionCard = this.createCollectionCard(content)
      const viewerTocCardContent = this.convertContentToIViewerTocCard(content)
      this.isFetching = false
      return viewerTocCardContent
    } catch (err) {
      switch (err.status) {
        case 403: {
          this.errorWidgetData.widgetData.errorType = 'accessForbidden'
          break
        }
        case 404: {
          this.errorWidgetData.widgetData.errorType = 'notFound'
          break
        }
        case 500: {
          this.errorWidgetData.widgetData.errorType = 'internalServer'
          break
        }
        case 503: {
          this.errorWidgetData.widgetData.errorType = 'serviceUnavailable'
          break
        }
        default: {
          this.errorWidgetData.widgetData.errorType = 'somethingWrong'
          break
        }
      }
      this.isFetching = false
      return null
    }
  }

  private async getPlaylistContent(
    collectionId: string,
    _collectionType: string,
  ): Promise<IViewerTocCard | null> {
    try {
      const playlistFetchResponse = await this.contentSvc
        .fetchCollectionHierarchy('playlist', collectionId, 0, 1000)
        .toPromise()

      const content: NsContent.IContent = playlistFetchResponse.data
      this.collectionCard = this.createCollectionCard(content)
      const viewerTocCardContent = this.convertContentToIViewerTocCard(content)
      this.isFetching = false
      return viewerTocCardContent
    } catch (err) {
      switch (err.status) {
        case 403: {
          this.errorWidgetData.widgetData.errorType = 'accessForbidden'
          break
        }
        case 404: {
          this.errorWidgetData.widgetData.errorType = 'notFound'
          break
        }
        case 500: {
          this.errorWidgetData.widgetData.errorType = 'internalServer'
          break
        }
        case 503: {
          this.errorWidgetData.widgetData.errorType = 'serviceUnavailable'
          break
        }
        default: {
          this.errorWidgetData.widgetData.errorType = 'somethingWrong'
          break
        }
      }
      this.isFetching = false
      return null
    }
  }

  private convertContentToIViewerTocCard(content: NsContent.IContent): IViewerTocCard {
    // return {
    //   identifier: content.identifier,
    //   viewerUrl: `/viewer/${VIEWER_ROUTE_FROM_MIME(content.mimeType)}/${content.identifier}`,
    //   thumbnailUrl: content.appIcon,
    //   title: content.name,
    //   duration: content.duration,
    //   type: content.displayContentType,
    //   complexity: content.complexityLevel,
    //   children: Array.isArray(content.children) && content.children.length ?
    //     content.children.map(child => this.convertContentToIViewerTocCard(child)) : null,
    // }
    const newFormat = {
      assetType: content.assetType || null ,
      identifier: content.identifier,
      viewerUrl: `${this.forPreview ? '/author' : ''}/viewer/${VIEWER_ROUTE_FROM_MIME(
        content.mimeType,
      )}/${content.identifier}`,
      thumbnailUrl: this.forPreview
        ? this.viewSvc.getAuthoringUrl(content.appIcon)
        : content.appIcon,
      title: content.name,
      duration: content.duration,
      type: content.resourceType ? content.resourceType : content.contentType,
      complexity: content.complexityLevel,
      iconType: content.mimeType,
      children:
        Array.isArray(content.children) && content.children.length
          ? content.children.map(child => this.convertContentToIViewerTocCard(child))
          : null,
    }
    if (newFormat.assetType === 'Technology') {
      this.restructureTechnicalResource(newFormat, content)
    }
    return newFormat
  }

  private restructureTechnicalResource(oldFormat: any, technicalContent: any) {
    if (technicalContent.hasOwnProperty('documentation') || technicalContent.hasOwnProperty('interface_api') ||
         technicalContent.hasOwnProperty('sandbox') || technicalContent.hasOwnProperty('codebase')) {
      oldFormat.technicalContents = []
      if (technicalContent.hasOwnProperty('codebase') && technicalContent.codebase) {
        oldFormat.technicalContents.push({
          title: 'Codebase Link',
          url: technicalContent.codebase,
        })
      }
      if (technicalContent.hasOwnProperty('documentation') && technicalContent.documentation) {
        oldFormat.technicalContents.push({
          title: 'Documentation Link',
          url: technicalContent.documentation,
        })
      }
      if (technicalContent.hasOwnProperty('interface_api') && technicalContent.interface_api) {
        oldFormat.technicalContents.push({
          title: 'Interface API Link',
          url: technicalContent.interface_api,
        })
      }
      if (technicalContent.hasOwnProperty('sandbox') && technicalContent.sandbox) {
        oldFormat.technicalContents.push({
          title: 'Sandbox Link',
          url: technicalContent.sandbox,
        })
      }

    }
    if (oldFormat.technicalContents.length > 0) {
      oldFormat.techExpanded = false
    }
  }

  private createCollectionCard(
    collection: NsContent.IContent | NsContent.IContentMinimal,
  ): ICollectionCard {
    // return {
    //   type: this.getCollectionTypeCard(collection.displayContentType),
    //   id: collection.identifier,
    //   title: collection.name,
    //   thumbnail: collection.appIcon,
    //   subText1: collection.displayContentType || collection.contentType,
    //   subText2: collection.complexityLevel,
    //   duration: collection.duration,
    //   redirectUrl: this.getCollectionTypeRedirectUrl(collection.displayContentType, collection.identifier),
    // }
    return {
      type: this.getCollectionTypeCard(collection.displayContentType),
      id: collection.identifier,
      title: collection.name,
      thumbnail: this.forPreview
        ? this.viewSvc.getAuthoringUrl(collection.appIcon)
        : collection.appIcon,
      subText1: collection.resourceType ? collection.resourceType : collection.contentType,
      subText2: collection.complexityLevel,
      duration: collection.duration,
      redirectUrl: this.getCollectionTypeRedirectUrl(
        collection.identifier,
        collection.displayContentType,
      ),
    }
  }

  private getCollectionTypeCard(
    displayContentType?: NsContent.EDisplayContentTypes,
  ): TCollectionCardType | null {
    switch (displayContentType) {
      case NsContent.EDisplayContentTypes.PROGRAM:
      case NsContent.EDisplayContentTypes.COURSE:
      case NsContent.EDisplayContentTypes.MODULE:
        return 'content'
      case NsContent.EDisplayContentTypes.GOALS:
        return 'goals'
      case NsContent.EDisplayContentTypes.PLAYLIST:
        return 'playlist'
      default:
        return null
    }
  }

  private getCollectionTypeRedirectUrl(
    identifier: string,
    displayContentType?: NsContent.EDisplayContentTypes,
  ): string | null {
    switch (displayContentType) {
      case NsContent.EDisplayContentTypes.PROGRAM:
      case NsContent.EDisplayContentTypes.COURSE:
      case NsContent.EDisplayContentTypes.MODULE:
        return `${this.forPreview ? '/author' : '/app'}/toc/${identifier}/overview`
      case NsContent.EDisplayContentTypes.GOALS:
        return `/app/goals/${identifier}`
      case NsContent.EDisplayContentTypes.PLAYLIST:
        return `/app/playlist/${identifier}`
      default:
        return null
    }
  }

  private processCollectionForTree() {
    if (this.collection && this.collection.children) {
      this.nestedDataSource.data = this.collection.children
      this.pathSet = new Set()
      // if (this.resourceId && this.tocMode === 'TREE') {
      if (this.resourceId) {
        of(true)
          .pipe(delay(2000))
          .subscribe(() => {
            this.expandThePath()
            // this.nestedTreeControl.expandAll()
          })
      }
    }
  }

  expandThePath() {
    if (this.collection && this.resourceId) {
      const path = this.utilitySvc.getPath(this.collection, this.resourceId)
      this.pathSet = new Set(path.map((u: { identifier: any }) => u.identifier))
      path.forEach((node: IViewerTocCard) => {
        this.nestedTreeControl.expand(node)
      })
      this.viewerDataSvc.updateHeirarchyTitleInToolbar(path)
    }
  }

  minimizenav() {
    this.hidenav.emit(false)
  }
  navigateToNonTechResource(url : any){
   this.router.navigate([`${url}`]);
  }

  navigateToTechResource(viewerUrl: any, techSubContent = {title:'Codebase Link'}){
      this.router.navigate([`/${viewerUrl}`], { queryParams: {techResourceType: techSubContent.title}});
  }
  openSubResource( viewerUrl: string, techSubContent: any = {title:'Codebase Link'}){
    this.viewerDataSvc.updateTechResource(techSubContent)
    this.navigateToTechResource(viewerUrl, techSubContent )
  }

  /* togglePanel(content: any) {
    if (content && content.hasOwnProperty('techExpanded')) {
      content.techExpanded = !content.techExpanded
    }
  } */

  togglePane1(panel: any) {
    panel.toggle()
  }
  // showTechResourceWithFilteredDefaultLink(technicalContent: any){
  // return  technicalContent.filter( (techResource: { title: string })=>{
  //    return  (techResource.title != 'Codebase Link')
  //    });

  // }
  isActiveSubLinks(identifier: any, techContentTitle: string, isStandaloneResource= false) {
    const title = this.activatedRoute.snapshot.queryParamMap.get('techResourceType');
    if(isStandaloneResource){
      return (title === techContentTitle)
    }
    else{
      return (this.pathSet.has(identifier) && (title === techContentTitle))
    }
  }
  shouldExpand(content: any) {
    // console.log('should expand --> ' + id, this.pathSet.has(id))
    // return this.pathSet.has(content.identifier) || (content.hasOwnProperty('techExpanded') ? content.techExpanded : false)
    return this.pathSet.has(content.identifier)
  }
}
