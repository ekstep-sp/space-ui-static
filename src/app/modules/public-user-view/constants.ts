// tslint:disable-next-line: class-name
export class INFINITE_SCROLL_CONSTANTS {
    public static DISTANCE = 2
    public static THROTTLE = 1000
}
export const DEFAULT_SNACKBAR_TIMEOUT = 5000
export const ENDPOINT_URL = `/usersubmission/usersubmission/user/v2/users/public`
export const DEFAULT_IMAGE_URL = '/assets/images/profile/profileimage.png'
export const BATCH_SIZE = 50
export const DEFAULT_OFFSET = 0
export const DEFAULT_PAGE_NUMBER = 1
export const DAILOG_CONFIRMATION_WIDTH = '500px'
export const DEFAULT_QUERY = ''
export const POST_INVITATION_ACTION_URL = (invitationID: string, invitationType: string) => {
    return `/apis/protected/v8/user/connection/invitation/${invitationID}/${invitationType}`
}
export const CONNECTION_END_POINT = '/apis/protected/v8/user/connection/list'
// this is used to display the status on card
export const CONNECTION_STATUS_CONNECT = 'Connect'
export const CONNECTION_STATUS_PENDING =  'Pending'
export const CONNECTION_STATUS_WITHDRAW =  'Withdraw'

export const ACCEPT_BUTTON = 'Accept'
export const REJECT_BUTTON =  'Reject'

// this is to check the status
export const CHECK_CONNECTION_STATUS_CONNECTED = 'Connected'
export const CHECK_CONNECTION_STATUS_PENDING = 'Pending'
export const CHECK_CONNECTION_STATUS_REJECTED = 'Rejected'

export const CONFIRMATION_TEXT = 'Send connection request to '
export const REVOKING_TEXT = 'Are you sure to withdraw the pending request ? '

export const FAILED_CONNECTION_REQUEST_MSG = 'Failed to send connection request, Please try again later'
export const FAILED_REVOKE_PENDING_REQUEST_MSG = 'Failed to withdraw the pending request, please try again later'
export const FAILED_USERS_CONNECTION_REQUEST_MSG = 'Failed to retrieve connections, try to reloading the page'
export const SEND_REQUEST_CONNECTION_URL = '/apis/protected/v8/user/connection/send-request'
export const REVOKE_REQUEST_CONNECTION_URL = 'apis/protected/v8/user/connection/withdraw-pending'
export const ALLOW_WITHDRAW_STATUS = false
export const ALLOWED_INVITATION_STATES = ['accept', 'reject', 'withdraw']
export const CONSTANT = {
    WITHDRAW_TEXT : 'Withdraw the connection request from ',
    ACCEPT_CONNECTION_MESSAGE : 'Are you sure to accept the connection request from ',
    REJECT_CONNECTION_MESSAGE : 'Are you sure to decline the connection request from ',
    CONNECTION_STATUS_ACCEPT : 'Accept',
    CONNECTION_STATUS_REJECT : 'Reject',
}
