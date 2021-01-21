import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AppTocContentDetailsTreeComponent } from './app-toc-content-details-tree.component'

describe('AppTocContentDetailsTreeComponent', () => {
  let component: AppTocContentDetailsTreeComponent
  let fixture: ComponentFixture<AppTocContentDetailsTreeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppTocContentDetailsTreeComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AppTocContentDetailsTreeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
