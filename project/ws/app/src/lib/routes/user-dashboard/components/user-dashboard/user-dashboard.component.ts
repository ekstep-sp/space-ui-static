import { Component, OnInit, ViewChild } from '@angular/core'
import { UserDashboardService } from '../../services/user-dashboard.service'
import { ActivatedRoute, Router } from '@angular/router'
import { Subscription, Observable, forkJoin, of } from 'rxjs'
import { NsUserDashboard } from '../../models/user-dashboard.model'
import { FormControl } from '@angular/forms'
import { ConfigurationsService, NsPage } from '@ws-widget/utils/src/public-api'
import { MatSort, MatTableDataSource, MatSnackBar, MatDialog } from '@angular/material'
import { AcceptUserDailogComponent } from '../accept-user-dailog/accept-user-dailog.component'
import { DailogUserDashboardComponent } from '../dailog-user-dashboard/dailog-user-dashboard.component'
import { SelectionModel } from '@angular/cdk/collections'
import { catchError } from 'rxjs/operators'

@Component({
  selector: 'ws-app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss'],
})
export class UserDashboardComponent implements OnInit {

  userDashboardDataFromConfig: Subscription | null = null
  userDashboardData: NsUserDashboard.IUserData | any

  navBackground: Partial<NsPage.INavBackground> | null = null
  selectedRow: NsUserDashboard.IUserListDataFromUserTable[] = []
  constructor(
    private userDashboardSvc: UserDashboardService,
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
    private activateRoute: ActivatedRoute,
    private configSvc: ConfigurationsService,
    private router: Router,
  ) {

    const instanceConfig = this.configSvc.userProfile
    if (instanceConfig) {
      this.widLoggedinUser = instanceConfig.userId
    }
  }
  public userList!: NsUserDashboard.IUserListDataFromUserTable | undefined
  employees = this.userList
  public selectedVal: string | any
  myControl = new FormControl()
  searchForName: string[] = []
  options: string[] = this.searchForName
  filteredOptions: Observable<string[]> | any
  headersForAllUsers: NsUserDashboard.IHeaders = {} as any
  widLoggedinUser: string | any
  getRootOrg: string | any
  getOrg: string | any
  userListArray: NsUserDashboard.IUserListDataFromUserTable[] = []
  // @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator | any
  @ViewChild(MatSort, { static: false }) sort!: MatSort
  dataSource: MatTableDataSource<NsUserDashboard.IUserListDataFromUserTable> | any
  selection = new SelectionModel<NsUserDashboard.IUserListDataFromUserTable>(true, [])

  getUserData: NsUserDashboard.IGetUserData = {} as any
  displayedColumns =
    ['select', 'SlNo', 'first_name', 'organization', 'email', 'time_inserted', 'Actions']
  allroles!: NsUserDashboard.IRoles
  allrolesForBulkChangeRole: NsUserDashboard.IRoles | null = null
  paramsForChangeRole: NsUserDashboard.IChangeRole = {} as any
  paramsForChangeRoleForBulkUser: NsUserDashboard.IChangeRole = {} as any
  roles: string[] = []
  widUser = ''
  headersForChangeUserRole: NsUserDashboard.IHeaders = {} as any
  headersForChangeUserRoleForBulkUser: NsUserDashboard.IHeaders = {} as any
  userdefaultRoles: NsUserDashboard.IRoles = {} as NsUserDashboard.IRoles
  userDashboardDataForDailog!: NsUserDashboard.IDailogData
  paramsForDecline: NsUserDashboard.IDeclineUser = {} as any
  isConfirmed!: Boolean
  headersForRejectUser: NsUserDashboard.IHeaders = {} as any
  isLoad = false
  errorMessage!: string
  email = ''
  displayNameForUser = ''

  ngOnInit() {
    this.userDashboardDataFromConfig = this.activateRoute.data.subscribe(data => {
      this.userDashboardData = data.pageData.data
      this.userDashboardDataForDailog = data.pageData.data.dailog_data,
        this.userdefaultRoles.roles = data.pageData.data.rolesAllowedForDefault
      this.errorMessage = data.pageData.data.user_list.errorMessage

      this.userDashboardSvc.setUserDashboardConfig(this.userDashboardData)
      this.getRootOrg = data.pageData.data.root_org,
        this.getOrg = data.pageData.data.org
      this.navBackground = this.configSvc.pageNavBar
    })
    this.selectedVal = 'all'
    this.getAllUsers()
  }

  // ngAfterViewInit() {
  //   this.dataSource.paginator = this.paginator;
  //   this.dataSource.sort = this.sort;
  // }

  // ngOnDestroy() {
  //   this.loaderService.changeLoad.next(false)
  // }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length
    const numRows = this.dataSource.data.length
    return numSelected === numRows
  }
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach((row: NsUserDashboard.IUserListDataFromUserTable) => this.selection.select(row))
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: NsUserDashboard.IUserListDataFromUserTable): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.email}`
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase() // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue

  }
  async getAllUsers() {
    this.isLoad = true
    this.headersForAllUsers.rootOrg = this.getRootOrg
    this.headersForAllUsers.org = this.getOrg
    this.headersForAllUsers.wid_OrgAdmin = this.widLoggedinUser
    // this.loaderService.changeLoad.next(true)
    // this.selectedVal = value
    const userListResponse = await this.userDashboardSvc.getAllUsers(this.headersForAllUsers)
    if (userListResponse.ok) {
      if (userListResponse.DATA != null) {
        this.userListArray = userListResponse.DATA
        // tslint:disable-next-line: ter-prefer-arrow-callback

        this.sortUserWithDate(this.userListArray)
        this.convertTimestampToLocalDate(this.userListArray)

        // this.enableFilter(this.userListArray)
        // this.userListArray = userListResponse.DATA

        // the datasource contains email verified users.
        this.dataSource = new MatTableDataSource<NsUserDashboard.IUserListDataFromUserTable>(this.userListArray)
        if (this.dataSource != null) {
          this.isLoad = false
        }
        setTimeout(() => {
          // this.dataSource.paginator = this.paginator
          this.dataSource.sort = this.sort
        })
      }
    }
  }

  enableFilter(userData: any) {
    // tslint:disable-next-line: no-boolean-literal-compare
    return userData.filter((items: { emailVerified: boolean }) => items.emailVerified === true)
  }

  convertTimestampToLocalDate(userList: NsUserDashboard.IUserListDataFromUserTable[]) {
    const locales = this.userDashboardData.timeZoneFormat ? this.userDashboardData.timeZoneFormat.locales : 'en-GB'
    const timeZone = this.userDashboardData.timeZoneFormat ? this.userDashboardData.timeZoneFormat.timeZone : 'GMT'
    return userList.map(userData => {
      const date = new Date(userData.time_inserted)
      userData.time_inserted = date.toLocaleString(locales , {  timeZone })
    })
  }

  get showDownload() {
    return this.userDashboardSvc.allowVisibility
  }

  sortUserWithDate(userList: NsUserDashboard.IUserListDataFromUserTable[]) {
    return userList.sort((a, b) => {
      // tslint:disable-next-line: prefer-const
      let firstValue = new Date(a.time_inserted)
      // tslint:disable-next-line: prefer-const
      let secondValue = new Date(b.time_inserted)
      return firstValue > secondValue ? -1 : (firstValue < secondValue) ? 1 : 0
    })
  }
  async changeRole(element: any) {
    this.isLoad = true
    this.userDashboardSvc.fetchPublishersList(element.email).subscribe(async data => {
      this.getUserData.roles = []
      if (data.length) {
        this.getUserData = data[0]
        this.getUserData.roles = data[0].roles
        this.roles = this.getUserData.roles
        this.email = data[0].mail
        this.displayNameForUser = data[0].displayName
        this.widUser = data[0].id
      } else {
        this.roles = []
      }
      const getAllRoles = await this.userDashboardSvc.getAllRoles(this.getRootOrg, this.widLoggedinUser, this.getOrg)
      if (getAllRoles && this.roles) {
        this.isLoad = false
        const dialogResponseForChangeRoles = this.dialog.open(AcceptUserDailogComponent, {
          width: '400px',
          // height: '300px',
          data: {
            allRoles: getAllRoles.DATA,
            defaultValueToBeChecked: this.roles,
            // tslint:disable-next-line: prefer-template
            userName: element.first_name + ' ' + element.last_name,
            defaultRoles: this.userdefaultRoles.roles,
          },
        })
        dialogResponseForChangeRoles.afterClosed().subscribe(result => {
          this.allroles = result.data
          if (this.allroles) {
            this.changeUserRoles(this.allroles, this.widUser, this.displayNameForUser)
          }
        })
      }
    })
  }
  async changeUserRoles(roles: any, getwid: any, displayName: string) {
    this.isLoad = true
    this.headersForChangeUserRole.rootOrg = this.getRootOrg
    this.headersForChangeUserRole.org = this.getOrg
    this.headersForChangeUserRole.wid_OrgAdmin = this.widLoggedinUser
    this.paramsForChangeRole.wid = getwid,
      this.paramsForChangeRole.roles = []
    this.paramsForChangeRole.roles = roles
    this.paramsForChangeRole.email = this.email
    this.paramsForChangeRole.name = displayName
    const userChangedRoleResponse = await this.userDashboardSvc.changeRoles(this.paramsForChangeRole, this.headersForChangeUserRole)
    this.isLoad = false
    if (userChangedRoleResponse.ok) {
      this.paramsForChangeRole = {} as any
      this.headersForChangeUserRole = {} as any

      this.email = ''
      this.widUser = ''
      this.roles = [],
        this.displayNameForUser = ''
      this.getUserData.roles = []
      // tslint:disable-next-line: no-non-null-assertion
      this.snackBar.open(userChangedRoleResponse.MESSAGE, '', {
        duration: 3000,
      })
    } else {
      this.snackBar.open(userChangedRoleResponse.MESSAGE, '', {
        duration: 3000,
      })
    }
  }

  openDialogForReject(element: any) {
    const dialogResponse = this.dialog.open(DailogUserDashboardComponent, {
      width: '300px',
      data: {
        title: this.userDashboardDataForDailog.title,
        body: this.userDashboardDataForDailog.body,
        // tslint:disable-next-line: prefer-template
        userName: element.first_name + ' ' + element.last_name,
        email: element.email,
      },
    })

    dialogResponse.afterClosed().subscribe(result => {
      this.isConfirmed = result
      if (this.isConfirmed) {
        this.deleteUser(element)
      }
    })
  }

  async deleteUser(element: any) {
    this.isLoad = true

    if (typeof (this.paramsForDecline.email) === 'undefined') {
      this.paramsForDecline.email = element.email
      this.paramsForDecline.user_Id = element.kid
      this.paramsForDecline.wid = element.wid
    }
    this.headersForRejectUser.rootOrg = this.getRootOrg
    this.headersForRejectUser.org = this.getOrg
    this.headersForRejectUser.wid_OrgAdmin = this.widLoggedinUser
    const userDeletedResponse = await this.userDashboardSvc.deleteUser(this.paramsForDecline, this.headersForRejectUser)
    this.isLoad = false
    this.paramsForDecline = {} as any
    this.headersForRejectUser = {} as any
    if (userDeletedResponse.ok) {
      // tslint:disable-next-line: no-non-null-assertion
      this.snackBar.open(userDeletedResponse.MESSAGE, '', {
        duration: 3000,
      })
    } else {
      this.snackBar.open(userDeletedResponse.MESSAGE, '', {
        duration: 3000,
      })
    }

  }

  async bulkChangeRole() {
    this.isLoad = true
    this.selectedRow = this.selection.selected
    const getAllRolesForBulkChangeRole = await this.userDashboardSvc.getAllRoles(this.getRootOrg, this.widLoggedinUser, this.getOrg)
    if (getAllRolesForBulkChangeRole) {
      this.isLoad = false
      const dialogResponseForChangeRoles = this.dialog.open(AcceptUserDailogComponent, {
        width: '400px',
        data: {
          allRoles: getAllRolesForBulkChangeRole.DATA,
          defaultValueToBeChecked: [],
          defaultRoles: this.userdefaultRoles.roles,
        },
      })
      dialogResponseForChangeRoles.afterClosed().subscribe(result => {
        this.allrolesForBulkChangeRole = result.data
        if (this.allrolesForBulkChangeRole) {
          this.changeRoleForEachUser(this.selectedRow, this.allrolesForBulkChangeRole)
        }
      })
    }
  }
  changeRoleForEachUser(selectedRow: NsUserDashboard.IUserListDataFromUserTable[], rolesForAllUsers: any) {
    this.isLoad = true
    this.headersForChangeUserRoleForBulkUser.rootOrg = this.getRootOrg
    this.headersForChangeUserRoleForBulkUser.org = this.getOrg
    this.headersForChangeUserRoleForBulkUser.wid_OrgAdmin = this.widLoggedinUser
    this.paramsForChangeRoleForBulkUser.roles = []
    this.paramsForChangeRoleForBulkUser.roles = rolesForAllUsers
    if (selectedRow.length) {
      // tslint:disable-next-line: prefer-const
      const userResponse = selectedRow.map(user => {
        return this.userDashboardSvc.fetchPublishersList(user.email).pipe(
          catchError((error: any) => {
            return of(error)
          })
        )

      })

      forkJoin(userResponse).subscribe(response => {
        const responseAfterFilter = response.filter(data => {
          if (data.length !== 0) {
            return data
          }
        })
        if (responseAfterFilter.length) {
          const changedRoleResponse = responseAfterFilter.map(responseWithWidAndEmail => {
            // if (responseWithWidAndEmail) {
            this.paramsForChangeRoleForBulkUser.wid = responseWithWidAndEmail[0].id,
              this.paramsForChangeRoleForBulkUser.email = responseWithWidAndEmail[0].mail
            this.paramsForChangeRoleForBulkUser.name = responseWithWidAndEmail[0].displayName
            // tslint:disable-next-line: no-console
            // tslint:disable-next-line: max-line-length
            const observableForChangeRole = this.userDashboardSvc.changeRoles(this.paramsForChangeRoleForBulkUser, this.headersForChangeUserRoleForBulkUser)
            this.paramsForChangeRoleForBulkUser.name = ''
            this.paramsForChangeRoleForBulkUser.wid = ''
            this.paramsForChangeRoleForBulkUser.email = ''
            return observableForChangeRole
          })

          forkJoin(changedRoleResponse).subscribe(finalResponse => {
            this.isLoad = false
            const failedResponseEmail = finalResponse.filter(data => {
              if (!data.ok) {
                return data.ErrorResponseData
              }
              return ''

            })
            if (failedResponseEmail.length > 0) {
              // tslint:disable-next-line: prefer-template
              this.snackBar.open('Sorry, something went wrong, Please try again', '', {
                duration: 3000,
              })
            } else {
              this.snackBar.open('Role Updated Successfully', '', {
                duration: 3000,
              })
            }
          },
            // tslint:disable-next-line: align
            _error => {
              this.snackBar.open('something went wrong', '', {
                duration: 3000,
              })
            })
        }
      })
    }
  }
  removeSelectedFromCheckbox() {
    this.selection.clear()
  }

  export(type: string) {
    const filterdResults = this.dataSource.filteredData || this.userListArray
    const data = this.userDashboardSvc.mapDataForExport(filterdResults)
    if (type === 'csv') {
      this.userDashboardSvc.exportDashboardUsers(data, 'csv', 'user-dashboard-details')
    } else if (type === 'xlsx') {
      this.userDashboardSvc.exportDashboardUsers(data, 'xlsx', 'user-dashboard-details', 'users')
    }
  }
   migrateContent(element: any) {
   this.userDashboardSvc.fetchPublishersList(element.email).subscribe(data => {
      if (data.length && data[0].roles && this.userDashboardData.contentMigration && this.userDashboardData.contentMigration.rolesAllowed) {
        const userRoles = data[0].roles
        const rolesAllowedForContentMigration = this.userDashboardData.contentMigration.rolesAllowed
        const rolesOK = rolesAllowedForContentMigration.some((_role: string) => userRoles.includes(_role))
        if (rolesOK) {
          this.router.navigate(['/app/migrate-user'], { queryParams :
             { id: element.wid , name: `${element.first_name} ${element.last_name}` }
           })
        } else {
          this.snackBar.open(this.userDashboardData.contentMigration.errorMessage, '', {
            duration: 3000,
          })
        }
      } else {
        this.router.navigate(['/app/migrate-user'], { queryParams :
          { id: element.wid , name: `${element.first_name} ${element.last_name}` } })
      }
    })
  }
}
