import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicUserViewComponent } from './public-user-view.component';

describe('PublicUserViewComponent', () => {
  let component: PublicUserViewComponent;
  let fixture: ComponentFixture<PublicUserViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublicUserViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicUserViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
