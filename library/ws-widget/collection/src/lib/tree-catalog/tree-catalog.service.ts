import { Injectable } from '@angular/core'
import { Observable, of } from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { tap } from 'rxjs/operators'
import { NSSearch } from '../_services/widget-search.model'
import { ConfigurationsService } from '@ws-widget/utils/src/public-api';

const API_END_POINTS = {
  catalog: '/apis/protected/v8/catalog',
}
const PROTECTED_SLAG_V8 = '/apis/protected/v8'
const API_END_POINT = {
  CATALOG_AUTHORING: `${PROTECTED_SLAG_V8}/social/catalog`,
}

@Injectable({
  providedIn: 'root',
})
export class TreeCatalogService {

  _catalog: NSSearch.IFilterUnitContent[] | null = null
  _catalog$: Observable<NSSearch.IFilterUnitContent[]> | null = null

  constructor(
    private http: HttpClient,
    private configSvc: ConfigurationsService
  ) { }

  getCatalog(url: string, type?: string, tags?: string) {
    if (!type || !tags) {
      return this.getFullCatalog(url)
    }

    return this.http.post<NSSearch.IFilterUnitContent[]>(url, { type, tags })
  }

  getFullCatalog(url?: string) {
    if (this._catalog) {
      return of(this._catalog)
    }

    if (!this._catalog$) {
      this._catalog$ = this.http.get<NSSearch.IFilterUnitContent[]>(url ? url : API_END_POINTS.catalog).pipe(
        tap(catalog => this._catalog = catalog),
      )
    }

    return this._catalog$
  }
  fetchCatalog(): Observable<any> {
    return this.http.post(`${API_END_POINT.CATALOG_AUTHORING}`, {
      rootOrg: this.configSvc.rootOrg,
      org: this.configSvc.org,
    })
  }
}
