import { Injectable } from '@angular/core'
import { of, throwError } from 'rxjs'
import { catchError, map, switchMap } from 'rxjs/operators'
import { IMigrationReqBody } from '../../models/user-migration.model'
import { UserMigrationCoreService } from '../user-migration-core/user-migration-core.service'

@Injectable({
  providedIn: 'root',
})
export class UserMigrationUtilsService {

  constructor(
    private readonly coreSrvc: UserMigrationCoreService
    ) { }

  validateUser(userToValidate: any) {
    if (!('id' in userToValidate) || !userToValidate['id']) {
      throw new Error('id is required in the user object')
    }
    if (!('name' in userToValidate) || !userToValidate['name']) {
      throw new Error('name is required in the user object')
    }
  }

  sendMigrationRequest(migrationData: IMigrationReqBody) {
    return this.coreSrvc.migrateUserContent(migrationData).pipe(
      catchError((_e: any) => {
        return of({ ok: false })
      }),
      map((result: any) => {
        if (result !== null) {
          return {
            ok: false, error: 'An Error occured, please try again later',
          }
        }
        return {
          ok: true, status: 200,
        }
      }),
      catchError((_processError: any) => {
        return of({
          ok: false, error: 'Unexpected error occured, try again later',
        })
      })
    )
  }

  getCuratorList() {
    return this.coreSrvc.getContentCreatorIDs().pipe(
      catchError((_e: any) => {
        return throwError(new Error('Network Error occured, try again later !!!'))
      }),
      map((response: any) => response.users),
      switchMap((curatorsIDList: any) => {
        if (Array.isArray(curatorsIDList) && curatorsIDList.length) {
          return this.coreSrvc.getUserDetailsByIDs(curatorsIDList).pipe(map((data: any) => {
            return {
              data, ok: true, status: 200,
            }
          }))
        }
        return of([])
      }),
      catchError((_processErr: any) => {
        return throwError(new Error('Error occured while processing the request, try later'))
      })
    )
  }
}
