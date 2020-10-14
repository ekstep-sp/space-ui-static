import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicShareViewComponent } from './public-share-view.component';

describe('PublicShareViewComponent', () => {
  let component: PublicShareViewComponent;
  let fixture: ComponentFixture<PublicShareViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublicShareViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicShareViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
