import { TestBed } from '@angular/core/testing';

import { UserMigrationUtilsService } from './user-migration-utils.service';

describe('UserMigrationUtilsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UserMigrationUtilsService = TestBed.get(UserMigrationUtilsService);
    expect(service).toBeTruthy();
  });
});
