import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import {HomeComponent} from "./home/home.component";
import {
  ActivitiesEventFutureResolver,
  ActivitiesEventResolver,
  ActivitiesResearchFutureResolver,
  ActivitiesResearchResolver,
  ActivitiesTeachFutureResolver,
  ActivitiesTeachResolver,
  ActivityEventResolver,
  ActivityResearchResolver,
  ActivityTeachResolver,
  BazaarCommentsEventResolver,
  BazaarCommentsLearnResolver,
  BazaarCommentsResearchResolver,
  BazaarCommentsTeachResolver,
  BazaarEventResolver,
  BazaarIdeasSlimResolver,
  BazaarLearnResolver,
  BazaarResearchResolver,
  BazaarTeachResolver,
  FablabMachinesResolver,
  FablabUserReservationsResolver,
  MembershipTypesResolver,
  MeUserResolver,
  UserResolver
} from "@sos/sos-ui-shared";
import {ProfileComponent} from "./profile/profile.component";
import {BazaarComponent} from "./bazaar/bazaar.component";
import {MembershipComponent} from "./membership/membership.component";
import {BazaarProposeTeachingComponent} from "./bazaar/propose/teaching/teaching.component";
import {BazaarProposeLearningComponent} from "./bazaar/propose/learning/learning.component";
import {BazaarProposeEventComponent} from "./bazaar/propose/event/event.component";
import {BazaarShowComponent} from "./bazaar/show/show.component";
import {BazaarCommentsComponent} from "./bazaar/show/comments/comments.component";
import {
  BazaarPreferenceEventResolver,
  BazaarPreferenceLearnResolver,
  BazaarPreferenceResearchResolver,
  BazaarPreferenceTeachResolver
} from "./bazaar/show/comments/preference.resolver";
import {BazaarProposeResearchComponent} from "./bazaar/propose/research/research.component";
import {ActivitiesComponent} from "./activities/activities.component";
import {ActivityTeachEventShowComponent} from "./activities/show/teach-event/teach-event.component";
import {PaymentClientTokenResolver} from "./payment.resolvers";
import {ActivityResearchShowComponent} from "./activities/show/research/research.component";
import {FablabComponent} from "./fablab/fablab.component";
import {ProfileReservationsComponent} from "./profile/reservations/reservations.component";
import {FavoritesComponent} from "./favorites/favorites.component";
import {
  FavoriteActivitiesResolver,
  FavoriteIdeasResolver,
  FavoriteUsersResolver
} from "./favorites/favorites.resolvers";
import {ActivitiesFilteredComponent} from "./activities/filtered.component";
import {ErrorPageComponent} from "./error-page/error-page.component";
import {HomeWelcomeComponent} from "./home/welcome.component";


const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    resolve: {
      me: MeUserResolver
    },
    children: [
      {
        path: 'welcome',
        component: HomeWelcomeComponent
      }
    ]
  }, {
    path: 'welcome',
    redirectTo: '/home/welcome'
  },


  {
    path: 'profile/me',
    component: ProfileComponent,
    resolve: {
      me: MeUserResolver
    },
    data: {
      self: true
    },
    children: [
      {
        path: 'reservations',
        component: ProfileReservationsComponent,
        resolve: {
          reservations: FablabUserReservationsResolver,
          machines: FablabMachinesResolver
        }
      }
    ]
  }, {
    path: 'profile/:id',
    component: ProfileComponent,
    resolve: {
      me: MeUserResolver,
      user: UserResolver
    },
    data: {
      self: false
    }
  },


  {
    path: 'favorites',
    component: FavoritesComponent,
    resolve: {
      me: MeUserResolver,
      users: FavoriteUsersResolver,
      ideas: FavoriteIdeasResolver,
      activities: FavoriteActivitiesResolver
    }
  },


  {
    path: 'bazaar',
    component: BazaarComponent,
    resolve: {
      me: MeUserResolver,
      bazaarIdeas: BazaarIdeasSlimResolver
    },
    children: [
      {
        path: 'learn/:id',
        component: BazaarShowComponent,
        resolve: {
          idea: BazaarLearnResolver
        },
        children: [
          {
            path: 'comments',
            component: BazaarCommentsComponent,
            resolve: {
              comments: BazaarCommentsLearnResolver,
              preference: BazaarPreferenceLearnResolver
            }
          }
        ]
      }, {
        path: 'teach/:id',
        component: BazaarShowComponent,
        resolve: {
          idea: BazaarTeachResolver
        },
        children: [
          {
            path: 'comments',
            component: BazaarCommentsComponent,
            resolve: {
              comments: BazaarCommentsTeachResolver,
              preference: BazaarPreferenceTeachResolver
            }
          }
        ]
      }, {
        path: 'event/:id',
        component: BazaarShowComponent,
        resolve: {
          idea: BazaarEventResolver
        },
        children: [
          {
            path: 'comments',
            component: BazaarCommentsComponent,
            resolve: {
              comments: BazaarCommentsEventResolver,
              preference: BazaarPreferenceEventResolver
            }
          }
        ]
      }, {
        path: 'research/:id',
        component: BazaarShowComponent,
        resolve: {
          idea: BazaarResearchResolver
        },
        children: [
          {
            path: 'comments',
            component: BazaarCommentsComponent,
            resolve: {
              comments: BazaarCommentsResearchResolver,
              preference: BazaarPreferenceResearchResolver
            }
          }
        ]
      }
    ]
  }, {
    path: 'bazaar/propose/teach',
    component: BazaarProposeTeachingComponent,
    resolve: {
      me: MeUserResolver
    }
  }, {
    path: 'bazaar/propose/teach/:id',
    component: BazaarProposeTeachingComponent,
    resolve: {
      idea: BazaarTeachResolver,
      me: MeUserResolver
    }
  }, {
    path: 'bazaar/propose/learn',
    component: BazaarProposeLearningComponent,
    resolve: {
      me: MeUserResolver
    }
  }, {
    path: 'bazaar/propose/learn/:id',
    component: BazaarProposeLearningComponent,
    resolve: {
      idea: BazaarLearnResolver,
      me: MeUserResolver
    }
  }, {
    path: 'bazaar/propose/event',
    component: BazaarProposeEventComponent,
    resolve: {
      me: MeUserResolver
    }
  }, {
    path: 'bazaar/propose/event/:id',
    component: BazaarProposeEventComponent,
    resolve: {
      idea: BazaarEventResolver,
      me: MeUserResolver
    }
  }, {
    path: 'bazaar/propose/research',
    component: BazaarProposeResearchComponent,
    resolve: {
      me: MeUserResolver
    }
  }, {
    path: 'bazaar/propose/research/:id',
    component: BazaarProposeResearchComponent,
    resolve: {
      idea: BazaarResearchResolver,
      me: MeUserResolver
    }
  },


  {
    path: 'membership',
    component: MembershipComponent,
    resolve: {
      me: MeUserResolver,
      membershipTypes: MembershipTypesResolver
    }
  },


  {
    path: 'activities',
    component: ActivitiesComponent,
    resolve: {
      me: MeUserResolver,
      teach: ActivitiesTeachFutureResolver,
      event: ActivitiesEventFutureResolver,
      research: ActivitiesResearchFutureResolver
    }
  }, {
    path: 'activities/teach',
    component: ActivitiesFilteredComponent,
    data: { type: 'teach' },
    resolve: {
      me: MeUserResolver,
      activities: ActivitiesTeachResolver
    }
  }, {
    path: 'activities/event',
    component: ActivitiesFilteredComponent,
    data: { type: 'event' },
    resolve: {
      me: MeUserResolver,
      activities: ActivitiesEventResolver
    }
  }, {
    path: 'activities/research',
    component: ActivitiesFilteredComponent,
    data: { type: 'research' },
    resolve: {
      me: MeUserResolver,
      activities: ActivitiesResearchResolver
    }
  }, {
    path: 'activities/teach/:id',
    component: ActivityTeachEventShowComponent,
    resolve: {
      me: MeUserResolver,
      activity: ActivityTeachResolver,
      token: PaymentClientTokenResolver
    }
  }, {
    path: 'activities/event/:id',
    component: ActivityTeachEventShowComponent,
    resolve: {
      me: MeUserResolver,
      activity: ActivityEventResolver,
      token: PaymentClientTokenResolver
    }
  }, {
    path: 'activities/research/:id',
    component: ActivityResearchShowComponent,
    resolve: {
      me: MeUserResolver,
      activity: ActivityResearchResolver
    }
  },


  {
    path: 'fablab',
    component: FablabComponent,
    resolve: {
      me: MeUserResolver,
      machines: FablabMachinesResolver
    }
  },


  {
    path: 'error/:code',
    component: ErrorPageComponent
  },


  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },


  {
    path: '**',
    redirectTo: '/error/404'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class SosRoutingModule { }
