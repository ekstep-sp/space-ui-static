import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentMigrationDialogComponent } from './content-migration-dialog.component';

describe('ContentMigrationDialogComponent', () => {
  let component: ContentMigrationDialogComponent;
  let fixture: ComponentFixture<ContentMigrationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentMigrationDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentMigrationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
