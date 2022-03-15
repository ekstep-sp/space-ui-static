import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QnaSocietalThinkingComponent } from './qna-societal-thinking.component';

describe('QnaSocietalThinkingComponent', () => {
  let component: QnaSocietalThinkingComponent;
  let fixture: ComponentFixture<QnaSocietalThinkingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QnaSocietalThinkingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QnaSocietalThinkingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
