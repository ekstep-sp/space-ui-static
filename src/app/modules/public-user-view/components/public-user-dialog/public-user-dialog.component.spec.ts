import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicUserDialogComponent } from './public-user-dialog.component';

describe('PublicUserDialogComponent', () => {
  let component: PublicUserDialogComponent;
  let fixture: ComponentFixture<PublicUserDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublicUserDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicUserDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
