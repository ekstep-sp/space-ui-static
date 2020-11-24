import { Output,EventEmitter } from '@angular/core'
import { Component, Input,OnChanges } from '@angular/core'
import { ROOT_WIDGET_CONFIG } from '@ws-widget/collection'
import { NsAnalytics } from '../../models/learning-analytics.model'
import { InfoDialogComponent } from '../info-dialog/info-dialog.component'
import { MatDialog } from '@angular/material'
import { LearningAnalyticsService } from '../../services/learning-analytics.service'
import { END_DATE, START_DATE } from '@ws/author/src/lib/constants/constant'
@Component({
  selector: 'ws-analytics-content-card',
  templateUrl: './content-card.component.html',
  styleUrls: ['./content-card.component.scss'],
})
export class ContentCardComponent implements OnChanges {
  @Input() pieData: any
  @Input() completed = 0
  @Input() source = ''
  @Input() progress = ''
  @Input() title = ''
  @Input() lexId = ''
  @Input() contentUrl = ''
  @Input() isExternal = false
  @Input() contentData: any
  totalUsersFromUserTable: any = []
  @Output() infoClick = new EventEmitter<string>()
  // @Input() showToolTip = false
  @Input() showUsers = false
  searchQuery = ''
  startDate = ''
  endDate = ''
  contentType = 'Course'
  filterArray: NsAnalytics.IFilterObj[] = []
  @Input() displayChart = false
  nonGraphData = {}
  widgetPieGraph: NsAnalytics.IGraphWidget = {} as NsAnalytics.IGraphWidget
  margin = {
    top: 25,
    right: 20,
    bottom: 25,
    left: 20,
  }
  graphData1: number[] = []
  labels: string[] = []
  constructor(
    public dialog: MatDialog,
    private analyticsSrv: LearningAnalyticsService,
  ) { }

  ngOnChanges() {
    debugger
    if (this.contentData.hasOwnProperty('type') && this.contentData.type) {
      this.displayChart = false
      this.nonGraphData = this.contentData.data
      console.log('recieved in cards ', this.nonGraphData)
    } else {
      this.displayChart = true
      this.graphData(this.contentData.data)
    }
  }
  async triggerInfoPopup(showUserDetailsFromUserTable = false) {
   
      const eventType = 'content_viewed_by_users';
      const titleToUse = 'Users List';
      // await this.getAllUsers(this.startDate, this.endDate)
      this.dummyUsers();

      this.openDialog({
        event: eventType,
        title: titleToUse,
        width: '50%',
        height: '55%',
        startDate: this.startDate,
        endDate: this.endDate,
        contentType: this.contentType,
        searchQuery: this.searchQuery,
        filters: this.filterArray,
        totalUsersFromUserTable: this.totalUsersFromUserTable,
        showUserDetailsFromUserTable: showUserDetailsFromUserTable
      })
    }

    openDialog(_data: any) {
      this.dialog.open(InfoDialogComponent, {
        data: _data,
        width: _data.width,
        height: _data.height,
      })
    }
    async getAllUsers(startDate: string, endDate: string): Promise<any> {
      let params: any
      if (startDate && endDate) {
        params = {
          startDate:  this.analyticsSrv.getLocalTime(startDate, START_DATE),
          endDate: this.analyticsSrv.getLocalTime(endDate, END_DATE),
        }
      }
      const data = await this.analyticsSrv.getAllUsers(params)
      if (data.ok) {
        this.totalUsersFromUserTable = data.DATA
      }
    }
      dummyUsers()
      {
        this.totalUsersFromUserTable = [
          {
          "department_name": "Rang De",
          "email": "Ram@rangde.org",
          "first_name": "RamKrishna",
          "last_name": "NK",
          "wid": "109e239b-bf55-47d6-943a-c8f6bf27bac9"
        },
      {
        "department_name": "Paso Pacifico",
        "email": "sarah@pasopacifico.org",
        "first_name": "Sarah",
        "last_name": "Otterestrom",
        "wid": "2a18603f-f51e-434c-a3ce-852db6c3f496"
      },
      {
        "department_name": "Vismaya Kalike",
        "email": "vig9295@gmail.com",
        "first_name": "Vignesh",
        "last_name": "Prasad",
        "wid": "872a5cc0-7b83-45dd-827c-cbb1439b666b"
      }]
  
      }
     
  
  graphData(pieData: any) {
    this.labels = ['0-25%', '25-50%', '50-75%', '75-100%']
    pieData.forEach((cur: any) => {
      this.graphData1.push(cur.y)
    })
    this.widgetPieGraph = {
      widgetType: ROOT_WIDGET_CONFIG.graph._type,
      widgetSubType: ROOT_WIDGET_CONFIG.graph.graphGeneral,
      widgetData: {
        graphId: this.contentData.id,
        graphType: 'pie',
        graphHeight: '50px',
        graphWidth: '90%',
        graphLegend: false,
        graphLegendFontSize: 11,
        graphTicksFontSize: 11,
        graphGridLinesDisplay: false,
        graphDefaultPalette: 'default',
        graphData: {
          labels: this.labels,
          datasets: [
            {
              data: this.graphData1,
              backgroundColor: [
                'rgb(255, 82, 61)', 'rgb(240, 179, 35)', 'rgb(32, 150, 205)', 'rgb(120, 157, 74)',
              ],
              borderWidth: 1,
            },
          ],
        },
      },
    }
  }


  
}
