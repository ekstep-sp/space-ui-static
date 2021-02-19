import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
// import { Router } from '@angular/router';
import { NsPage, ConfigurationsService } from '@ws-widget/utils';

@Component({
  selector: 'ws-public-user-view',
  templateUrl: './public-user-view.component.html',
  styleUrls: ['./public-user-view.component.scss']
})
export class PublicUserViewComponent implements OnInit {
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar

  globalSearch = new FormControl('')
  hideGlobalSearch = false

  constructor(private configSvc: ConfigurationsService,
    //  private router: Router
  ) {
    this.pageNavbar = this.configSvc.pageNavBar
  }

  ngOnInit() {
  }

  // triggerGlobalSearch() {
  //   const termToSearch = this.globalSearch.value.trim() ? this.globalSearch.value.trim() : ''
  //   // tslint:disable-next-line: max-line-length
  //   const lang = this.configSvc.userPreference && this.configSvc.userPreference.selectedLocale ? this.configSvc.userPreference.selectedLocale : 'en'
  //   const filters = { contentType: ['Resource', 'Course', 'Collection'] }
  //   this.router.navigate(['/app/search/learning'], {
  //     queryParams: {
  //       lang,
  //       q: termToSearch,
  //       f: JSON.stringify(filters),
  //     },
  //   })
  // }
}
