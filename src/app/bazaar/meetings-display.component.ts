import {Component, Input} from "@angular/core";
import {RecurringMeetings} from "@sos/sos-ui-shared";


@Component({
  selector: 'sos-bazaar-meetings-display',
  template: `
    {{ meetings.days }}
    <span *ngIf="meetings.days > 1">{{ 'bazaar.details.recurring.days' | translate }}</span>
    <span *ngIf="meetings.days === 1">{{ 'bazaar.details.recurring.day' | translate }}</span>
    {{ meetings.hours }}
    <span *ngIf="meetings.hours > 1">{{ 'bazaar.details.hours' | translate }}</span>
    <span *ngIf="meetings.hours === 1">{{ 'bazaar.details.hour' | translate }}</span>
    {{ 'bazaar.details.recurring.every' | translate }}
    <span *ngIf="meetings.every > 1">{{ meetings.every }}</span>
    <span *ngIf="entity == 0 && meetings.every > 1">
      {{ 'bazaar.details.recurring.weeks' | translate }}
    </span>
    <span *ngIf="entity == 0 && meetings.every === 1">
      {{ 'bazaar.details.recurring.week' | translate }}
    </span>
    <span *ngIf="entity == 1 && meetings.every > 1">
      {{ 'bazaar.details.recurring.months' | translate }}
    </span>
    <span *ngIf="entity == 1 && meetings.every === 1">
      {{ 'bazaar.details.recurring.month' | translate }}
    </span>
    <span *ngIf="entity == 2 && meetings.every > 1">
      {{ 'bazaar.details.recurring.years' | translate }}
    </span>
    <span *ngIf="entity == 2 && meetings.every === 1">
      {{ 'bazaar.details.recurring.year' | translate }}
    </span>
  `
})
export class BazaarMeetingsDisplayComponent {

  @Input() meetings: RecurringMeetings;

  get entity(): number {
    return this.meetings.entity;
  }

}
