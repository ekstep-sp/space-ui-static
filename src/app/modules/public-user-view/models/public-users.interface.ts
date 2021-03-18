export interface IPublicUsersResponse {
    MESSAGE: string
    STATUS: string
    APP_ID: string
    DATA: IPublicUsers[]
}

interface IBaseUserProperties {
    type: string
}
export interface IFormattedUserProperties extends IBaseUserProperties {
    value: {
        profileLink: string
        bio: string
    }
}

export interface IRawUserProperties extends IBaseUserProperties {
    value: string
}
export interface IPublicUsers {
    wid: string
    user_properties: IRawUserProperties | IFormattedUserProperties | null
    department_name: string
    first_name: string
    middle_name: string | null
    last_name: string
    source_profile_picture: string
    email: string
    time_inserted: string
}

export interface IUpdateDataObj { query: string, searchSize: number, offset: number }

export interface IUserConnections {
    id:  string,
    created_on: string,
    last_updated_on:  string,
    status: string,
    requested_by: string,
    email?:  string,
    user_id?:  string,
    fname?: string,
    lname?: string,
    root_org?: string,
    org?: string
}
export interface IRequestUpdate {
    requested_by: string
    requested_to: string
    comment?: string
}
export interface IRevokeConnection {
    request_id: string
}
