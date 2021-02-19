import { Component, OnInit } from '@angular/core';
import { NsPage, ConfigurationsService } from '@ws-widget/utils';

@Component({
  selector: 'ws-public-user-view',
  templateUrl: './public-user-view.component.html',
  styleUrls: ['./public-user-view.component.scss']
})
export class PublicUserViewComponent implements OnInit {
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar


  constructor(private configSvc: ConfigurationsService) {
    this.pageNavbar = this.configSvc.pageNavBar
  }

  ngOnInit() {
  }

}
