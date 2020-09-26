import { TestBed } from '@angular/core/testing'

import { AppBtnFeatureService } from './app-btn-feature.service'

describe('AppBtnFeatureService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: AppBtnFeatureService = TestBed.get(AppBtnFeatureService)
    expect(service).toBeTruthy()
  })
})
