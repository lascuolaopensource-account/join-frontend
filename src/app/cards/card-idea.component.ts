import {Component, Input} from "@angular/core";
import {BazaarIdea, BazaarPreference} from "@sos/sos-ui-shared";
import {BazaarPreferenceService, UpsertFlags} from "../bazaar/preference.service";
import {Observable} from "rxjs/Observable";
import {AbstractComponent} from "../abstract-component";


@Component({
  selector: 'sos-card-idea',
  template: `
    <div class="row">
      <div [ngClass]="{ 'col-10': !hideFavorite, col: hideFavorite }">
        <a class="title" [routerLink]="['/bazaar', idea.ideaType, idea.id]">
          {{ idea.title }}
        </a>
      </div>
      <div class="col-2 text-right" *ngIf="!hideFavorite">
        <button class="btn btn-sm btn-link" (click)="favoriteIdea(idea)">
          <i class="fa" [class.fa-heart]="idea.preference && idea.preference.favorite"
             [class.fa-heart-o]="!idea.preference || !idea.preference.favorite"></i>
        </button>
      </div>
    </div>
    <div class="row no-gutters detail-line" *ngIf="idea.topics && idea.topics.length > 0">
      <div class="col-2">
        <strong>{{ 'card.idea.topics' | translate }}</strong>
      </div>
      <div class="col">
        <ul class="list-inline list-inline-commas mb-0">
          <li class="list-inline-item" *ngFor="let topic of idea.topics">{{ topic.topic }}</li>
        </ul>
      </div>
    </div>
    <div class="row no-gutters detail-line">
      <div class="col-2">
        <strong>{{ 'card.idea.type' | translate }}</strong>
      </div>
      <div class="col">
        {{ translateEnum('framework', frameworks[frameworkOfIdea(idea)]) | translate }}
      </div>
    </div>
    <div class="row no-gutters detail-line">
      <div class="col-2">
        <strong>{{ 'card.idea.creator' | translate }}</strong>
      </div>
      <div class="col">
        <a [routerLink]="['/profile', idea.creator.id]">
          {{ idea.creator.firstName }} {{ idea.creator.lastName }}
        </a>
      </div>
    </div>
  `,
  styleUrls: ['./card-common.scss']
})
export class CardIdeaComponent extends AbstractComponent {

  @Input() idea: BazaarIdea;
  @Input() hideFavorite: boolean = false;

  constructor(private bazaarPreferenceService: BazaarPreferenceService) {
    super();
  }

  favoriteIdea(idea: BazaarIdea) {
    let preference: UpsertFlags = {
      ideaId: idea.id,
      agree: false,
      favorite: true
    };
    if (idea.preference) {
      preference.agree = idea.preference.agree;
      preference.favorite = !idea.preference.favorite;
    }

    let obs: Observable<BazaarPreference>;

    switch (idea.ideaType) {
      case 'event':
        obs = this.bazaarPreferenceService.upsertFlagsEvent(preference);
        break;
      case 'teach':
        obs = this.bazaarPreferenceService.upsertFlagsTeach(preference);
        break;
      case 'learn':
        obs = this.bazaarPreferenceService.upsertFlagsLearn(preference);
        break;
      case 'research':
        obs = this.bazaarPreferenceService.upsertFlagsResearch(preference);
        break;
      default:
        throw new Error('invalid idea type ' + idea.ideaType);
    }

    obs.subscribe(preference => {
      idea.preference = preference;
    });
  }

}
