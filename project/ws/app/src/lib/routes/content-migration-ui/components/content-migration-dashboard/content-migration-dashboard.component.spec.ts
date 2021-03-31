import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentMigrationDashboardComponent } from './content-migration-dashboard.component';

describe('ContentMigrationDashboardComponent', () => {
  let component: ContentMigrationDashboardComponent;
  let fixture: ComponentFixture<ContentMigrationDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentMigrationDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentMigrationDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
