import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicUserInvitationComponent } from './public-user-invitation.component';

describe('PublicUserInvitationComponent', () => {
  let component: PublicUserInvitationComponent;
  let fixture: ComponentFixture<PublicUserInvitationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublicUserInvitationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicUserInvitationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
