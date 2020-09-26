import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AppBtnFeatureComponent } from './app-btn-feature.component'

describe('AppBtnFeatureComponent', () => {
  let component: AppBtnFeatureComponent
  let fixture: ComponentFixture<AppBtnFeatureComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppBtnFeatureComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AppBtnFeatureComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
