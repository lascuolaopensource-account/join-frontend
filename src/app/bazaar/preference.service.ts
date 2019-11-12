import {EventEmitter, Injectable} from "@angular/core";
import {ApiService, AuthService, BazaarPreference, Environment, IdeaType} from "@sos/sos-ui-shared";
import {Http} from "@angular/http";
import {Observable} from "rxjs/Observable";


export type UpsertFlags = { ideaId: number, agree: boolean, favorite: boolean };
type PreferenceUpdate = BazaarPreference & { ideaType: IdeaType };

@Injectable()
export class BazaarPreferenceService extends ApiService {

  private readonly baseUrl: string;
  private preferenceObs: EventEmitter<PreferenceUpdate> = new EventEmitter<PreferenceUpdate>();

  constructor(protected http: Http, authService: AuthService, environment: Environment) {
    super(authService, environment);
    this.baseUrl = `${this.backendUrl}/bazaar_ideas`;
  }

  private getUrl(ideaId: number, ideaType: IdeaType): string {
    return `${this.baseUrl}/${ideaType}/${ideaId}/preference`;
  }

  private find(ideaId: number, ideaType: IdeaType): Observable<BazaarPreference> {
    return this.http.get(this.getUrl(ideaId, ideaType), this.options)
      .map(response => {
        const json = response.json();
        return BazaarPreference.fromJson(json);
      });
  }

  public findLearn(ideaId: number): Observable<BazaarPreference> {
    return this.find(ideaId, 'learn');
  }

  public findTeach(ideaId: number): Observable<BazaarPreference> {
    return this.find(ideaId, 'teach');
  }

  public findEvent(ideaId: number): Observable<BazaarPreference> {
    return this.find(ideaId, 'event');
  }

  public findResearch(ideaId: number): Observable<BazaarPreference> {
    return this.find(ideaId, 'research');
  }


  private upsertFlags(preference: UpsertFlags, ideaType: IdeaType): Observable<BazaarPreference> {
    return this.http.put(this.getUrl(preference.ideaId, ideaType), preference, this.options)
      .map(response =>{
        const json = response.json();
        return BazaarPreference.fromJson(json);
      });
  }

  public upsertFlagsLearn(preference: UpsertFlags): Observable<BazaarPreference> {
    return this.upsertFlags(preference, 'learn');
  }

  public upsertFlagsTeach(preference: UpsertFlags): Observable<BazaarPreference> {
    return this.upsertFlags(preference, 'teach');
  }

  public upsertFlagsEvent(preference: UpsertFlags): Observable<BazaarPreference> {
    return this.upsertFlags(preference, 'event');
  }

  public upsertFlagsResearch(preference: UpsertFlags): Observable<BazaarPreference> {
    return this.upsertFlags(preference, 'research');
  }


  private upsertWish(ideaId: number, ideaType: IdeaType, comment: string): Observable<BazaarPreference> {
    return this.http.put(`${this.baseUrl}/${ideaType}/${ideaId}/wish`, { comment: comment }, this.options)
      .map(response =>{
        const json = response.json();
        return BazaarPreference.fromJson(json);
      });
  }

  public upsertWishLearn(ideaId: number, comment: string): Observable<BazaarPreference> {
    return this.upsertWish(ideaId, 'learn', comment);
  }

  public upsertWishTeach(ideaId: number, comment: string): Observable<BazaarPreference> {
    return this.upsertWish(ideaId, 'teach', comment);
  }

  public upsertWishEvent(ideaId: number, comment: string): Observable<BazaarPreference> {
    return this.upsertWish(ideaId, 'event', comment);
  }

  public upsertWishResearch(ideaId: number, comment: string): Observable<BazaarPreference> {
    return this.upsertWish(ideaId, 'research', comment);
  }

  public get preferenceUpdates() {
    return this.preferenceObs;
  }

  public publishPreferenceUpdate(update: BazaarPreference, ideaType: IdeaType) {
    this.preferenceObs.emit(Object.defineProperty(update, 'ideaType', { value: ideaType }));
  }


  public destroyWish(preferenceId: number): Observable<void> {
    return this.http.delete(`${this.baseUrl}/wish/${preferenceId}`, this.options)
      .map(() => null);
  }

}
