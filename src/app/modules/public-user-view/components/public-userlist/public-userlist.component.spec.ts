import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicUserlistComponent } from './public-userlist.component';

describe('PublicUserlistComponent', () => {
  let component: PublicUserlistComponent;
  let fixture: ComponentFixture<PublicUserlistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublicUserlistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicUserlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
