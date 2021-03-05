import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CONFIRMATION_TEXT, REVOKING_TEXT, CONNECTION_STATUS_REJECTED, CONNECTION_STATUS_PENDING, CONNECTION_STATUS_CONNECT} from '../../constants';
import { CONSTANT } from '../../constants';

@Component({
  selector: 'ws-public-user-dialog',
  templateUrl: './public-user-dialog.component.html',
  styleUrls: ['./public-user-dialog.component.scss']
})
export class PublicUserDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<PublicUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }
   message = ''
  ngOnInit() {
  this.getMessage()
    
  }
   getMessage(){
     if(this.data.confirmOrWidthdraw === CONNECTION_STATUS_CONNECT ){
       this.message = `${CONFIRMATION_TEXT}${this.data.targetUser} ?` 
     }
     if(this.data.confirmOrWidthdraw === CONNECTION_STATUS_PENDING){
      this.message = REVOKING_TEXT
     }
     if(this.data.confirmOrWidthdraw === CONNECTION_STATUS_REJECTED){
      this.message = `${CONSTANT.WITHDRAW_TEXT}${this.data.targetUser}`
     }
   }
   onConfirmClick(): void {
    this.dialogRef.close({ event: 'close', confirmOrWidthdraw: this.data.confirmOrWidthdraw });
  }
}
