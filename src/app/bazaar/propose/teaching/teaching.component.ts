import {Component} from "@angular/core";
import {BazaarIdea, BazaarIdeaGuest, BazaarIdeasService, BazaarTeach, RecurringMeetings} from "@sos/sos-ui-shared";
import {BazaarAbstractPropose} from "../abstract-propose";
import {ActivatedRoute, Router} from "@angular/router";
import * as _ from "lodash";
import {Observable} from "rxjs/Observable";
import {RootStyleService} from "../../../root-style.service";
import {TranslateTitleService} from "../../../translate";


@Component({
  selector: 'sos-bazaar-propose-teaching',
  templateUrl: './teaching.component.html',
  styleUrls: ['../propose.scss']
})
export class BazaarProposeTeachingComponent extends BazaarAbstractPropose {

  public idea: BazaarTeach = new BazaarTeach(
    0, null, null, null, null, [], null, [], null, [],
    null, null, [], [], null, null, null, null, null, [],
    null, null, null, null);

  public locationSOSChecked: boolean = false;

  public customTeachers: BazaarIdeaGuest[] = [];
  public customTutors: BazaarIdeaGuest[] = [];

  constructor(route: ActivatedRoute,
              router: Router,
              private bazaarIdeasService: BazaarIdeasService,
              rootStyleService: RootStyleService,
              titleService: TranslateTitleService) {
    super(route, router, rootStyleService, titleService, 'teach');
  }

  protected setForEditing(): void {
    this.locationSOSChecked = this.idea.location === 'SOS';
    this.customTeachers = this.idea.teachers.filter(t => t.userId === null);
    this.idea.teachers = this.idea.teachers.filter(t => t.userId !== null);
    this.customTutors = this.idea.tutors.filter(t => t.userId === null);
    this.idea.tutors = this.idea.tutors.filter(t => t.userId !== null);
  }

  locationAtSOS() {
    if (this.locationSOSChecked) {
      this.idea.location = 'SOS';
    } else {
      this.idea.location = null;
    }
  }

  changedAudience(audience: string, checked: boolean) {
    this.updateMultiEnumField('audience', this.audienceTypes[audience], checked);
  }

  changedFunding(funding: string, checked: boolean) {
    this.updateMultiEnumField('funding', this.fundingTypes[funding], checked);
  }

  protected sendableIdea(): BazaarIdea {
    let idea: any = _.cloneDeep(this.idea);
    idea.teachers = idea.teachers.concat(this.customTeachers);
    idea.tutors = idea.tutors.concat(this.customTutors);

    // this is required because html select values get converted to strings...
    idea.activityType = parseInt(idea.activityType);
    idea.level = parseInt(idea.level);
    if (idea.meetings instanceof RecurringMeetings)
      idea.meetings.entity = parseInt(idea.meetings.entity);

    return idea;
  }

  protected createIdea(idea: BazaarIdea): Observable<BazaarIdea> {
    return this.bazaarIdeasService.createTeach(idea);
  }

  protected updateIdea(idea: BazaarIdea): Observable<BazaarIdea> {
    return this.bazaarIdeasService.updateTeach(idea);
  }

  protected onSaved(): void {
    super.onSaved();
    this.customTeachers = this.idea.teachers.filter(t => t.userId == null);
    this.idea.teachers = this.idea.teachers.filter(t => t.userId != null);
    this.customTutors = this.idea.tutors.filter(t => t.userId == null);
    this.idea.tutors = this.idea.tutors.filter(t => t.userId != null);
  }

}
