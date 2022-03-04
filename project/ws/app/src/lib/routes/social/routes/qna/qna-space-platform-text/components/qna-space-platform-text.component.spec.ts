import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QnaSpacePlatformTextComponent } from './qna-space-platform-text.component';

describe('QnaSpacePlatformTextComponent', () => {
  let component: QnaSpacePlatformTextComponent;
  let fixture: ComponentFixture<QnaSpacePlatformTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QnaSpacePlatformTextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QnaSpacePlatformTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
