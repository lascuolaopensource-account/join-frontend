import {Component} from "@angular/core";
import {BazaarIdea, BazaarIdeaGuest, BazaarIdeasService, BazaarLearn} from "@sos/sos-ui-shared";
import {ActivatedRoute, Router} from "@angular/router";
import * as _ from "lodash";
import {BazaarAbstractPropose} from "../abstract-propose";
import {Observable} from "rxjs/Observable";
import {RootStyleService} from "../../../root-style.service";
import {TranslateTitleService} from "../../../translate";


@Component({
  selector: 'sos-bazaar-propose-learning',
  templateUrl: './learning.component.html',
  styleUrls: ['../propose.scss']
})
export class BazaarProposeLearningComponent extends BazaarAbstractPropose {

  public idea: BazaarLearn = new BazaarLearn(
    0, null, null, null, [], [], [],
    null, null, null, null, null, null);

  public locationSOSChecked: boolean = false;

  public customTeachers: BazaarIdeaGuest[] = [];
  public customTutors: BazaarIdeaGuest[] = [];

  constructor(route: ActivatedRoute,
              router: Router,
              private bazaarIdeasService: BazaarIdeasService,
              rootStyleService: RootStyleService,
              titleService: TranslateTitleService) {
    super(route, router, rootStyleService, titleService, 'learn');
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

  protected sendableIdea(): BazaarIdea {
    let idea = _.cloneDeep(this.idea);
    idea.teachers = idea.teachers.concat(this.customTeachers);
    idea.tutors = idea.tutors.concat(this.customTutors);
    return idea;
  }

  protected createIdea(idea: BazaarIdea): Observable<BazaarIdea> {
    return this.bazaarIdeasService.createLearn(idea);
  }

  protected updateIdea(idea: BazaarIdea): Observable<BazaarIdea> {
    return this.bazaarIdeasService.updateLearn(idea);
  }

  protected onSaved(): void {
    super.onSaved();
    this.customTeachers = this.idea.teachers.filter(t => t.userId == null);
    this.idea.teachers = this.idea.teachers.filter(t => t.userId != null);
    this.customTutors = this.idea.tutors.filter(t => t.userId == null);
    this.idea.tutors = this.idea.tutors.filter(t => t.userId != null);
  }

}
