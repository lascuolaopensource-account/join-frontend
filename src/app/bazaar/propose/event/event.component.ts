import {Component} from "@angular/core";
import {BazaarAbstractPropose} from "../abstract-propose";
import {ActivatedRoute, Router} from "@angular/router";
import {Observable} from "rxjs/Observable";
import {
  BazaarEvent,
  BazaarIdea,
  BazaarIdeaGuest,
  BazaarIdeasService,
  RecurringMeetings
} from "@sos/sos-ui-shared";
import * as _ from "lodash";
import {RootStyleService} from "../../../root-style.service";
import {TranslateTitleService} from "../../../translate";


@Component({
  selector: 'sos-bazaar-propose-event',
  templateUrl: './event.component.html',
  styleUrls: ['../propose.scss']
})
export class BazaarProposeEventComponent extends BazaarAbstractPropose {

  public idea: BazaarEvent = new BazaarEvent(
    0, null, null, null, [], [], null, [], null, null,
    null, null, null, null, [], null, [], null, null, null,
    null);

  public customGuests: BazaarIdeaGuest[] = [];

  constructor(route: ActivatedRoute,
              router: Router,
              private bazaarIdeasService: BazaarIdeasService,
              rootStyleService: RootStyleService,
              titleService: TranslateTitleService) {
    super(route, router, rootStyleService, titleService, 'event');
  }

  protected setForEditing(): void {
    this.customGuests = this.idea.guests.filter(g => g.userId === null);
    this.idea.guests = this.idea.guests.filter(g => g.userId !== null);
  }

  changedAudience(audience: string, checked: boolean) {
    this.updateMultiEnumField('audience', this.audienceTypes[audience], checked);
  }

  changedFunding(funding: string, checked: boolean) {
    this.updateMultiEnumField('funding', this.fundingTypes[funding], checked);
  }

  protected sendableIdea(): BazaarIdea {
    let idea: any = _.cloneDeep(this.idea);
    idea.guests = idea.guests.concat(this.customGuests);

    // this is required because html select values get converted to strings...
    idea.activityType = parseInt(idea.activityType);
    idea.level = parseInt(idea.level);
    if (idea.meetings instanceof RecurringMeetings)
      idea.meetings.entity = parseInt(idea.meetings.entity);

    return idea;
  }

  protected createIdea(idea: BazaarIdea): Observable<BazaarIdea> {
    return this.bazaarIdeasService.createEvent(idea);
  }

  protected updateIdea(idea: BazaarIdea): Observable<BazaarIdea> {
    return this.bazaarIdeasService.updateEvent(idea);
  }

  protected onSaved(): void {
    super.onSaved();
    this.customGuests = this.idea.guests.filter(t => t.userId == null);
    this.idea.guests = this.idea.guests.filter(t => t.userId != null);
  }

}
