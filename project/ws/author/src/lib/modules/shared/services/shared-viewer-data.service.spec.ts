import { TestBed } from '@angular/core/testing'

import { SharedViewerDataService } from './shared-viewer-data.service'

describe('SharedViewerDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: SharedViewerDataService = TestBed.get(SharedViewerDataService)
    expect(service).toBeTruthy()
  })
})
