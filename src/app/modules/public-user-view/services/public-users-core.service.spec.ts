import { TestBed } from '@angular/core/testing'

import { PublicUsersCoreService } from './public-users-core.service'

describe('PublicUsersCoreService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: PublicUsersCoreService = TestBed.get(PublicUsersCoreService)
    expect(service).toBeTruthy()
  })
})
