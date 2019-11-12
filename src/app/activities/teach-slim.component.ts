import {Component, Input} from "@angular/core";
import {ActivityTeachSlim, ActivitiesService} from "@sos/sos-ui-shared";


@Component({
  selector: 'sos-activity-teach-slim',
  styleUrls: ['activity-slim.scss'],
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
      <div class="col-4 col-md-3">{{ 'activities.teach.date' | translate }}</div>
      <div class="col-8 col-md-9">{{ activity.startTime | date:'longDate' }}</div>
    </div>
    <div class="row no-gutters detail-line py-1">
      <div class="col-4 col-md-3">{{ 'activities.teach.deadline' | translate }}</div>
      <div class="col-8 col-md-9">
        <span *ngIf="!activity.deadline.closed">
          {{ activity.deadline.date | date:'longDate' }}</span>
        <span *ngIf="activity.deadline.closed" class="text-magenta">
          {{ 'activities.teach.deadline.closed' | translate }}</span>
      </div>
    </div>
    <div class="row no-gutters detail-line py-1">
      <div class="col-4 col-md-3">{{ 'activities.teach.topics' | translate }}</div>
      <div class="col-8 col-md-9">
        <ul class="list-inline mb-0 list-inline-commas">
          <li class="list-inline-item" *ngFor="let topic of activity.topics">
            {{ topic.topic }}</li>
        </ul>
      </div>
    </div>
    <div class="row no-gutters detail-line py-1">
      <div class="col-4 col-md-3">{{ 'activities.teach.teachers' | translate }}</div>
      <div class="col-8 col-md-9">
        <ul class="list-inline mb-0 list-inline-commas">
          <li class="list-inline-item" *ngFor="let guest of activity.guests">
            <a *ngIf="guest.userId != null" [routerLink]="['/profile', guest.userId]">
              {{ guest.firstName }} {{ guest.lastName }}</a><!--
            --><span *ngIf="guest.userId == null">
              {{ guest.firstName }} {{ guest.lastName }}</span></li>
        </ul>
      </div>
    </div>
  `
})
export class ActivityTeachSlimComponent {

  @Input() activity: ActivityTeachSlim;

  constructor(private activitiesService: ActivitiesService) {}

  favoriteActivity(evt: Event) {
    evt.preventDefault();

    this.activitiesService.favoriteTeach(this.activity.id, !this.activity.favorite).subscribe(() => {
      this.activity.favorite = !this.activity.favorite;
    });
  }

}
