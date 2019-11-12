import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {
  BazaarIdeaMeetingsType,
  FixedDaysMeetings,
  RecurringMeetings,
  SingleFixedDaysMeetings
} from "@sos/sos-ui-shared";
import {AbstractComponent} from "../../../abstract-component";

@Component({
  selector: 'sos-bazaar-propose-meetings',
  templateUrl: './meetings.component.html',
  styleUrls: ['../propose.scss']
})
export class BazaarProposeMeetingsComponent extends AbstractComponent implements OnInit {

  @Input() meetings: BazaarIdeaMeetingsType;
  @Input() editing: boolean;
  @Output() meetingsChange = new EventEmitter<BazaarIdeaMeetingsType>();

  private storedFixedMeetings: FixedDaysMeetings = null;
  private storedRecurringMeetings: RecurringMeetings = null;

  public isFixedDays: boolean | null = null;

  constructor() {
    super();
  }

  ngOnInit() {
    if (this.meetings) {
      this.isFixedDays = this.meetings instanceof FixedDaysMeetings;
    }
  }

  changeMeetingsType() {
    if (this.isFixedDays) {
      if (this.meetings instanceof RecurringMeetings)
        this.storedRecurringMeetings = this.meetings as RecurringMeetings;

      if (this.storedFixedMeetings !== null)
        this.meetings = this.storedFixedMeetings;
      else
        this.meetings = new FixedDaysMeetings([]);

    } else {
      if (this.meetings instanceof FixedDaysMeetings)
        this.storedFixedMeetings = this.meetings as FixedDaysMeetings;

      if (this.storedRecurringMeetings !== null)
        this.meetings = this.storedRecurringMeetings;
      else
        this.meetings = new RecurringMeetings(null, null, null, null);
    }

    this.meetingsChange.emit(this.meetings);
  }

  addDaysSchedule() {
    if (this.meetings instanceof FixedDaysMeetings)
      (this.meetings as FixedDaysMeetings).schedules.push(new SingleFixedDaysMeetings(0, null, null));
  }

  removeDaysSchedule(index: number) {
    if (this.meetings instanceof FixedDaysMeetings) {
      if (this.editing) {
        (this.meetings as FixedDaysMeetings).schedules[index]._delete = true;
      } else {
        (this.meetings as FixedDaysMeetings).schedules.splice(index, 1);
      }
    }
  }

}
