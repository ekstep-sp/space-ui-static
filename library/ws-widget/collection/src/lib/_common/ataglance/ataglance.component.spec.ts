import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AtaglanceComponent } from './ataglance.component'

describe('AtaglanceComponent', () => {
  let component: AtaglanceComponent
  let fixture: ComponentFixture<AtaglanceComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AtaglanceComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AtaglanceComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
