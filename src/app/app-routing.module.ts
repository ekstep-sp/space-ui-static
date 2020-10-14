import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { ErrorResolverComponent, PageComponent, PageModule } from '@ws-widget/collection'
import { ExploreDetailResolve, PageResolve } from '@ws-widget/utils'
import { LearningGuard } from '../../project/ws/app/src/lib/routes/my-learning/guards/my-learning.guard'
import { InvalidUserComponent } from './component/invalid-user/invalid-user.component'
import { LoginRootComponent } from './component/login-root/login-root.component'
import { ETopBar } from './constants/topBar.constants'
import { EmptyRouteGuard } from './guards/empty-route.guard'
import { ExternalUrlResolverService } from './guards/external-url-resolver.service'
import { GeneralGuard } from './guards/general.guard'
import { LoginGuard } from './guards/login.guard'
import { FeaturesComponent } from './routes/features/features.component'
import { FeaturesModule } from './routes/features/features.module'
import { MobileAppHomeComponent } from './routes/public/mobile-app/components/mobile-app-home.component'
// import { PublicAboutComponent } from './routes/public/public-about/public-about.component'
import { PublicContactComponent } from './routes/public/public-contact/public-contact.component'
import { PublicFaqComponent } from './routes/public/public-faq/public-faq.component'
import { TncComponent } from './routes/tnc/tnc.component'
import { TncAppResolverService } from './services/tnc-app-resolver.service'
import { TncPublicResolverService } from './services/tnc-public-resolver.service'
import { AppTocResolverService } from '@ws/app/src/lib/routes/app-toc/resolvers/app-toc-resolver.service'
import { AssetguidelinesComponent } from './routes/public/assetguidelines/assetguidelines.component'
import { GrievanceredressalComponent } from './routes/public/grievanceredressal/grievanceredressal.component'
import { AppHomeComponent } from './component/app-home/app-home.component'
// import { PublicCollaboratorsComponent } from './routes/public/public-collaborators/public-collaborators.component'
// import { AppCollaboratorsComponent } from './component/app-collaborators/app-collaborators.component'
import { DataprivacyComponent } from './routes/public/dataprivacy/dataprivacy.component'
import { TermsofuseComponent } from './routes/public/termsofuse/termsofuse.component'
import { ContentpolicyandcommunicationComponent } from './routes/public/contentpolicyandcommunication/contentpolicyandcommunication.component'
import { AboutCollaboratorComponent } from './component/about-collaborator/about-collaborator.component'
import { TourVideoComponent } from './routes/public/tour-video/tour-video.component'
import { LicencepolicyComponent } from './routes/public/licencepolicy/licencepolicy.component'

// 💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥
// Please declare routes in alphabetical order
// 😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [EmptyRouteGuard],
    component: AppHomeComponent,
  },
  {
    path: 'practice/behavioral',
    pathMatch: 'full',
    redirectTo: 'page/embed-behavioural-skills',
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/activities',
    data: {

      pageType: 'feature',
      pageKey: 'activities',
    },
    resolve: {
      pageData: PageResolve,
    },
    loadChildren: () => import('./routes/route-activities.module').then(u => u.RouteActivitiesModule),
    canActivate: [GeneralGuard],
  },

  {
    path: 'admin',
    data: {
      requiredRoles: ['register-admin', 'admin', 'content-assignment-admin'],
    },
    loadChildren: () => import('./routes/route-admin.module').then(u => u.RouteAdminModule),
    canActivate: [GeneralGuard],
  },

  {
    path: 'analytics',
    loadChildren: () => import('./routes/route-analytics.module').then(u => u.RouteAnalyticsModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/channels',
    loadChildren: () => import('./routes/route-channels.module').then(u => u.RouteChannelsModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/content-assignment',
    loadChildren: () =>
      import('./routes/route-content-assignment.module').then(u => u.RouteContentAssignmentModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/gamification',
    loadChildren: () =>
      import('./routes/route-gamification.module').then(u => u.RouteGamificationModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/setup',
    loadChildren: () => import('./routes/route-app-setup.module').then(u => u.RouteAppSetupModule),
  },
  {
    path: 'app/feedback',
    data: {
      pageType: 'feature',
      pageKey: 'feedback',
    },
    resolve: {
      pageData: PageResolve,
    },
    loadChildren: () =>
      import('./routes/route-feedback-v2.module').then(u => u.RouteFeedbackV2Module),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/features',
    component: FeaturesComponent,
    data: {
      pageType: 'feature',
      pageKey: 'feedback',
    },
    resolve: {
      pageData: PageResolve,
    },
    canActivate: [GeneralGuard],
  },

  {
    path: 'app/goals',
    data: {
      pageType: 'feature',
      pageKey: 'goals',
    },
    resolve: {
      pageData: PageResolve,
    },
    loadChildren: () => import('./routes/route-goals-app.module').then(u => u.RouteGoalsAppModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/infy',
    loadChildren: () => import('./routes/route-infy-app.module').then(u => u.RouteInfyAppModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/info',
    loadChildren: () => import('./routes/route-info-app.module').then(u => u.RouteInfoAppModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/invalid-user',
    component: InvalidUserComponent,
    data: {
      pageType: 'feature',
      pageKey: 'invalid-user',
    },
    resolve: {
      pageData: PageResolve,
    },
  },

  {
    path: 'app/my-learning',
    loadChildren: () =>
      import('./routes/route-my-learning.module').then(u => u.RouteMyLearningModule),
    canActivate: [GeneralGuard, LearningGuard],
  },
  {
    path: 'app/my-dashboard',
    loadChildren: () =>
      import('./routes/route-my-dashboard.module').then(u => u.RouteMyDashboardModule),
    canActivate: [GeneralGuard, LearningGuard],
  },
  {
    path: 'app/my-rewards',
    loadChildren: () =>
      import('./routes/route-my-rewards.module').then(u => u.RouteMyRewarddModule),
    canActivate: [GeneralGuard, LearningGuard],
  },
  {
    path: 'app/notifications',
    loadChildren: () =>
      import('./routes/route-notification-app.module').then(u => u.RouteNotificationAppModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/playlist',
    data: {
      pageType: 'feature',
      pageKey: 'playlist',
    },
    resolve: {
      pageData: PageResolve,
    },
    loadChildren: () =>
      import('./routes/route-playlist-app.module').then(u => u.RoutePlaylistAppModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/user-dashboard',
    data: {
      // requiredRoles: [
      //   'org-admin',
      // ],
      pageType: 'feature',
      pageKey: 'user-dashboard',
    },
    resolve: {
      pageData: PageResolve,
    },
    loadChildren: () =>
      import('./routes/route-user-dashboard.module').then(u => u.RouteUserDashboardModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/profile',
    loadChildren: () =>
      import('./routes/route-profile-app.module').then(u => u.RouteProfileAppModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/person-profile',
    loadChildren: () =>
      import('./routes/route-person-profile.module').then(u => u.RoutePersonProfileModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/events',
    loadChildren: () => import('./routes/route-app-event.module').then(m => m.AppEventsModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/search',
    loadChildren: () =>
      import('./routes/route-search-app.module').then(u => u.RouteSearchAppModule),
    data: {
      pageType: 'feature',
      pageKey: 'search',
    },
    resolve: {
      searchPageData: PageResolve,
    },
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/social',
    loadChildren: () =>
      import('./routes/route-social-app.module').then(u => u.RouteSocialAppModule),
    data: {
      pageType: 'feature',
      pageKey: 'social',
    },
    resolve: {
      socialData: PageResolve,
      // pageData: PageResolve,
    },
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/toc',
    loadChildren: () => import('./routes/route-app-toc.module').then(u => u.RouteAppTocModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'public/sharecontent/o',
    data: {
      topBar: ETopBar.NONE,
    },
    loadChildren: () => import('./routes/route-app-toc.module').then(u => u.RouteAppTocModule),
  },
  {
    path: 'author/toc',
    loadChildren: () => import('./routes/route-app-toc.module').then(u => u.RouteAppTocModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'app/tnc',
    component: TncComponent,
    resolve: {
      tnc: TncAppResolverService,
    },
  },
  {
    path: 'author',
    data: {
      requiredRoles: [
        'content-creator',
        'ka-creator',
        'kb-creator',
        'channel-creator',
        'reviewer',
        'publisher',
        'editor',
        'admin',
      ],
    },
    canActivate: [GeneralGuard],
    loadChildren: () =>
      import('./routes/route-authoring-app.module').then(u => u.AuthoringAppModule),
  },
  {
    path: 'error-access-forbidden',
    component: ErrorResolverComponent,
    data: {
      errorType: 'accessForbidden',
    },
  },
  {
    path: 'error-content-unavailable',
    component: ErrorResolverComponent,
    data: {
      errorType: 'contentUnavailable',
    },
  },
  {
    path: 'error-feature-disabled',
    component: ErrorResolverComponent,
    data: {
      errorType: 'featureDisabled',
    },
  },
  {
    path: 'error-feature-unavailable',
    component: ErrorResolverComponent,
    data: {
      errorType: 'featureUnavailable',
    },
  },
  {
    path: 'error-internal-server',
    component: ErrorResolverComponent,
    data: {
      errorType: 'internalServer',
    },
  },
  {
    path: 'error-service-unavailable',
    component: ErrorResolverComponent,
    data: {
      errorType: 'serviceUnavailable',
    },
  },
  {
    path: 'error-somethings-wrong',
    component: ErrorResolverComponent,
    data: {
      errorType: 'somethingsWrong',
    },
  },
  {
    path: 'externalRedirect',
    canActivate: [ExternalUrlResolverService],
    component: ErrorResolverComponent,
  },
  { path: 'home', redirectTo: 'page/home', pathMatch: 'full' },
  {
    path: 'learning-hub',
    loadChildren: () =>
      import('./routes/route-learning-hub-app.module').then(u => u.LearningHubAppModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'login',
    canActivate: [LoginGuard],
    component: LoginRootComponent,
    data: {
      pageType: 'feature',
      pageKey: 'login',
    },
    resolve: {
      pageData: PageResolve,
    },
  },
  {
    path: 'public/home',
    canActivate: [LoginGuard],
    component: AppHomeComponent,
  },
  {
    path: 'page/toc',
    redirectTo: '/',
    pathMatch: 'full',
  },
  {
    path: 'page/toc/:id',
    data: {
      pageType: 'page',
      pageKey: 'toc',
    },
    resolve: {
      pageData: PageResolve,
      content: AppTocResolverService,
    },
    runGuardsAndResolvers: 'paramsChange',
    component: PageComponent,
    canActivate: [GeneralGuard],
  },
  {
    path: 'page/collaborators',
    data: {
      pageType: 'feature',
      pageKey: 'about',
    },
    resolve: {
      pageData: PageResolve,
    },
    component: AboutCollaboratorComponent,
  },
  {
    path: 'page/about',
    data: {
      pageType: 'feature',
      pageKey: 'about',
    },
    resolve: {
      pageData: PageResolve,
    },
    component: AboutCollaboratorComponent,
  },
  {
    path: 'page/:id',
    component: PageComponent,
    data: {
      pageType: 'page',
      pageKey: 'id',
    },
    resolve: {
      pageData: PageResolve,
    },
    canActivate: [GeneralGuard],
  },
  {
    path: 'page/explore/:tags',
    data: {
      pageType: 'page',
      pageKey: 'catalog-details',
    },
    resolve: {
      pageData: ExploreDetailResolve,
    },
    component: PageComponent,
    canActivate: [GeneralGuard],
  },
  {
    path: 'page-leaders',
    loadChildren: () =>
      import('./routes/page-leader-renderer/page-leader-renderer.module').then(
        u => u.PageLeaderRendererModule,
      ),
    canActivate: [GeneralGuard],
  },
  {
    path: 'public/about',
    component: AboutCollaboratorComponent,
    data: {
      pageType: 'feature',
      pageKey: 'about',
    },
    resolve: {
      pageData: PageResolve,
    },
  },
  {
    path: 'public/contact',
    component: PublicContactComponent,
    data: {
      pageType: 'feature',
      pageKey: 'public-faq',
    },
    resolve: {
      pageData: PageResolve,
    },
  },
  {
    path: 'public/collaborators',
    component: AboutCollaboratorComponent,
    data: {
      pageType: 'feature',
      pageKey: 'about',
    },
    resolve: {
      pageData: PageResolve,
    },
  },
  {
    path: 'public/mobile-app',
    component: MobileAppHomeComponent,
    data: {
      pageType: 'feature',
      pageKey: 'mobile-app',
    },
    resolve: {
      pageData: PageResolve,
    },
  },

  {
    path: 'public/assetguidelines',
    component: AssetguidelinesComponent,
    data: {
      pageType: 'feature',
      pageKey: 'asset-guidelines',
    },
    resolve: {
      pageData: PageResolve,
    },
  },
  {
    path: 'public/grievanceredressal',
    component: GrievanceredressalComponent,
  },

  {
    path: 'public/licencepolicy',
    component: LicencepolicyComponent,
    data: {
      pageType: 'feature',
      pageKey: 'licence-policy',
    },
    resolve: {
      pageData: PageResolve,
    },
  },
  {
    path: 'public/dataprivacy',
    component: DataprivacyComponent,
    data: {
      pageType: 'feature',
      pageKey: 'dataprivacy',
    },
    resolve: {
      pageData: PageResolve,
    },
  },
  {
    path: 'public/termsofuse',
    component: TermsofuseComponent,
    data: {
      pageType: 'feature',
      pageKey: 'toc',
    },
    resolve: {
      pageData: PageResolve,
    },
  },
  {
    path: 'public/tour-video',
    data: {
      pageType: 'feature',
      pageKey: 'social',
    },
    resolve: {
      pageData: PageResolve,
    },
    component: TourVideoComponent
    ,
  },
  {
    path: 'public/content-policy-and-community-guidelines',
    component: ContentpolicyandcommunicationComponent,
    data: {
      pageType: 'feature',
      pageKey: 'content-policy',
    },
    resolve: {
      pageData: PageResolve,
    },
  },
  /* {
    path: 'public/share-content/:pageType/:sharableToken',
    data: {
      isPublic: true,
      pageType: 'feature',
      pageKey: 'share-content',
    },
    resolve: {
      pageData: PageResolve,
    },
    component: PublicShareComponent,
  }, */
  {
    path: 'public/tnc',
    component: TncComponent,
    data: {
      isPublic: true,
    },
    resolve: {
      tnc: TncPublicResolverService,
    },
  },
  {
    path: 'public/faq/:tab',
    component: PublicFaqComponent,
  },
  {
    path: 'public/sharecontent/v',
    data: {
      topBar: ETopBar.NONE,
      isPublic: true,
      pageType: 'feature',
      pageKey: 'share-content',
    },
    resolve: {
      pageData: PageResolve,
    },
    loadChildren: () => import('./routes/route-viewer.module').then(u => u.RouteViewerModule),
  },
  {
    path: 'viewer',
    data: {
      topBar: ETopBar.NONE,
    },
    loadChildren: () => import('./routes/route-viewer.module').then(u => u.RouteViewerModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'author/viewer',
    loadChildren: () => import('./routes/route-viewer.module').then(u => u.RouteViewerModule),
    canActivate: [GeneralGuard],
  },
  {
    path: 'embed',
    data: {
      topBar: ETopBar.NONE,
    },
    loadChildren: () => import('./routes/route-viewer.module').then(u => u.RouteViewerModule),
    canActivate: [GeneralGuard],
  },
  {
    path: '**',
    component: ErrorResolverComponent,
    data: {
      errorType: 'notFound',
    },
  },
]
@NgModule({
  imports: [
    PageModule,
    FeaturesModule,
    RouterModule.forRoot(routes, {
      anchorScrolling: 'enabled',
      scrollPositionRestoration: 'top',
      urlUpdateStrategy: 'eager',
      onSameUrlNavigation: 'reload',
    }),
  ],
  exports: [RouterModule],
  providers: [ExploreDetailResolve],
})
export class AppRoutingModule { }
