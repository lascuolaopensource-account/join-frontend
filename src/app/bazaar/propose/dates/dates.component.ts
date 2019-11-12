import {Component, Input, OnInit} from "@angular/core";
import {SOSDate, timeToString, dateWithoutTimestamp} from '@sos/sos-ui-shared';


type BazaarDatePlus = SOSDate & { dateString: string }

@Component({
  selector: 'sos-bazaar-propose-dates',
  templateUrl: './dates.component.html',
  styleUrls: ['../propose.scss']
})
export class BazaarProposeDatesComponent implements OnInit {

  @Input() dates: BazaarDatePlus[];
  @Input() editing: boolean;

  constructor() {}

  ngOnInit(): void {
    this.dates.forEach(date => {
      date.dateString = dateWithoutTimestamp(date.date);
      date.startTime = timeToString(parseInt(date.startTime));
      date.endTime = timeToString(parseInt(date.endTime));
    });
  }

  addDate() {
    const date = new SOSDate(0, null, null, null) as BazaarDatePlus;
    this.dates.push(date);
  }

  // noinspection JSMethodCanBeStatic
  fixDate(date: BazaarDatePlus) {
    date.date = new Date(date.dateString);
  }

  removeDate(index: number) {
    if (this.editing) {
      if (this.dates[index].id === 0) {
        this.dates.splice(index, 1);
      } else {
        this.dates[index]._delete = true;
      }
    } else {
      this.dates.splice(index, 1);
    }
  }

}
