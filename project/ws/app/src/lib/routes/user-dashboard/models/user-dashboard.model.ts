import { UUID } from 'jsplumb'
import { Timestamp } from 'rxjs/internal/operators/timestamp'

export namespace NsUserDashboard {
  export interface IUserDashboard {
    username: string,
    firstname: string,
    lastname: string,
    user_id: string,
    emailId: string,
    roles: string[],
    root_org: string,
    organisation: string
  }
  export interface IUserData {
    API_END_POINT: string,
    user_list: IUserList,
    user_list_userTable: IUserList,
    user_accept: IUserAccept,
    dailog_data: IDailogData,
    defaultRoles: IRoles,
    change_roles: IUpdateRoles,
    getAllRoles: IGetAllRoles,
    delete_user: IDeleteUser,
    root_org: string,
    org: string,
    userDetails: IUserDetails,
    API_FOR_USER_DETAILS: string,
    rolesAllowedForDefault: string
    timeZoneFormat: ITimeZone,
    exportOption: {
      mobile?: boolean,
      web?: boolean
    },
    contentMigration: IContentMigration
  }
  export interface IUserListDataFromUserTable {
    wid: UUID
    root_org: string,
    org: string,
    is_active: boolean,
    account_expiry_date: Date,
    kid: UUID,
    username: string,
    first_name: string,
    last_name: string,
    middle_name: string,
    known_as: string,
    email: string,
    gender: string,
    dob: Date,
    languages_known: string[],
    preferred_language: string,
    source_profile_picture: string,
    residence_country: string,
    residence_state: string,
    residence_city: string,
    contact_phone_number_office: string,
    contact_phone_number_home: string,
    contact_phone_number_personal: string,
    employment_status: string,
    contract_type: string,
    job_title: string,
    job_role: string,
    department_name: string,
    sub_department_name: string,
    unit_name: string,
    organization_location_country: string,
    organization_location_state: string,
    organization_location_city: string,
    time_inserted: any,
    time_updated: Timestamp<any>,
    manager_id: string,
    time_zone: string,
    area_of_work: string
    area_of_expertise: string
    is_subscribed_to_space: boolean
  }
  export interface IUserList {
    type: string,
    url: string,
    errorMessage: string,
  }
  export interface IUserAccept {
    type: string,
    url: string,
    errorMessage: string,
    successMessage: string
  }
  export interface IUpdateRoles {
    type: string,
    url: string,
    errorMessage: string,
    successMessage: string,
  }
  export interface IDeleteUser {
    type: string,
    url: string,
    errorMessage: string,
    successMessage: string
  }
  export interface IUserListData {
    disableableCredentialTypes: string[],
    totp: Boolean,
    emailVerified: Boolean,
    firstName: string,
    lastName: string,
    requiredActions: string[]
    access: IAccess,
    createdTimestamp: number,
    id: String,
    enabled: Boolean,
    email: string,
    username: string,
  }
  export interface IAccess {
    manageGroupMembership: Boolean,
    view: Boolean,
    mapRoles: Boolean,
    impersonate: Boolean,
    manage: Boolean
  }
  export interface IGetAllRoles {
    type: string,
    url: string,
    errorMessage: string,
    successMessage: string
  }
  export interface IGetUserData {
    displayName: string,
    id: string,
    mail: string,
    roles: string[],
  }
  export interface IDailogData {
    title: string,
    body: string,
    userName: string
  }
  export interface IDeclineUser {
    email: string,
    user_Id: string,
    wid: string
  }
  export interface IRoles {
    roles: string[]
  }
  export interface IChangeRole {
    wid: String,
    roles: string[],
    email: string,
    name: string,
  }
  export interface IAcceptRole {
    roles: string[],
    user_id: string,
    username: string
  }
  export interface IHeaders {
    rootOrg: string,
    org: string,
    wid_OrgAdmin: string
  }
  export interface ISpecificUserRoles {
    user_id: string,
  }
  export interface IUserDetails {
    url: string
  }
  export interface ITimeZone {
    locales: string,
    timeZone: string,
  }
  export interface IContentMigration {
    rolesAllowed: any
    errorMessage: string
  }
}
