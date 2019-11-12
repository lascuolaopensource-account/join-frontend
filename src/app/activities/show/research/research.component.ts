import {AfterViewInit, Component, ElementRef, Inject, OnInit} from '@angular/core';
import {AbstractComponent} from "../../../abstract-component";
import {ActivitiesService, ActivityResearch, ActivityResearchRole, ResearchAppRequest} from '@sos/sos-ui-shared';
import {TranslateService, TranslateTitleService} from "../../../translate";
import {ActivatedRoute} from "@angular/router";
import * as _ from 'lodash';
import {SOS_CONFIG} from "../../../../sos.config";


declare const $: any;


@Component({
  selector: 'sos-research',
  templateUrl: './research.component.html',
  styleUrls: ['./research.component.scss']
})
export class ActivityResearchShowComponent extends AbstractComponent implements OnInit, AfterViewInit {

  public activity: ActivityResearch;

  public showingApplications: boolean = false;
  public showingApplyForms: { [key: number]: boolean } = {};

  public deadlinePassed: boolean;
  public projectStateTxt: string;

  public contactLink: string;
  public donateLink: string;

  constructor(private route: ActivatedRoute,
              private titleService: TranslateTitleService,
              private translateService: TranslateService,
              private activitiesService: ActivitiesService,
              @Inject(SOS_CONFIG) private sosConfig,
              private element: ElementRef) {
    super();
  }

  ngOnInit() {
    this.route.data.subscribe((data: { activity: ActivityResearch }) => {
      this.activity = data.activity;

      let translationH = { title: this.activity.title };
      let subject = this.translateService.instant(`activity.${this.activity.type}.contact.subject`, translationH);
      this.contactLink = `${this.sosConfig.contactLink}?subject=${subject}`;
      this.donateLink = this.sosConfig.researchDonate;

      this.activity.roles.forEach(role => {
        this.showingApplyForms[role.id] = false;
      });

      this.titleService.setTitle('activity.research.title', { title: this.activity.title });

      const now = new Date;
      let deadline: Date = null;
      if (this.activity.deadline) {
        deadline = new Date(this.activity.deadline.toString());
        deadline.setDate(deadline.getDate() + 1);
      }
      this.deadlinePassed = deadline != null && deadline < now;
      let endDate = new Date(this.activity.startDate.getTime());
      endDate.setDate(endDate.getDate() + this.activity.duration);
      this.projectStateTxt = endDate < now ?
        'activity.research.state.terminated' : 'activity.research.state.ongoing';
    });
  }

  ngAfterViewInit(): void {
    $(this.element.nativeElement).find('.carousel').carousel();
  }

  changeFavorite(evt: Event) {
    evt.preventDefault();
    const favorite = !this.activity.favorite;
    this.activitiesService.favoriteResearch(this.activity.id, favorite).subscribe(() => {
      this.activity.favorite = favorite;
    });
  }

  toggleApplications() {
    if (this.showingApplications) {
      this.showingApplications = false;
      return;
    }

    this.activitiesService.applications(this.activity.id).subscribe(roles => {
      roles.forEach(role => {
        let activityRole = _.find<ActivityResearchRole>(this.activity.roles, r => r.id === role.id);
        if (activityRole)
          activityRole.applications = role.applications;
      });
      this.showingApplications = true;
    });
  }

  toggleApplyForm(roleId: number) {
    this.showingApplyForms[roleId] = !this.showingApplyForms[roleId];
  }

  changeApplication(evt:Event, role: ActivityResearchRole, motivation?: string) {
    evt.preventDefault();

    let appReq: ResearchAppRequest = {
      apply: role.application == null
    };

    if (motivation)
      appReq.motivation = motivation;

    this.activitiesService.changeApplication(role.id, appReq).subscribe(app => {
      role.application = app;
      this.showingApplyForms[role.id] = false;
    });
  }

}
