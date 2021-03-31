import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserMigrationUtilsService {

  constructor() { }

  validateUser(userToValidate: any) {
    if (!('id' in userToValidate) || !userToValidate['id']) {
      throw new Error('id is required in the user object')
    }
    if (!('name' in userToValidate) || !userToValidate['name']) {
      throw new Error('name is required in the user object')
    }
  }
}
