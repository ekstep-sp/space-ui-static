import { Component, OnInit, Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { CONFIRMATION_TEXT, REVOKING_TEXT, CONNECTION_STATUS_WITHDRAW, CONNECTION_STATUS_PENDING, CONNECTION_STATUS_CONNECT, CONSTANT } from '../../constants'

@Component({
  selector: 'ws-public-user-dialog',
  templateUrl: './public-user-dialog.component.html',
  styleUrls: ['./public-user-dialog.component.scss'],
})
export class PublicUserDialogComponent implements OnInit {

  message = ''

  constructor(
    public dialogRef: MatDialogRef<PublicUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    ngOnInit() {
    this.getMessage()
    }

    getMessage() {
     if (this.data.actionType === CONNECTION_STATUS_CONNECT) {
       this.message = `${CONFIRMATION_TEXT}${this.data.targetUser} ?`
     } else if (this.data.actionType === CONNECTION_STATUS_PENDING) {
      this.message = REVOKING_TEXT
     } else if (this.data.actionType === CONNECTION_STATUS_WITHDRAW) {
      this.message = `${CONSTANT.WITHDRAW_TEXT}${this.data.targetUser}`
     } else if (this.data.actionType === CONSTANT.CONNECTION_STATUS_ACCEPT) {
       this.message = `${CONSTANT.ACCEPT_CONNECTION_MESSAGE}${this.data.targetUser} ?`
     } else if (this.data.actionType === CONSTANT.CONNECTION_STATUS_REJECT) {
      this.message = `${CONSTANT.REJECT_CONNECTION_MESSAGE}${this.data.targetUser} ?`
     } else {
       this.message = ''
     }
   }
   onConfirmClick(): void {
    this.dialogRef.close({ event: 'close', actionType: this.data.actionType, connectionData: this.data.connectionData })
  }
}
