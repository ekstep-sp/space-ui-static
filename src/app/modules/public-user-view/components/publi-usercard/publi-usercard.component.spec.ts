import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PubliUsercardComponent } from './publi-usercard.component';

describe('PubliUsercardComponent', () => {
  let component: PubliUsercardComponent;
  let fixture: ComponentFixture<PubliUsercardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PubliUsercardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PubliUsercardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
