import { TestBed } from '@angular/core/testing'

import { GoogleAnalyticsCoreService } from './google-analytics-core.service'

describe('GoogleAnalyticsCoreService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: GoogleAnalyticsCoreService = TestBed.get(GoogleAnalyticsCoreService)
    expect(service).toBeTruthy()
  })
})
