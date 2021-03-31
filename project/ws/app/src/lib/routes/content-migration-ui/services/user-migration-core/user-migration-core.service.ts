import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import * as constants from '../../constants'
import { IMigrationReqBody } from '../../models/user-migration.model'

@Injectable({
  providedIn: 'root',
})
export class UserMigrationCoreService {

  constructor(private readonly http: HttpClient) { }

  migrateUserContent(data: IMigrationReqBody) {
    return this.http.post(constants.migrationApi, data)
  }

  getContentCreatorIDs() {
    return this.http.get(constants.contentCreatorIDsApi)
  }

  getUserDetailsByIDs(ids: string[]) {
    return this.http.post(constants.userDetailsByIDApi, {
      wid: [...ids],
      userDetails: constants.allowedProperties,
    })
  }
}
