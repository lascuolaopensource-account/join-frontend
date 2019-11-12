import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs/Observable";
import {BazaarPreferenceService} from "../../preference.service";
import {Injectable} from "@angular/core";
import {BazaarPreference} from "@sos/sos-ui-shared";


export abstract class BazaarPreferenceResolver implements Resolve<BazaarPreference | null> {

  protected abstract find(ideaId: number): Observable<BazaarPreference>

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<BazaarPreference | null> {
    const id = route.params['id'] ? route.params['id'] : route.parent.params['id'];
    return this.find(parseInt(id)).catch(e => {
      if (e.status === 404)
        return Observable.of(null);
      throw e;
    });
  }

}

@Injectable()
export class BazaarPreferenceLearnResolver extends BazaarPreferenceResolver {

  constructor(private bazaarPreferenceService: BazaarPreferenceService) {
    super();
  }

  protected find(ideaId: number): Observable<BazaarPreference> {
    return this.bazaarPreferenceService.findLearn(ideaId);
  }

}

@Injectable()
export class BazaarPreferenceTeachResolver extends BazaarPreferenceResolver {

  constructor(private bazaarPreferenceService: BazaarPreferenceService) {
    super();
  }

  protected find(ideaId: number): Observable<BazaarPreference> {
    return this.bazaarPreferenceService.findTeach(ideaId);
  }

}

@Injectable()
export class BazaarPreferenceEventResolver extends BazaarPreferenceResolver {

  constructor(private bazaarPreferenceService: BazaarPreferenceService) {
    super();
  }

  protected find(ideaId: number): Observable<BazaarPreference> {
    return this.bazaarPreferenceService.findEvent(ideaId);
  }

}

@Injectable()
export class BazaarPreferenceResearchResolver extends BazaarPreferenceResolver {

  constructor(private bazaarPreferenceService: BazaarPreferenceService) {
    super();
  }

  protected find(ideaId: number): Observable<BazaarPreference> {
    return this.bazaarPreferenceService.findResearch(ideaId);
  }

}
