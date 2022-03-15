import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { QnaViewModule } from './qna-view/qna-view.module'
import { QnaHomeModule } from './qna-home/qna-home.module'
import { QnaEditModule } from './qna-edit/qna-edit.module';
import { QnaSpacePlatformTextModule } from './qna-space-platform-text/qna-space-platform-text.module';
import { QnaSocietalThinkingModule } from './qna-societal-thinking/qna-societal-thinking.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    QnaEditModule,
    QnaHomeModule,
    QnaViewModule,
    QnaSpacePlatformTextModule,
    QnaSocietalThinkingModule
  ],
  exports: [],
})
export class QnaModule { }
