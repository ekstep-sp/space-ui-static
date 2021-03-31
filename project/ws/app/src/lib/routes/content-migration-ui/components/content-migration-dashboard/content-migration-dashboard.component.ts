import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ws-app-content-migration-dashboard',
  templateUrl: './content-migration-dashboard.component.html',
  styleUrls: ['./content-migration-dashboard.component.scss']
})
export class ContentMigrationDashboardComponent implements OnInit {

  constructor(
    private readonly activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
    const routeData = this.activatedRoute.data.subscribe(_=>{
      console.log("value", _)
    })
    console.log('recieved route data as ', routeData)
  }

}
