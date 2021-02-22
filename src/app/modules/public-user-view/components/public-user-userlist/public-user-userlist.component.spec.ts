import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicUserUserlistComponent } from './public-user-userlist.component';

describe('PublicUserUserlistComponent', () => {
  let component: PublicUserUserlistComponent;
  let fixture: ComponentFixture<PublicUserUserlistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublicUserUserlistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicUserUserlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
