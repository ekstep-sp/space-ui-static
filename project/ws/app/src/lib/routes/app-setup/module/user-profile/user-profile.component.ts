import { Component, OnInit } from '@angular/core';
import { ConfigurationsService, NsPage } from '@ws-widget/utils/src/public-api';

@Component({
  selector: 'ws-app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar

  constructor(private configSvc: ConfigurationsService) { }

  ngOnInit() {
  }

}
