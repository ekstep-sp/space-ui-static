import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicShareOverviewComponent } from './public-share-overview.component';

describe('PublicShareOverviewComponent', () => {
  let component: PublicShareOverviewComponent;
  let fixture: ComponentFixture<PublicShareOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublicShareOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicShareOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
