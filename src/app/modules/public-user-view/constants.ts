// tslint:disable-next-line: class-name
export class INFINITE_SCROLL_CONSTANTS {
    public static DISTANCE = 2
    public static THROTTLE = 1000
}
export const ENDPOINT_URL = `/usersubmission/usersubmission/user/v2/users/public`
export const DEFAULT_IMAGE_URL = '/assets/images/profile/profileimage.png'
export const FETCH_CONNECTION_URL = ``
export const BATCH_SIZE = 50
export const DEFAULT_OFFSET = 0
export const DEFAULT_PAGE_NUMBER = 1
export const DAILOG_CONFIRMATION_WIDTH = '500px'
export const DEFAULT_QUERY = ''
export const POST_INVITATION_ACTION_URL = ''
export const DUMMY_RESPONSE = [{
  id: '10af49b7-3874-41ca-9d4c-02cfbe5a9ba8',
  created_on: '2/03/2021',
  last_updated_on: '2/03/2021',
  status: 'Connected',
  requested_by: 'acbf4053-c126-4e85-a0bf-252a896535ea',
  email: 'anjitha.r98@gmail.com',
  user_id: '10af49b7-3874-41ca-9d4c-02cfbe5a9ba8',
  fname: 'Aaditeshwar',
  lname: 'Seth',
  root_org: 'space',
  org: 'IIT Delhi',
}]
export const CONNECTION_END_POINT = ''
// this is used to display the status on card
export const CONNECTION_STATUS_CONNECT = 'Connect'
export const CONNECTION_STATUS_PENDING =  'Pending'
export const CONNECTION_STATUS_REJECTED =  'Withdraw'
// this is to check the status
export const CHECK_CONNECTION_STATUS_CONNECTED = 'Connected'
export const CHECK_CONNECTION_STATUS_PENDING = 'Pending'
export const CHECK_CONNECTION_STATUS_REJECTED = 'Rejected'

export const CONFIRMATION_TEXT = 'Send connection request to '
export const REVOKING_TEXT = 'Are you sure to revoke the pending request ? '

export const FAILED_CONNECTION_REQUEST_MSG = 'Failed to send connection request, Please try again later'
export const FAILED_REVOKE_PENDING_REQUEST_MSG = 'Failed to withdraw the pending request, please try again later'
export const FAILED_USERS_CONNECTION_REQUEST_MSG = 'Failed to retrieve latest connection, please try reloading app'
export const SEND_REQUEST_CONNECTION_URL = ''
export const REVOKE_REQUEST_CONNECTION_URL = ''
export const ALLOW_WITHDRAW_STATUS = false
export const CONSTANT = {
    WITHDRAW_TEXT : 'Withdraw the connection request from ',
}

