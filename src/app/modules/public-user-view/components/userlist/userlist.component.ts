import { Component, OnInit, Input, OnChanges } from '@angular/core'

@Component({
  selector: 'ws-userlist',
  templateUrl: './userlist.component.html',
  styleUrls: ['./userlist.component.scss'],
})
export class UserlistComponent implements OnInit{
  
  @Input() !userData:any= {};
  userdata: any;

  defaultUserImage='/assets/images/profile/profileimage.jpg';

  constructor() { }

  ngOnInit() {

  }
  // ngOnChanges(){
  //   if(!!this.userproperties){
  //  this.userdata = JSON.parse(this.userproperties);
  //  console.log("userdata",this.userproperties)

  // }
}
  


