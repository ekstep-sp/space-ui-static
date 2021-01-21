import { Injectable } from '@angular/core'
import { NsContent } from '@ws-widget/collection'
import { Subject, ReplaySubject } from 'rxjs'
import { ConfigurationsService } from '@ws-widget/utils'

export interface IViewerTocChangeEvent {
  tocAvailable: boolean
  nextResource: string | null
  prevResource: string | null
}
export interface IViewerResourceOptions {
  page?: {
    min: number
    max: number
    current: number
    queryParamKey: string
  }
  zoom?: {
    min: number
    max: number
    current: number
    queryParamKey: string
  }
}
export type TStatus = 'pending' | 'done' | 'error' | 'none'

@Injectable({
  providedIn: 'root',
})
export class SharedViewerDataService {
  resourceId: string | null = null
  resource: NsContent.IContent | null = null
  error: any
  status: TStatus = 'none'
  resourceChangedSubject = new Subject<string>()
  changedSubject = new ReplaySubject(1)
  updateHierarchyTitleSubject = new Subject()
  tocChangeSubject = new ReplaySubject<IViewerTocChangeEvent>(1)
  navSupportForResource = new ReplaySubject<IViewerResourceOptions>(1)
  techUrlChangeSubject$ = new Subject<string | null>()
  constructor(private configSvc: ConfigurationsService) { }

  reset(resourceId: string | null = null, status: TStatus = 'none') {
    this.resourceId = resourceId
    this.resource = null
    this.error = null
    this.status = status
    this.changedSubject.next()
  }

  updateTechResource(techContent: any) {
    this.updateResource(this.resource)
    this.techUrlChangeSubject$.next(techContent.url)
  }
  updateResource(resource: NsContent.IContent | null = null, error: any | null = null) {
    if (resource) {
      this.resource = resource
      if (resource && resource.identifier) {
        this.resourceId = resource.identifier
      }
      this.error = null
      this.status = 'done'
    } else {
      this.resource = null
      this.error = error
      this.status = 'error'
    }
    this.changedSubject.next()
  }
  updateNextPrevResource(isValid = true, prev: string | null = null, next: string | null = null) {
    this.tocChangeSubject.next(
      {
        tocAvailable: isValid,
        nextResource: next,
        prevResource: prev,
      },
    )
  }
  updateHeirarchyTitleInToolbar(path: any) {
    this.updateHierarchyTitleSubject.next(path)
   }
  isVisibileAccToRoles(allowedRoles: [string], notAllowedRoles: [string]) {
    let finalAcceptance = true
    if (this.configSvc.userRoles && this.configSvc.userRoles.size) {
      if (notAllowedRoles.length) {
        const rolesOK = notAllowedRoles.some(role => (this.configSvc.userRoles as Set<string>).has(role))
        if (rolesOK) {
          finalAcceptance = false
        } else {
          finalAcceptance = true
        }
      }
      if (allowedRoles.length) {
        const rolesOK = allowedRoles.some(role => (this.configSvc.userRoles as Set<string>).has(role))
        if (!rolesOK) {
          finalAcceptance = false
        } else {
          finalAcceptance = true
        }
      }
      if (!notAllowedRoles.length && !allowedRoles.length) {
        finalAcceptance = true
      }
    }
    return finalAcceptance
  }
}
