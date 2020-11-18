import { Component, Input } from '@angular/core'
import { TreeCatalogService } from '../tree-catalog/tree-catalog.service'
import { TFetchStatus } from '@ws-widget/utils'
import { NSSearch } from '../_services/widget-search.model'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { Router, NavigationEnd } from '@angular/router'
import { filter } from 'rxjs/internal/operators/filter'
@Component({
  selector: 'ws-widget-btn-catalog',
  templateUrl: './btn-catalog.component.html',
  styleUrls: ['./btn-catalog.component.scss'],
})
export class BtnCatalogComponent extends WidgetBaseComponent
  implements NsWidgetResolver.IWidgetData<any> {
    tempExploreCatalog: any
    finalCatalogItems: any
    filteredCatalogItems: any
  constructor(private catalogSvc: TreeCatalogService,
              private readonly router: Router
  ) {
    super()
    this.router.events.pipe(

      filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe(value => {
        this.showBottomBorder = value.urlAfterRedirects.includes('/page/explore/')
      })
  }

  @Input() widgetData!: any
  catalogItems: NSSearch.IFilterUnitContent[] | null = null
  catalogFetchStatus: TFetchStatus = 'none'
  showBottomBorder = false

  getCatalog() {
    this.catalogFetchStatus = 'fetching'
    this.catalogSvc.getFullCatalog().subscribe(
      (catalog: NSSearch.IFilterUnitContent[]) => {
        this.catalogFetchStatus = 'done'
        if (catalog.length === 1 && catalog[0].children) {
          this.catalogItems = catalog[0].children
        } else {
          this.catalogItems = catalog
        }
      this.mergeCatalogNode(this.catalogItems)
        // this.catalogItems = sortBy(this.catalogItems, 'displayName')
        console.log(catalog, this.catalogItems)
      },
      () => this.catalogFetchStatus = 'error',
    )
  }
  mergeCatalogNode(catalogElem: any) {
   // tslint:disable-next-line:no-parameter-reassignment
  //  catalogElem =  sortBy(this.catalogItems, 'displayName')
    this.catalogSvc.fetchCatalog().subscribe((res: any) => {
      this.tempExploreCatalog = res.Common.child
      this.finalCatalogItems = res.Common.child
       catalogElem.forEach((catalog: any) => {
          // tslint:disable-next-line:no-shadowed-variable
           this.tempExploreCatalog.forEach((parent: any, index: any) => {
          if (catalog.displayName === parent.name) {
            catalog.nodeId = parent.nodeId
             this.finalCatalogItems[index] = parent
            if (catalog.children.length > 0) {
              this.mergeChildNode(parent, catalog, index)
             }
          }
})
})
   })
  }
mergeChildNode(parent: any, catalog: any, index1: any) {
  // tslint:disable-next-line:no-parameter-reassignment
  parent.child = parent.child.filter((v: any, i: any) => parent.child.findIndex((item: any) => item.name === v.name) === i)
  if (parent.child) {
  catalog.children.forEach((catalogChild: any) => {
    parent.child.forEach((child: any, index: any) => {
      if (catalogChild.displayName === child.name) {
        catalogChild.nodeId = child.nodeId
        this.finalCatalogItems[index1].child[index] = child
        if (catalogChild.children.length > 0) {
          this.mergeGrandChildren(child , catalogChild, index1, index)
       }
        }
    })
  })
}
}
mergeGrandChildren(firstChild: any, catalogChild: any, index1: any, index2: any) {
  // tslint:disable-next-line:max-line-length
 firstChild.child = firstChild.child.filter((objOne: any) => {
    return catalogChild.children.some((objTwo: any) => {
        return objOne.name === objTwo.displayName
    })
  })
  if (firstChild.child) {
   catalogChild.children.forEach((catalogGrandChild: any) => {
     firstChild.child.forEach((grandChild: any, index: any) => {
      if (catalogGrandChild.displayName === grandChild.name) {
        catalogGrandChild.nodeId = grandChild.nodeId
        this.finalCatalogItems[index1].child[index2].child[index] = grandChild
        }
     })
   })
  }
}
}
