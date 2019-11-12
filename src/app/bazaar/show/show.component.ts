import {Component, OnDestroy, OnInit} from "@angular/core";
import {AbstractComponent} from "../../abstract-component";
import {ActivatedRoute, Router} from "@angular/router";
import {
  BazaarEvent,
  BazaarIdea,
  BazaarIdeaGuest,
  BazaarLearn,
  BazaarResearch,
  BazaarTeach,
  User,
  UserService
} from "@sos/sos-ui-shared";
import {BazaarSelectedService} from "../bazaar-selected.service";
import {BazaarPreferenceService} from "../preference.service";
import {TranslateTitleService} from "../../translate";

@Component({
  selector: 'sos-bazaar-show',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss']
})
export class BazaarShowComponent extends AbstractComponent implements OnInit, OnDestroy {

  public user: User;
  public idea: BazaarIdea;
  public guests: BazaarIdeaGuest[] | null;
  public guestsText: string;
  public noGuestsText: string;
  public abstract: string;
  public program: string;
  public deadlineDate: Date = null;
  public commentsOpen: boolean;
  public queryParams: object;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private selectedIdeaService: BazaarSelectedService,
              private userService: UserService,
              private bazaarPreferenceService: BazaarPreferenceService,
              private titleService: TranslateTitleService) {
    super();
  }

  ngOnInit() {
    const userSubscription = this.userService.userUpdated.subscribe((user: User) => {
      this.user = user;
      userSubscription.unsubscribe();
    });

    this.route.data.subscribe((data: { idea: BazaarIdea }) => {
      this.titleService.setTitle('bazaar.details.pageTitle', { title: data.idea.title });
      this.setData(data.idea);
      this.selectedIdeaService.select(this.idea);
    });

    this.route.queryParamMap.subscribe(params => {
      this.queryParams = {};
      params.keys.forEach(k => {
        this.queryParams[k] = params.get(k);
      });
    });

    this.bazaarPreferenceService.preferenceUpdates.subscribe(preference => {
      if (preference.ideaId === this.idea.id && preference.ideaType === this.idea.ideaType)
        this.idea.preference = preference;
    });
  }

  ngOnDestroy(): void {
    this.selectedIdeaService.select(null);
  }

  private setData(idea: BazaarIdea) {
    this.idea = idea;

    if (this.idea instanceof BazaarEvent) {
      this.guests = this.idea.guests;
      this.abstract = this.idea.valueDetails;
      this.program = this.idea.programDetails;
    } else if (this.idea instanceof BazaarLearn) {
      this.guests = this.idea.teachers;
      this.abstract = this.idea.valueDetails;
      this.program = this.idea.motivation;
    } else if (this.idea instanceof BazaarTeach) {
      this.guests = this.idea.teachers;
      this.abstract = this.idea.valueDetails;
      this.program = this.idea.programDetails;
    } else if (this.idea instanceof BazaarResearch) {
      this.guests = null;
      this.abstract = this.idea.valueDetails;
      this.program = this.idea.motivation;
      this.deadlineDate = new Date(this.idea.createdAt);
      this.deadlineDate.setDate(this.deadlineDate.getDate() + this.idea.deadline);
    } else {
      throw new Error('unknown idea type');
    }

    this.guestsText = `bazaar.details.${this.idea.ideaType}.guests`;
    this.noGuestsText = `bazaar.details.${this.idea.ideaType}.noGuests`;
  }

  setCommentsOpen(open: boolean) {
    this.commentsOpen = open;
  }

}
