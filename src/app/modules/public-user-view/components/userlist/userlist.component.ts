import { Component, OnInit, Input, OnChanges } from '@angular/core'

@Component({
  selector: 'ws-userlist',
  templateUrl: './userlist.component.html',
  styleUrls: ['./userlist.component.scss'],
})
export class UserlistComponent implements OnInit, OnChanges {
  
  @Input() !userData:any = {} 
  constructor() { }

  ngOnInit() {

  }
  ngOnChanges(){
   console.log("userdata",this.userData)
  }

}
