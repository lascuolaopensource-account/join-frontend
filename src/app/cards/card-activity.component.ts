import {Component, Input} from "@angular/core";
import {ActivitiesService} from "@sos/sos-ui-shared";
import {Observable} from "rxjs/Observable";
import {ActivityEventSlim, ActivityResearchSlim, ActivityTeachSlim} from "@sos/sos-ui-shared/index";
import {AbstractComponent} from "../abstract-component";


type AnyActivity = ActivityResearchSlim & ActivityTeachSlim & ActivityEventSlim


@Component({
  selector: 'sos-card-activity',
  template: `
    <div class="row">
      <div [ngClass]="{ 'col-10': !hideFavorite, col: hideFavorite }">
        <a class="title" [routerLink]="['/activities', activity.type, activity.id]">
          {{ activity.title }}
        </a>
      </div>
      <div class="col-2 text-right" *ngIf="!hideFavorite">
        <button class="btn btn-sm btn-link" (click)="favoriteActivity(activity)">
          <i class="fa" [class.fa-heart]="activity.favorite"
             [class.fa-heart-o]="!activity.favorite"></i>
        </button>
      </div>
    </div>
    <div class="row no-gutters detail-line" *ngIf="activity.startDate">
      <div class="col-2">
        <strong>{{ 'card.activity.startDate' | translate }}</strong>
      </div>
      <div class="col">
        {{ activity.startDate | date:'shortDate' }}
      </div>
    </div>
    <div class="row no-gutters detail-line" *ngIf="activity.topics && activity.topics.length > 0">
      <div class="col-2">
        <strong>{{ 'card.activity.topics' | translate }}</strong>
      </div>
      <div class="col">
        <ul class="list-inline list-inline-commas mb-0">
          <li class="list-inline-item" *ngFor="let topic of activity.topics">{{ topic.topic }}</li>
        </ul>
      </div>
    </div>
    <div class="row no-gutters detail-line">
      <div class="col-2">
        <strong>{{ 'card.activity.type' | translate }}</strong>
      </div>
      <div class="col">
        {{ translateActivityType(activity) | translate }}
      </div>
    </div>
    <div class="row no-gutters detail-line" *ngIf="activity.acquiredSkills && activity.acquiredSkills.length > 0">
      <div class="col-2">
        <strong>{{ 'card.activity.skills' | translate }}</strong>
      </div>
      <div class="col">
        <ul class="list-inline list-inline-commas mb-0">
          <li class="list-inline-item" *ngFor="let s of activity.acquiredSkills">{{ s.name }}</li>
        </ul>
      </div>
    </div>
  `,
  styleUrls: ['./card-common.scss']
})
export class CardActivityComponent extends AbstractComponent {

  @Input() activity: AnyActivity;
  @Input() hideFavorite: boolean = false;

  constructor(private activitiesService: ActivitiesService) {
    super();
  }

  favoriteActivity(activity: AnyActivity) {
    let obs: Observable<void>;

    switch (activity.type) {
      case 'teach':
        obs = this.activitiesService.favoriteTeach(activity.id, !activity.favorite);
        break;
      case 'event':
        obs = this.activitiesService.favoriteEvent(activity.id, !activity.favorite);
        break;
      case 'research':
        obs = this.activitiesService.favoriteResearch(activity.id, !activity.favorite);
        break;
      default:
        throw new Error('invalid activity type ' + activity.type);
    }

    obs.subscribe(() => {
      activity.favorite = !activity.favorite;
    });
  }

}
