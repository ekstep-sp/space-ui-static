import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'ws-public-user-view',
  templateUrl: './public-user-view.component.html',
  styleUrls: ['./public-user-view.component.scss'],
})
export class PublicUserViewComponent implements OnInit {

  constructor() { }
  cards = [
    {
      name: 'Himshi Bachchas',
      organisation: 'NIIT Limited',
    },
    {
      name: 'Himshi Bachchas',
      organisation: 'NIIT Limited',
    },
    {
      name: 'Himshi Bachchas',
      organisation: 'NIIT Limited',
    },
    {
      name: 'Himshi Bachchas',
      organisation: 'NIIT Limited',
    },
    {
      name: 'Himshi Bachchas',
      organisation: 'NIIT Limited',
    },
    {
      name: 'Himshi Bachchas',
      organisation: 'NIIT Limited',
    },
    {
      name: 'Himshi Bachchas',
      organisation: 'NIIT Limited',
    },
    {
      name: 'Himshi Bachchas',
      organisation: 'NIIT Limited',
    },
    {
      name: 'Himshi Bachchas',
      organisation: 'NIIT Limited',
    },
  ]

  ngOnInit() {
  }

}
