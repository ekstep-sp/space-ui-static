export interface IGaEventObject {
    eventName?: string
    eventCategory?: string
    eventLabel?: string
    eventAction?: string
    eventValue?: any | null
    pageTitle?: string
    pagePath?: string
    eventType?: string
    send_to?: string
}

export interface IPageVisit extends IGaEventObject {
    pagePath: string
    eventType: 'page_view'
}

export interface IClickEvent extends IGaEventObject {
    eventType: 'click'
}
