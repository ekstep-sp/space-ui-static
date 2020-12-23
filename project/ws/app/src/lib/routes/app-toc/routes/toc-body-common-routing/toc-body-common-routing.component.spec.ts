import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TocBodyCommonRoutingComponent } from './toc-body-common-routing.component'

describe('TocBodyCommonRoutingComponent', () => {
  let component: TocBodyCommonRoutingComponent
  let fixture: ComponentFixture<TocBodyCommonRoutingComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TocBodyCommonRoutingComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TocBodyCommonRoutingComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
