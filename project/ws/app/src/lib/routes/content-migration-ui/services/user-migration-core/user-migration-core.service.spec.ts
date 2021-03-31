import { TestBed } from '@angular/core/testing';

import { UserMigrationCoreService } from './user-migration-core.service';

describe('UserMigrationCoreService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UserMigrationCoreService = TestBed.get(UserMigrationCoreService);
    expect(service).toBeTruthy();
  });
});
