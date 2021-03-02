import { Component, OnInit } from '@angular/core'
import { ConfigurationsService, NsPage } from '@ws-widget/utils/src/public-api'
import { BehaviorSubject } from 'rxjs'
// import { PublicUsersUtilsService } from '../../services/public-users-utils.service'

@Component({
  selector: 'ws-public-user-invitation',
  templateUrl: './public-user-invitation.component.html',
  styleUrls: ['./public-user-invitation.component.scss'],
})
export class PublicUserInvitationComponent implements OnInit {

  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true)
  constructor(
    private readonly configSvc: ConfigurationsService,
    // private readonly _utilSvc: PublicUsersUtilsService,
  ) { }

  ngOnInit() {}

}
