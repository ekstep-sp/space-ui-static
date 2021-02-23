import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicUsercardComponent } from './public-user-card.component';

describe('PublicUsercardComponent', () => {
  let component: PublicUsercardComponent;
  let fixture: ComponentFixture<PublicUsercardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublicUsercardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicUsercardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
