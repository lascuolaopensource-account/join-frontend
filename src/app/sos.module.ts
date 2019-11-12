import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {Http, HttpModule, RequestOptions, XHRBackend} from "@angular/http";
import {Router} from "@angular/router";
import {SosAppComponent} from "./sos.component";
import {HeaderComponent} from "./header/header.component";
import {TranslatePipe, TranslateService, TranslateTitleService, TRANSLATION_PROVIDERS} from "./translate";
import {
  ActivitiesEventFutureResolver,
  ActivitiesEventResolver,
  ActivitiesResearchFutureResolver,
  ActivitiesResearchResolver,
  ActivitiesResolver,
  ActivitiesService,
  ActivitiesTeachFutureResolver,
  ActivitiesTeachResolver,
  ActivityEventResolver,
  ActivityResearchResolver,
  ActivityTeachResolver,
  AfterDateValidatorDirective,
  AuthService,
  AuthServiceConfig,
  BazaarCommentsEventResolver,
  BazaarCommentsLearnResolver,
  BazaarCommentsResearchResolver,
  BazaarCommentsService,
  BazaarCommentsTeachResolver,
  BazaarEventResolver,
  BazaarIdeasResolver,
  BazaarIdeasService,
  BazaarIdeasSlimResolver,
  BazaarLearnResolver,
  BazaarResearchResolver,
  BazaarTeachResolver,
  CalendarService,
  Environment,
  ERROR_PAGE,
  FablabMachinesResolver,
  FablabService,
  FablabUserReservationsResolver,
  HttpOAuth,
  LogoutComponent,
  MembershipService,
  MembershipTypesResolver,
  MeUserResolver,
  MinValueDirective,
  ModalsComponent,
  SkillsService,
  TopicsService,
  UserResolver,
  UserService
} from "@sos/sos-ui-shared";
import {HomeComponent} from "./home/home.component";
import {SosRoutingModule} from "./sos-routing.module";
import {ProfileComponent} from "./profile/profile.component";
import {BazaarComponent} from "./bazaar/bazaar.component";
import {MembershipComponent} from "./membership/membership.component";
import {environment} from "../environments/environment";
import {BazaarProposeTeachingComponent} from "./bazaar/propose/teaching/teaching.component";
import {BazaarProposeLearningComponent} from "./bazaar/propose/learning/learning.component";
import {BazaarProposeEventComponent} from "./bazaar/propose/event/event.component";
import {BazaarProposeGuestsComponent} from "./bazaar/propose/guests/guests.component";
import {BazaarProposeAlertsComponent} from "./bazaar/propose/alerts.component";
import {TopicsComponent} from "./bazaar/propose/topics/topics.component";
import {BazaarProposeMeetingsComponent} from "./bazaar/propose/meetings/meetings.component";
import {BazaarProposeDatesComponent} from "./bazaar/propose/dates/dates.component";
import {BazaarShowComponent} from "./bazaar/show/show.component";
import {BazaarSelectedService} from "./bazaar/bazaar-selected.service";
import {BazaarMeetingsDisplayComponent} from "./bazaar/meetings-display.component";
import {BazaarCommentsComponent} from "./bazaar/show/comments/comments.component";
import {BazaarPreferenceService} from "./bazaar/preference.service";
import {
  BazaarPreferenceEventResolver,
  BazaarPreferenceLearnResolver,
  BazaarPreferenceResearchResolver,
  BazaarPreferenceTeachResolver
} from "./bazaar/show/comments/preference.resolver";
import {BazaarFavoriteComponent} from "./bazaar/favorite.component";
import {BazaarProposeResearchComponent} from "./bazaar/propose/research/research.component";
import {BazaarShowInteractionsBarComponent} from "./bazaar/show/interactions-bar.component";
import {ActivitiesComponent} from './activities/activities.component';
import {ActivityTeachEventShowComponent} from "./activities/show/teach-event/teach-event.component";
import {FavoritesComponent} from './favorites/favorites.component';
import {PaymentsService} from "./payments.service";
import {PaymentClientTokenResolver} from "./payment.resolvers";
import {ActivityResearchShowComponent} from './activities/show/research/research.component';
import {FablabComponent} from './fablab/fablab.component';
import {ProfileReservationsComponent} from './profile/reservations/reservations.component';
import {LoadingService} from "./loading.service";
import {LoadingComponent} from "./loading.component";
import {
  FavoriteActivitiesResolver,
  FavoriteIdeasResolver,
  FavoriteUsersResolver
} from "./favorites/favorites.resolvers";
import {CardActivityComponent, CardIdeaComponent, CardUserComponent} from "./cards";
import {ModalComponent} from './modal/modal.component';
import {ModalContentDirective} from './modal/modal-content.directive';
import {ModalService} from "./modal/modal.service";
import {BazaarProposeModalComponent} from "./bazaar/propose-modal.component";
import {BazaarPostedCommentService} from "./bazaar/show/comments/posted-comment.service";
import {RootStyleService} from "./root-style.service";
import {BazaarProposeSavedComponent} from "./bazaar/propose/saved.component";
import {ActivityTeachSlimComponent} from "./activities/teach-slim.component";
import {ActivityEventSlimComponent} from "./activities/event-slim.component";
import {ActivityResearchSlimComponent} from "./activities/research-slim.component";
import {ActivitiesFilteredComponent} from "./activities/filtered.component";
import {config, SOS_CONFIG} from "../sos.config";
import {ErrorPageComponent} from './error-page/error-page.component';
import {HomeWelcomeComponent} from "./home/welcome.component";
import {CitiesService} from "./cities.service";


export function environmentFactory() {
  return new Environment(environment.production, environment.backendUrl, environment.rulesUrl)
}

export function authServiceConfigFactory() {
  return new AuthServiceConfig(environment.auth)
}

export function httpOAuthFactory(backend: XHRBackend,defaultOptions: RequestOptions,
                                 authService: AuthService, router: Router, route: string) {
  return new HttpOAuth(backend, defaultOptions, authService, router, route);
}


@NgModule({
  declarations: [
    SosAppComponent,
    LoadingComponent,
    HeaderComponent,
    TranslatePipe,
    LogoutComponent,
    HomeComponent, HomeWelcomeComponent,
    ProfileComponent,
    BazaarComponent,
    MembershipComponent,
    BazaarProposeTeachingComponent,
    BazaarProposeLearningComponent,
    BazaarProposeEventComponent,
    BazaarProposeResearchComponent,
    BazaarProposeGuestsComponent,
    BazaarProposeAlertsComponent,
    TopicsComponent,
    BazaarProposeMeetingsComponent,
    BazaarProposeDatesComponent,
    BazaarShowComponent,
    BazaarMeetingsDisplayComponent,
    BazaarCommentsComponent,
    BazaarFavoriteComponent,
    ModalsComponent,
    AfterDateValidatorDirective,
    BazaarShowInteractionsBarComponent,
    MinValueDirective,
    ActivitiesComponent,
    ActivityTeachSlimComponent,
    ActivityEventSlimComponent,
    ActivityResearchSlimComponent,
    ActivitiesFilteredComponent,
    ActivityTeachEventShowComponent,
    ActivityResearchShowComponent,
    FavoritesComponent,
    FablabComponent,
    ProfileReservationsComponent,
    CardUserComponent, CardIdeaComponent, CardActivityComponent,
    ModalComponent, ModalContentDirective,
    BazaarProposeModalComponent, BazaarProposeSavedComponent,
    ErrorPageComponent
  ],
  entryComponents: [
    BazaarProposeModalComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    SosRoutingModule
  ],
  providers: [
    {provide: SOS_CONFIG, useValue: config},
    {provide: ERROR_PAGE, useValue: '/error'},
    { provide: HttpOAuth,
      deps: [XHRBackend, RequestOptions, AuthService, Router, ERROR_PAGE],
      useFactory: httpOAuthFactory},
    { provide: Http,
      deps: [XHRBackend, RequestOptions, AuthService, Router, ERROR_PAGE],
      useFactory: httpOAuthFactory},
    LoadingService,
    TranslateService, TRANSLATION_PROVIDERS, TranslateTitleService,
    {provide: Environment, useFactory: environmentFactory},
    {provide: AuthServiceConfig, useFactory: authServiceConfigFactory},
    AuthService,
    UserService,
    UserResolver, MeUserResolver,
    MembershipService, MembershipTypesResolver,
    SkillsService,
    BazaarIdeasService, BazaarIdeasResolver, BazaarIdeasSlimResolver,
    BazaarLearnResolver, BazaarTeachResolver, BazaarEventResolver, BazaarResearchResolver,
    TopicsService,
    BazaarSelectedService,
    BazaarPreferenceService,
    BazaarPreferenceLearnResolver, BazaarPreferenceTeachResolver, BazaarPreferenceEventResolver, BazaarPreferenceResearchResolver,
    BazaarCommentsService, BazaarPostedCommentService,
    BazaarCommentsLearnResolver, BazaarCommentsTeachResolver, BazaarCommentsEventResolver, BazaarCommentsResearchResolver,
    ActivitiesResolver, ActivityTeachResolver, ActivityEventResolver, ActivityResearchResolver, ActivitiesService,
    ActivitiesTeachResolver, ActivitiesTeachFutureResolver,
    ActivitiesEventResolver, ActivitiesEventFutureResolver,
    ActivitiesResearchResolver, ActivitiesResearchFutureResolver,
    PaymentsService, PaymentClientTokenResolver,
    CalendarService,
    FablabService, FablabMachinesResolver, FablabUserReservationsResolver,
    FavoriteUsersResolver, FavoriteIdeasResolver, FavoriteActivitiesResolver,
    ModalService,
    RootStyleService,
    CitiesService
  ],
  bootstrap: [SosAppComponent]
})
export class SosAppModule {}
