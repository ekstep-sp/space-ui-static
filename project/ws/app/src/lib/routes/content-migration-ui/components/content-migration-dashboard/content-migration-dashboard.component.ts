import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, ParamMap } from '@angular/router'
import { BehaviorSubject, of } from 'rxjs'
import { take, catchError, tap, finalize } from 'rxjs/operators'
import { UserMigrationUtilsService } from '../../services/user-migration-utils/user-migration-utils.service'
import { NsPage, ConfigurationsService } from '@ws-widget/utils/src/public-api'
import { IMigrationReqBody } from '../../models/user-migration.model'
import { errorMessage } from '../../constants'
import { MatSnackBar } from '@angular/material'
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
  isError$ = new BehaviorSubject<boolean>(false)
  isDisabled$ = new BehaviorSubject<boolean>(false)
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly configSvc: ConfigurationsService,
    public snackBar: MatSnackBar,
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
             tap((data: any) => {
          if (data.ok && data.status === 200) {
            const sortedUserList = this.sortUserListData(data.data)
           const filterdArray = this.filterNonSourceUser(sortedUserList)
            this.userList$.next(filterdArray)
          } else {
            this.isDisabled$.next(true)
            this.snackBar.open(errorMessage, '', {
              duration: 3000,
            })
          }
        }),  catchError((_error: any) => {
          this.isDisabled$.next(true)
              this.snackBar.open(errorMessage, '', {
                duration: 3000,
              })
              return of(null)
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
      to: this.targetUser.wid || '',
      from: this.sourceUser.id || '',
    }
     this.utilsSrvc.sendMigrationRequest(reqObject).pipe(
       take(1),
       tap((data: any) => {
         if (data.ok && data.status === 200) {
             this.isSuccess$.next(true)
             this.isError$.next(false)
         } else {
          this.isSuccess$.next(false)
          this.isError$.next(true)
         }
        }),
       catchError((_e: any) => {
        this.isSuccess$.next(false)
        this.isError$.next(true)
          return of(null)
        }),
       finalize(() => {
          this.isLoading$.next(false)
        }),
     ).subscribe()
  }
  }
  rejectContentMigration() {
    this.targetUser = null
  }
  sortUserListData(data: IUserListResponse[]) {
   return data.sort((obj1: { first_name: string }, obj2: { first_name: string }) => (obj1.first_name) < obj2.first_name ? -1 : 1)
  }
  filterNonSourceUser(userList: IUserListResponse[]) {
    const sourceUserId = (this.sourceUser && 'id' in this.sourceUser) ? this.sourceUser.id : ''
        return (userList.filter((userObject: IUserListResponse) => userObject.wid !== sourceUserId))
  }
}
