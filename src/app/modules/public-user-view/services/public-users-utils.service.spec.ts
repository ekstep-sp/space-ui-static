import { TestBed } from '@angular/core/testing';

import { PublicUsersUtilsService } from './public-users-utils.service';

describe('PublicUsersUtilsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PublicUsersUtilsService = TestBed.get(PublicUsersUtilsService);
    expect(service).toBeTruthy();
  });
});
