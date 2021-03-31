import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, ParamMap } from '@angular/router'
import { BehaviorSubject, of } from 'rxjs'
import { take, catchError, map, tap, finalize } from 'rxjs/operators'
import { UserMigrationUtilsService } from '../../services/user-migration-utils/user-migration-utils.service'
import { NsPage, ConfigurationsService } from '@ws-widget/utils/src/public-api'
import { IMigrationReqBody } from '../../models/user-migration.model'
interface IUser {
  name: string
  id: string
}
interface IUserListResponse {
  wid: string,
  first_name: string,
  last_name: string,
  department_name: string
}
@Component({
  selector: 'ws-app-content-migration-dashboard',
  templateUrl: './content-migration-dashboard.component.html',
  styleUrls: ['./content-migration-dashboard.component.scss'],
})
export class ContentMigrationDashboardComponent implements OnInit {

  sourceUser: Partial<IUser | null> = null
  // targetUser: Partial<IUser | null> = null
  targetUser: Partial<IUserListResponse | null> = null
  error$ = new BehaviorSubject<string>('')
  userList$ = new BehaviorSubject<any[]>([])
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  isLoading$ = new BehaviorSubject<boolean>(false)
  isSuccess$ = new BehaviorSubject<boolean>(false)
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly configSvc: ConfigurationsService,
    private readonly utilsSrvc: UserMigrationUtilsService,
  ) { }

  ngOnInit() {
  this.activatedRoute.queryParamMap
  .pipe(take(1))
  .subscribe((params: ParamMap) => {
      this.sourceUser = { name: params.get('name'), id: params.get('id') } as IUser
      try {
        this.utilsSrvc.validateUser(this.sourceUser)
        this.utilsSrvc.getCuratorList().
        pipe(take(1),
             tap(data => {
          if (data.ok && data.status === 200) {
            console.log(data)
            this.userList$.next(data.data.data)
          }
        })).subscribe()
      } catch (e) {
        this.error$.next(e.toString())
      }
    })
  }
  acceptContentMigration() {
    this.isLoading$.next(true)
  if (this.targetUser && 'wid' in this.targetUser && this.sourceUser && 'id' in this.sourceUser) {
    const reqObject: IMigrationReqBody = {
      from: this.targetUser.wid || '',
      to: this.sourceUser.id || '',
    }
     this.utilsSrvc.sendMigrationRequest(reqObject).pipe(
       take(1),
       map(response => response),
       tap((data: any) => {
        this.isLoading$.next(false)
         if (data.ok && data.status === 200) {
             this.isSuccess$.next(true)
         }
        }),
       catchError((_e: any) => {
        this.isSuccess$.next(false)
          return of(null)
        }),
       finalize(() => {
          this.isLoading$.next(false)
        }),
     ).subscribe()
  //   this.utilsSrvc.sendMigrationRequest(reqObject).pipe(take(1)).subscribe(
  //     data =>{
  //       console.log("data", data)
  //     }
  //   )
  }
  }
  rejectContentMigration() {
    this.targetUser = null
  }
}
