import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { GeneralGuard } from '../../../../../../../src/app/guards/general.guard'
import { PostFetchResolverService } from './resolvers/post-fetch-resolver.service'
import { SocialTimelineResolverService } from './resolvers/social-timeline-resolver.service'
import { BlogEditComponent } from './routes/blogs/blogs-edit/components/blog-edit.component'
import { BlogViewComponent } from './routes/blogs/blogs-view/components/blog-view.component'
import { MyBlogComponent } from './routes/blogs/my-blogs/components/my-blog.component'
import { RecentBlogComponent } from './routes/blogs/recent-blogs/components/recent-blog.component'
import { QnaEditComponent } from './routes/qna/qna-edit/components/qna-edit/qna-edit.component'
import { QnaHomeComponent } from './routes/qna/qna-home/components/qna-home/qna-home.component'
import { QnaViewComponent } from './routes/qna/qna-view/components/qna-view/qna-view.component'
import { PageResolve } from '../../../../../../../library/ws-widget/utils/src/public-api'
import { QnaSpacePlatformTextComponent } from './routes/qna/qna-space-platform-text/components/qna-space-platform-text.component'

const routes: Routes = [
  {
    path: 'blogs',
    component: RecentBlogComponent,
    data: {
      requiredFeatures: ['BLOGS'],
    },
    canActivate: [GeneralGuard],
  },
  {
    path: 'blogs/edit',
    component: BlogEditComponent,
    data: {
      pageType: 'feature',
      pageKey: 'blog',
      requiredFeatures: ['BLOGS'],
      // requiredRoles: ['publisher', 'content-creator', 'editor'],
    },
    resolve: {
      pageData: PageResolve,
    },
    canActivate: [GeneralGuard],
  },
  {
    path: 'blogs/edit/:id',
    component: BlogEditComponent,
    data: {
      pageType: 'feature',
      pageKey: 'blog',
      requiredFeatures: ['BLOGS'],
      // requiredRoles: ['publisher', 'content-creator', 'editor'],
    },
    resolve: {
      pageData: PageResolve,
    },
    canActivate: [GeneralGuard],
  },
  {
    path: 'blogs/me',
    pathMatch: 'full',
    redirectTo: 'blogs/me/drafts',
    data: {
      requiredFeatures: ['BLOGS'],
    },
    canActivate: [GeneralGuard],
  },
  {
    path: 'blogs/me/:tab',
    component: MyBlogComponent,
    data: {
      pageType: 'feature',
      pageKey: 'blog',
      // requiredRoles: ['publisher', 'content-creator', 'editor'],
      requiredFeatures: ['BLOGS'],
    },
    resolve: {
      pageData: PageResolve,
    },
    canActivate: [GeneralGuard],
  },
  {
    path: 'blogs/:id',
    component: BlogViewComponent,
    data: {
      requiredFeatures: ['BLOGS'],
    },
    canActivate: [GeneralGuard],
  },
  {
    path: 'qna',
    component: QnaHomeComponent,
    resolve: {
      resolveData: SocialTimelineResolverService,
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    data: {
      postKind: ['Query'],
      type: 'all',
      requiredFeatures: ['QUESTION_AND_ANSWER'],
    },
    canActivate: [GeneralGuard],
  },
  {
    path: 'qna/edit',
    component: QnaEditComponent,
    data: {
      pageType: 'feature',
      pageKey: 'qna',
      requiredFeatures: ['QUESTION_AND_ANSWER'],
      // requiredRoles: ['publisher', 'content-creator', 'editor'],
    },
    resolve: {
      pageData: PageResolve,
    },
    canActivate: [GeneralGuard],
  },
  {
    path: 'qna/edit/:id',
    component: QnaEditComponent,
    data: {
      pageType: 'feature',
      pageKey: 'qna',
      requiredFeatures: ['QUESTION_AND_ANSWER'],
      // requiredRoles: ['publisher', 'content-creator', 'editor'],
    },
    resolve: {
      pageData: PageResolve,
      resolveData: PostFetchResolverService,
    },
    canActivate: [GeneralGuard],
  },
  {
    path: 'forums',
    loadChildren: () => import('./routes/forums/forum-home.module').then(u => u.ForumHomeModule),
    // component: ForumHomeComponent
  },
  {
    path: 'socialSearch',
    loadChildren: () =>
      import('./routes/socialSearch/social-search.module').then(u => u.SocialSearchModule),
    // component: ForumHomeComponent
  },
  {
    path: 'qna/space-platform',
    component: QnaSpacePlatformTextComponent,
    data: {
      pageType: 'feature',
      pageKey: 'qna',
      requiredFeatures: ['QUESTION_AND_ANSWER'],
      // requiredRoles: ['publisher', 'content-creator', 'editor'],
    },
    resolve: {
      pageData: PageResolve,
      resolveData: PostFetchResolverService,
    },
    canActivate: [GeneralGuard],
  },
  {
    path: 'qna/:id',
    component: QnaViewComponent,
    resolve: {
      resolveData: PostFetchResolverService,
    },
    data: {
      requiredFeatures: ['QUESTION_AND_ANSWER'],
    },
    canActivate: [GeneralGuard],
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SocialRoutingModule { }
