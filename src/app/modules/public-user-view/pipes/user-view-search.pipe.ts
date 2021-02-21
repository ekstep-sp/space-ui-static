import { Pipe, PipeTransform } from '@angular/core';
import { IPublicUsers } from '../models/public-users.interface';
const { isArray } = Array

@Pipe({
  name: 'userViewSearch'
})
export class UserViewSearchPipe implements PipeTransform {

  transform(users: IPublicUsers[], find: string): IPublicUsers[] {
    console.log("allData", users)
    console.log("value ", find)
    if (!users) { return [] }
    if (!find) { return users }
    const finding = find.toLowerCase()

    return this.searching(users, finding)
  }



  searching(entries: any[], search: string) {

    const searchs = search.toLowerCase()

    return entries.filter(obj => {
      const keys: string[] = Object.keys(obj)
      return keys.some(key => {
        const value = obj[key]
        console.log("VALUE", value)
        console.log(" KEY", key)
        console.log("OBJECT", obj)
        if (!!value && isArray(value)) {
          return value.some(v => {
            return v.toString().toLowerCase().includes(searchs)
          })
        }
        if (!!value && !isArray(value)) {
          return value.toString().toLowerCase().includes(searchs)
        }
      })
    })


  }
}
