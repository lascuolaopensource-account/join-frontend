import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ActivityEventSlim, ActivityResearchSlim, ActivityTeachSlim} from "@sos/sos-ui-shared";
import {TranslateTitleService} from "../translate";


type RouteData = { teach: ActivityTeachSlim[], event: ActivityEventSlim[], research: ActivityResearchSlim[] }

@Component({
  selector: 'sos-activities',
  template: `
    <h1 class="title font-weight-normal text-center mb-5"
        [innerHTML]="'activities.heading' | translate"></h1>

    <div class="row fluid-content">

      <div class="col-12 col-md-4">
        <h3 class="h5 double-bottom-border">
          <a routerLink="teach">{{ 'activities.teach' | translate }}</a></h3>
        <p *ngIf="teachEmpty">{{ 'activities.none' | translate }}</p>
        <div class="mb-3" *ngFor="let activity of teach">
          <sos-activity-teach-slim [activity]="activity"></sos-activity-teach-slim>
        </div>
      </div>

      <div class="col-12 col-md-4">
        <h3 class="h5 double-bottom-border">
          <a routerLink="research">{{ 'activities.research' | translate }}</a></h3>
        <p *ngIf="researchEmpty">{{ 'activities.none' | translate }}</p>
        <div class="mb-3" *ngFor="let activity of research">
          <sos-activity-research-slim [activity]="activity"></sos-activity-research-slim>
        </div>
      </div>

      <div class="col-12 col-md-4">
        <h3 class="h5 double-bottom-border">
          <a routerLink="event">{{ 'activities.event' | translate }}</a></h3>
        <p *ngIf="eventEmpty">{{ 'activities.none' | translate }}</p>
        <div class="mb-3" *ngFor="let activity of event">
          <sos-activity-event-slim [activity]="activity"></sos-activity-event-slim>
        </div>
      </div>

    </div>
  `
})
export class ActivitiesComponent implements OnInit {

  public teach: ActivityTeachSlim[];
  public event: ActivityEventSlim[];
  public research: ActivityResearchSlim[];

  public teachEmpty: boolean = true;
  public eventEmpty: boolean = true;
  public researchEmpty: boolean = true;

  constructor(private route: ActivatedRoute,
              private titleService: TranslateTitleService) {}

  ngOnInit() {
    this.titleService.setTitle('activities.title');

    this.route.data.subscribe((data: RouteData) => {
      this.teach = data.teach;
      this.event = data.event;
      this.research = data.research;

      this.teachEmpty = data.teach.length < 1;
      this.eventEmpty = data.event.length < 1;
      this.researchEmpty = data.research.length < 1;
    });
  }

}
