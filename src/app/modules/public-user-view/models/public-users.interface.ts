export interface IPublicUsersResponse {
    MESSAGE: string
    STATUS: string
    APP_ID: string
    DATA: IPublicUsers[]
}
export interface IPublicUsers {
    wid: string
    user_properties: {
        value: string
        type: 'json'
    }
    department_name: string
    first_name: string
    middle_name: string
    last_name: string
    source_profile_picture: string
    email: string
    time_inserted: string
}

export interface IUpdateDataObj {query: string, searchSize: number, offset: number}
