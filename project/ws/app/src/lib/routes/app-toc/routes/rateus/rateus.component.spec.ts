import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { RateusComponent } from './rateus.component'

describe('RateusComponent', () => {
  let component: RateusComponent
  let fixture: ComponentFixture<RateusComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RateusComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(RateusComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
