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

export interface IActionUpdate {
    wid: string
    requestId: string
    actionType: string
}
