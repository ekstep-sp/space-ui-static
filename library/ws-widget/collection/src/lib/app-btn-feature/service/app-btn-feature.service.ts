import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { ConfigurationsService } from '../../../../../utils/src/public-api'
import { MatExpansionPanel } from '@angular/material'

@Injectable({
  providedIn: 'root',
})
export class AppBtnFeatureService {

  triggerExpansion = new BehaviorSubject<boolean>(false)
  triggerExpansionStatus = new BehaviorSubject<boolean>(false)
  triggerExpansionPanel = new BehaviorSubject<MatExpansionPanel[]|null>(null)
  openedPanels: MatExpansionPanel[] = []

  constructor(public configSvc: ConfigurationsService) { }
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
    // console.log(finalAcceptance)
    return finalAcceptance
  }

  triggerAppsExpansion(expand: boolean) {
    this.triggerExpansion.next(expand)
  }
  triggerAppsExpansionStatus(expand: boolean) {
    if (expand) {
        if (this.openedPanels.length) {
          this.openedPanels = this.openedPanels.filter((element: any) => {
        if (element.expanded) {
          element.expanded = false
          return element.expanded
        }
        return true
      })
    }
  }
  }
  triggerAppsExpansionClose(expansionPanel: MatExpansionPanel) {
    if (expansionPanel.expanded === true) {
      this.openedPanels.push(expansionPanel)
      }
      if (expansionPanel.expanded === false) {
       const foundPanel = this.openedPanels.findIndex(panel => {
          return panel._headerId === expansionPanel._headerId
        })
       if (foundPanel > -1) {
        this.openedPanels =  this.openedPanels.slice(0, foundPanel)
       }
        }
    this.triggerExpansionPanel.next(this.openedPanels)
  }
}
