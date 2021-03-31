import { Injectable } from '@angular/core'
import { of, throwError } from 'rxjs'
import { catchError, delay, map, switchMap } from 'rxjs/operators'
import { dummyCuratorResponse, isDummy } from '../../constants'
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
        if (isDummy) {
          return of({
            ok: true, status: 200, data: 'Migration started successfully',
          }).pipe()
        }
        return of(null)
      }),
      map((result: any) => {
        if (!result) {
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
    if (isDummy) {
      return of(dummyCuratorResponse).pipe(delay(2000))
    }
    return this.coreSrvc.getContentCreatorIDs().pipe(
      catchError((_e: any) => {
        return throwError(new Error('Network Error occured, try again later !!!'))
      }),
      switchMap((response: any) => {
        if ('data' in response && Array.isArray(response.data) && response.data.length) {
          return this.coreSrvc.getUserDetailsByIDs(response.data)
          .pipe(map((finalData: any) => ('data' in finalData ? finalData.data : null)))
        }
        return of([])
      }),
      catchError((_processErr: any) => {
        return throwError(new Error('Error occured while processing the request, try later'))
      })
    )
  }
}
