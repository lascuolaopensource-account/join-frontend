import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {ActivitySlim, ActivitiesService, BazaarIdea, BazaarIdeasService, User, UserService} from '@sos/sos-ui-shared';
import {Observable} from "rxjs/Observable";


@Injectable()
export class FavoriteUsersResolver implements Resolve<User[]> {

  constructor(private userService: UserService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<User[]> {
    return this.userService.favorites();
  }

}


@Injectable()
export class FavoriteIdeasResolver implements Resolve<BazaarIdea[]> {

  constructor(private ideasService: BazaarIdeasService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<BazaarIdea[]> {
    return this.ideasService.favorites();
  }

}


@Injectable()
export class FavoriteActivitiesResolver implements Resolve<ActivitySlim[]> {

  constructor(private activitiesService: ActivitiesService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ActivitySlim[]> {
    return this.activitiesService.favorites();
  }

}
