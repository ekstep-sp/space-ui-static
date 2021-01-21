import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ViewerCuratorListComponent } from './viewer-curator-list.component'

describe('ViewerCuratorListComponent', () => {
  let component: ViewerCuratorListComponent
  let fixture: ComponentFixture<ViewerCuratorListComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewerCuratorListComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewerCuratorListComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
