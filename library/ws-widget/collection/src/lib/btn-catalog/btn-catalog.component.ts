import { Component, Input } from '@angular/core'
import { TreeCatalogService } from '../tree-catalog/tree-catalog.service'
import { TFetchStatus } from '@ws-widget/utils'
import { NSSearch } from '../_services/widget-search.model'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { Router, NavigationEnd } from '@angular/router'
import { filter } from 'rxjs/internal/operators/filter'
import { sortBy } from 'lodash'

@Component({
  selector: 'ws-widget-btn-catalog',
  templateUrl: './btn-catalog.component.html',
  styleUrls: ['./btn-catalog.component.scss'],
})
export class BtnCatalogComponent extends WidgetBaseComponent
  implements NsWidgetResolver.IWidgetData<any> {

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
        this.catalogItems = sortBy(this.catalogItems, 'displayName')
      },
      () => this.catalogFetchStatus = 'error',
    )
  }

}
