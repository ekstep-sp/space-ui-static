import { Injectable } from '@angular/core'
import { Subject } from 'rxjs'
import { ConfigurationsService } from './configurations.service'
import { WsEvents } from './event.model'
@Injectable({
  providedIn: 'root',
})
export class EventService {
  private eventsSubject = new Subject<WsEvents.IWsEvents<any>>()
  public events$ = this.eventsSubject.asObservable()

  constructor(private readonly configSrvc: ConfigurationsService) {
    // this.focusChangeEventListener()
  }

  dispatchEvent<T>(event: WsEvents.IWsEvents<T>) {
    this.eventsSubject.next(event)
  }

  // helper functions
  raiseInteractTelemetry(type: string, subType: string | undefined, object: any, from?: string) {
    this.dispatchEvent<WsEvents.IWsEventTelemetryInteract>({
      eventType: WsEvents.WsEventType.Telemetry,
      eventLogLevel: WsEvents.WsEventLogLevel.Info,
      data: {
        type,
        subType,
        object,
        eventSubType: WsEvents.EnumTelemetrySubType.Interact,
      },
      from: from || '',
      to: 'Telemetry',
    })
  }

  get isGuestUser() {

    return this.configSrvc.isGuestUser

  }
  // private focusChangeEventListener() {
  //   fromEvent(window, 'focus').subscribe(() => {
  //     this.raiseInteractTelemetry('focus', 'gained', {})
  //   })
  //   fromEvent(window, 'blur').subscribe(() => {
  //     this.raiseInteractTelemetry('focus', 'lost', {})
  //   })
  // }
}
