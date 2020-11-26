import { Output, EventEmitter, Component, Input, OnInit } from '@angular/core'
import { ROOT_WIDGET_CONFIG } from '@ws-widget/collection'
import { NsAnalytics } from '../../models/learning-analytics.model'
import { InfoDialogComponent } from '../info-dialog/info-dialog.component'
import { MatDialog } from '@angular/material'
@Component({
  selector: 'ws-analytics-content-card',
  templateUrl: './content-card.component.html',
  styleUrls: ['./content-card.component.scss'],
})
export class ContentCardComponent implements OnInit {
  @Input() pieData: any
  @Input() completed = 0
  @Input() source = ''
  @Input() progress = ''
  @Input() title = ''
  @Input() lexId = ''
  @Input() contentUrl = ''
  @Input() isExternal = false
  @Input() contentData: any
  userList: any = []
  @Output() infoClick = new EventEmitter<string>()
  // @Input() showToolTip = false
  @Input() showUsers = false
  searchQuery = ''
  startDate = ''
  endDate = ''
  contentType = ''
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
  ) { }

  ngOnInit() {
    if (this.contentData.hasOwnProperty('type') && this.contentData.type) {
      this.displayChart = false
      this.nonGraphData = this.contentData.data
    } else {
      this.displayChart = true
      this.graphData(this.contentData.data)
    }
  }
  async triggerInfoPopup(showUserDetailsFromUserTable = false) {
      const eventType = 'getting_users_content'
      const titleToUse = 'Users List'
      // await this.getAllUsers()
      // this.dummyUsers();
      this.openDialog({
        showUserDetailsFromUserTable,
        event: eventType,
        title: titleToUse,
        width: '50%',
        height: '55%',
        startDate: this.startDate,
        endDate: this.endDate,
        searchQuery: this.searchQuery,
        filters: this.filterArray,
        userList: await this.getAllUsers(),
      })
    }

    openDialog(_data: any) {
      this.dialog.open(InfoDialogComponent, {
        data: _data,
        width: _data.width,
        height: _data.height,
      })
    }
    async getAllUsers(): Promise<any> {
      if (this.displayChart) {
        return this.contentData.users_accessed.map((user: any) => user.key)
      } return this.contentData.data.user_visits.map((user: any) => user.userID)
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
