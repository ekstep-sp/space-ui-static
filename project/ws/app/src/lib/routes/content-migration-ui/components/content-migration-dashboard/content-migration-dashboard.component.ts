import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { UserMigrationUtilsService } from '../../services/user-migration-utils/user-migration-utils.service';

interface IUser {
  name: string
  id: string
}
@Component({
  selector: 'ws-app-content-migration-dashboard',
  templateUrl: './content-migration-dashboard.component.html',
  styleUrls: ['./content-migration-dashboard.component.scss']
})
export class ContentMigrationDashboardComponent implements OnInit {

  sourceUser: Partial<IUser | null> = null
  targetUser: Partial<IUser | null> = null
  error$ = new BehaviorSubject<string>('')
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly utilsSrvc: UserMigrationUtilsService,
  ) { }

  ngOnInit() {
  this.activatedRoute.queryParamMap
  .pipe(take(1))
  .subscribe((params: ParamMap) => {
      this.sourceUser = { name: params.get('name'), id: params.get('id') } as IUser
      try {
        this.utilsSrvc.validateUser(this.sourceUser)
      } catch (e) {
        this.error$.next(e.toString())
      }
    })
  }

}
