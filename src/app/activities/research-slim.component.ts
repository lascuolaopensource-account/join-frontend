import {Component, Input} from "@angular/core";
import {ActivitiesService, ActivityResearchSlim} from "@sos/sos-ui-shared";


@Component({
  selector: 'sos-activity-research-slim',
  styleUrls: ['./activity-slim.scss'],
  template: `
    <div class="row no-gutters">
      <div class="col-1 col-sm-2">
        <button type="button" class="btn btn-sm btn-link favorite-btn" (click)="favoriteActivity($event)">
          <i class="fa" [class.fa-heart]="activity.favorite"
             [class.fa-heart-o]="!activity.favorite"></i>
        </button>
      </div>
      <div class="col-11 col-sm-10">
        <h4 class="title"><a [routerLink]="['/activities', activity.type, activity.id]">{{ activity.title }}</a></h4>
      </div>
    </div>
    <div class="row no-gutters detail-line py-1">
      <div class="col-4 col-md-3">{{ 'activities.research.start' | translate }}</div>
      <div class="col-8 col-md-9">{{ activity.startDate | date:'longDate' }}</div>
    </div>
    <div class="row no-gutters detail-line py-1">
      <div class="col-4 col-md-3">{{ 'activities.research.call' | translate }}</div>
      <div class="col-8 col-md-9">
        <span *ngIf="!activity.deadline.closed && activity.rolesCount === 1">
          {{ 'activities.research.call.open.s' | translate }}</span>
        <span *ngIf="!activity.deadline.closed && activity.rolesCount > 1">
            {{ 'activities.research.call.open.p' | translate:{roles: activity.rolesCount} }}</span>
        <span *ngIf="activity.deadline.closed" class="text-magenta">
            {{ 'activities.research.call.closed' | translate }}</span>
      </div>
    </div>
    <div class="row no-gutters detail-line py-1">
      <div class="col-4 col-md-3">{{ 'activities.research.topics' | translate }}</div>
      <div class="col-8 col-md-9">
        <ul class="list-inline mb-0 list-inline-commas">
          <li class="list-inline-item" *ngFor="let topic of activity.topics">
            {{ topic.topic }}</li>
        </ul>
      </div>
    </div>
    <div class="row no-gutters detail-line py-1" *ngIf="activity.owner">
      <div class="col-4 col-md-3">{{ 'activities.research.owner' | translate }}</div>
      <div class="col-8 col-md-9">
        <a [routerLink]="['/profile', activity.owner.id]">
          {{ activity.owner.firstName }} {{ activity.owner.lastName }}</a>
      </div>
    </div>
  `
})
export class ActivityResearchSlimComponent {

  @Input() activity: ActivityResearchSlim;

  constructor(private activitiesService: ActivitiesService) {}

  favoriteActivity(evt: Event) {
    evt.preventDefault();

    this.activitiesService.favoriteResearch(this.activity.id, !this.activity.favorite).subscribe(() => {
      this.activity.favorite = !this.activity.favorite;
    });
  }

}
