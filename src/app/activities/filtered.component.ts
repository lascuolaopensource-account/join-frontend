import {Component, OnInit} from "@angular/core";
import {TranslateTitleService} from "../translate";
import {ActivatedRoute} from "@angular/router";
import {ActivitySlim, ActivityType} from "@sos/sos-ui-shared";


@Component({
  selector: 'sos-activities-filtered',
  styleUrls: ['./filtered.component.scss'],
  template: `
    <div class="fluid-content">
      <div class="double-bottom-border">
        <div>
          <h1>{{ headingTxt | translate }}</h1>
          <h5><a routerLink="/activities" [innerHTML]="subheadTxt | translate"></a></h5>
        </div>
      </div>
      <div class="row mt-3">
        <div class="col-12 col-sm-6 col-md-4 mb-3" *ngFor="let activity of activities">
          <sos-activity-teach-slim *ngIf="activity.type === 'teach'"
                                   [activity]="activity"></sos-activity-teach-slim>
          <sos-activity-event-slim *ngIf="activity.type === 'event'"
                                   [activity]="activity"></sos-activity-event-slim>
          <sos-activity-research-slim *ngIf="activity.type === 'research'"
                                      [activity]="activity"></sos-activity-research-slim>
        </div>
      </div>
    </div>
  `
})
export class ActivitiesFilteredComponent<T extends ActivitySlim> implements OnInit {

  public activities: T[];
  public headingTxt: string;
  public subheadTxt: string;

  constructor(private route: ActivatedRoute,
              private titleService: TranslateTitleService) {}


  ngOnInit(): void {
    this.route.data.subscribe((data: { activities: T[], type: ActivityType }) => {
      this.titleService.setTitle(`activities.${data.type}Page.title`);
      this.headingTxt = `activities.${data.type}Page.heading`;
      this.subheadTxt = `activities.${data.type}Page.subhead`;
      this.activities = data.activities;
    });
  }

}
