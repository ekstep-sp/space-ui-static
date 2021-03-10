// tslint:disable-next-line: class-name
export class INFINITE_SCROLL_CONSTANTS {
    public static DISTANCE = 2
    public static THROTTLE = 1000
}
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
}, {
    id: 'acbf4053-c126-4e85-a0bf-252a896535ea',
     created_on: '2/03/2021',
      last_updated_on: '2/03/2021',
       status: 'Connected',
        requested_by: 'acbf4053-c126-4e85-a0bf-252a896535ea',
         email: 'abhishek@seedsindia.org',
          user_id: '2aed1387-fc4b-4e2c-a57a-ae2030328e14',
           fname: 'Abhishek',
            lname: 'Das',
             root_org: 'space',
              org: 'SEEDS',
    },
    {
    id: 'abc-1234',
     created_on: '2/03/2021',
      last_updated_on: '2/03/2021',
       status: 'Connected',
        requested_by: '10af49b7-3874-41ca-9d4c-02cfbe5a9ba8',
         email: 'abhishek@seedsindia.org',
          user_id: 'acbf4053-c126-4e85-a0bf-252a896535ea',
           fname: 'Anjitha',
            lname: 'Das',
             root_org: 'space',
              org: 'SEEDS',
    },
    {
    id: '00b4a61e-be61-4e48-9edc-62a29172ef2b',
     created_on: '2/03/2021',
      last_updated_on: '2/03/2021',
       status: 'Pending',
        requested_by: 'acbf4053-c126-4e85-a0bf-252a896535ea',
         email: 'anjitha.r98@gmail.com',
          user_id: '00b4a61e-be61-4e48-9edc-62a29172ef2b',
           fname: 'Aakash',
            lname: 'Vishwakarma',
            root_org: 'space',
             org: 'Sustainable Environment and Ecological Development Society',
    },
    {
    id: 'da9d37a0-1ed3-49a1-a69f-7b045569d41e',
     created_on: '2/03/2021',
      last_updated_on: '2/03/2021',
       status: 'Connected',
        requested_by: 'acbf4053-c126-4e85-a0bf-252a896535ea',
         email: 'anjitha.r98@gmail.com',
          user_id: 'da9d37a0-1ed3-49a1-a69f-7b045569d41e',
           fname: 'Aayushi',
            lname: 'Chaturvedi',
             root_org: 'space',
              org: 'WPP India CSR Foundation',
    },
    {
    id: 'fd5bb3d6-bd45-414e-9a43-248f25584369',
     created_on: '2/03/2021',
      last_updated_on: '2/03/2021',
       status: 'Rejected',
        requested_by: 'acbf4053-c126-4e85-a0bf-252a896535ea',
         email: 'anjitha.r98@gmail.com',
          user_id: 'fd5bb3d6-bd45-414e-9a43-248f25584369',
           fname: 'Abhishek',
            lname: 'Srivatsava',
            root_org: 'space',
            org: 'WPP India CSR Foundation',
    },
    {
        id: 'abcd-23222',
           status: 'Pending',
            requested_by: '0c8ad557-b346-4d85-82ea-a6a773345a5d',
             email: 'anjitha.r98@gmail.com',
              user_id: 'acbf4053-c126-4e85-a0bf-252a896535ea',
        },
]
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
export const REVOKE_REQUEST_CONNECTION_URL = 'apis/protected/v8/user/connection/withdraw-request'
export const ALLOW_WITHDRAW_STATUS = false
export const ALLOWED_INVITATION_STATES = ['accept', 'reject', 'withdraw']
export const CONSTANT = {
    WITHDRAW_TEXT : 'Withdraw the connection request from ',
    ACCEPT_CONNECTION_MESSAGE : 'Are you sure to accept connection request from ',
    REJECT_CONNECTION_MESSAGE : 'Are you sure to decline connection request from ',
    CONNECTION_STATUS_ACCEPT : 'Accept',
    CONNECTION_STATUS_REJECT : 'Reject',
}
