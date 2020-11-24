import { HttpClient } from '@angular/common/http'
import { Component, Inject, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { LearningAnalyticsService } from '../../services/learning-analytics.service'

interface IUsersObject {
  name: string,
  email: string,
}
interface IDialogData {
  width: any,
  height: any,
  items: IUsersObject[],
  columnSequence: string[],
  title: string,
  users: any[]
}

@Component({
  selector: 'ws-analytics-info-dialog',
  templateUrl: './info-dialog.component.html',
  styleUrls: ['./info-dialog.component.scss'],
})
export class InfoDialogComponent implements OnInit {

  public dataSource: IDialogData['items'] = []
  isLoading: boolean | null = true
  public columnSequence: IDialogData['columnSequence'] = []
  public title = ''
  deletedUserCount = 0

  constructor(
    public dialogRef: MatDialogRef<InfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private analyticsSrv: LearningAnalyticsService,
  ) { }

  async ngOnInit() {
    try {
      this.isLoading = true
      let eventResponse
     if (this.data.showUserDetailsFromUserTable) {
       eventResponse = this.data.totalUsersFromUserTable
       this.assignColumnSequenceAndTitle(eventResponse)
       this.dataSource = this.addIndexToData(eventResponse)
     } else {
      eventResponse = await this.getEventSpecificRequest(this.data, false)
      const dataForDialog =  await this.parseDataForDialog(eventResponse, this.data.title)
      if (dataForDialog.columnSequence.length) {
        this.columnSequence = [...dataForDialog.columnSequence]
      }
      this.title = dataForDialog.title || ''
        const priorUserIDs = dataForDialog.users
        const userDetails = await this.getUsersByIDs(priorUserIDs, false)
        this.deletedUserCount = this.findDeletedUserIDs(priorUserIDs, userDetails)
        this.dataSource = this.addIndexToData(userDetails)
    }
      this.isLoading = false
    } catch (e) {
      // tslint:disable-next-line: no-console
      console.log('error occured while reading data for dialog', e)
      this.dataSource = []
      this.isLoading = null
    }
  }

  // tslint:disable-next-line: variable-name
  findDeletedUserIDs(initialIDs: any, APIData: any) {
    if (Array.isArray(initialIDs) && Array.isArray(APIData) && initialIDs.length && APIData.length) {
      const result = initialIDs.filter((o1: string) => {
        const objectFound = APIData.some((o2: any) => {
          return o1 === o2.wid
        })
        return !objectFound
      })
      return result.length
    }
    return -1
  }

  parseDataForDialog(eventResponseData: any, titleToUse = '') {
    if (eventResponseData) {
      return {
        title: titleToUse,
        users: [...eventResponseData],
        columnSequence: ['Sno', 'Name', 'E-mail', 'Organization'],
        items: [],
      }
    }
    return {
      items: [],
      users: [],
      url: null,
      columnSequence: [],
    }
  }

  getEventSpecificRequest(eventData: any, tryDummy = false): Promise<any> {
    if (tryDummy) {
      return Promise.resolve(
        [
          '7b710f74-8f84-427f-bc13-f4220ed2a1c1',
          '0e419282-16aa-4b03-8d81-a1f93175f7f7',
          'efc891e6-b464-4efb-9a4f-64eed7c7b339',
          'c7e3179f-6497-4b39-a923-e949459d53e3',
          '95e7fec9-e55d-4350-9253-831c71183574',
        ],
      )
    }
    else if(eventData.event == "getting_users_content")
    {
      
        return Promise.resolve(
           
            eventData.userList
          
        )
      
    }
    return this.analyticsSrv.usersInsights(
      eventData.event,
      eventData.endDate,
      eventData.startDate,
      ).toPromise().then((users: any) => users.tnc_users || users.toc_users)
  }

  addIndexToData(objects: any[]) {
    if (Array.isArray(objects)) {
      return objects.map((item, idx) => {
        return {
          index: idx + 1,
          ...item,
          full_name: this.getFullName({ user: item }),
        }
      })
    }
    return []
  }

  getFullName(userObj: any) {
    const finalName = []
    if (userObj.user.first_name) {
      finalName.push(userObj.user.first_name)
    }
    if (userObj.user.middle_name) {
      finalName.push(userObj.user.middle_name)
    }
    if (userObj.user.last_name) {
      finalName.push(userObj.user.last_name)
    }
    return finalName.join(' ')
  }

  hasInSequence(elementName: string) {
    try {
      return this.columnSequence.includes(elementName)
    } catch (e) {
      return false
    }
  }

  async getUsersByIDs(userIDs: string[], tryDummy = true): Promise<any> {
    try {
      if (tryDummy) {
        return [
          {
            email: 'sumit.nautiyal@ilimi.in', first_name: 'sumit',
            last_name: 'nautiyal', org: 'space',
            wid: '7b710f74-8f84-427f-bc13-f4220ed2a1c1',
            department_name: 'Niit',
          },
          {
            email: 'deepakjangra8', first_name: 'Deepak',
            last_name: 'Kumar', org: 'space',
            wid: 'acbf4053-c126-4e85-a0bf-252a896535ea',
            department_name: 'Stackroute Labs',
          },
        ]
      }
      const eventRelatedEndpoint = '/apis/protected/v8/user/details/detailV3'
      const reqBody = {
        wid: [...userIDs],
      }
      return this.http.post(eventRelatedEndpoint, reqBody).toPromise()
    } catch (e) {
      return null
    }
  }

  async assignColumnSequenceAndTitle(eventResponse: any) {
    const dataForDialog =  await this.parseDataForDialog(eventResponse, this.data.title)
    if (dataForDialog.columnSequence.length) {
      this.columnSequence = [...dataForDialog.columnSequence]
    }
    this.title = dataForDialog.title || ''
  }
}
