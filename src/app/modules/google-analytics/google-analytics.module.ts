import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { GoogleAnalyticsCoreService } from './services/google-analytics-core.service'

@NgModule({
  declarations: [],
  providers: [GoogleAnalyticsCoreService],
  imports: [
    CommonModule,
  ],
})
export class GoogleAnalyticsModule { }
