import {AfterViewChecked, Component, OnInit, ViewChild} from '@angular/core';
import {
  CalendarService,
  dateWithoutTimestamp,
  FablabMachine,
  FablabQuotationRequest,
  FablabReservation,
  FablabReservationTime,
  FablabService,
  User,
  YearMonthObj
} from "@sos/sos-ui-shared";
import {ActivatedRoute} from "@angular/router";
import * as _ from 'lodash';
import {TranslateTitleService} from "../translate";
import {NgForm} from "@angular/forms";


type MonthReservations = {
  [day: number]: {
    [startHour: number]: boolean,
    full: boolean
  }
}


@Component({
  selector: 'sos-fablab',
  templateUrl: './fablab.component.html',
  styleUrls: ['./fablab.component.scss']
})
export class FablabComponent implements OnInit, AfterViewChecked {

  public me: User;

  public machines: FablabMachine[];
  public machineIdx: number | null = null;

  private reservations: FablabReservation[];

  public monthReservations: MonthReservations;

  private reservationsCache: YearMonthObj<MonthReservations>;

  public daysOfWeek = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  public thisHour: number;
  public thisDate: number;
  public thisMonth: number;
  public thisYear: number;
  public firstDay: Date;
  public firstDayY: number;
  public firstDayM: number;
  public calendar: (number | '')[][];
  public timesTable: { hour: number, str: string }[][];
  public openedDate: number | null = null;

  public selectedTimes: FablabReservationTime[];
  public withOperator: boolean;

  // contains reservation dates and times selections to display in view
  public selectionsH: YearMonthObj<{ [day: number]: { [hour: number]: boolean } }>;

  public totalPrice: number = 0;

  public showAlertSuccess: boolean = false;
  public showAlertFailure: boolean = false;

  public quotation: FablabQuotationRequest;
  public quotationMachinesSel: boolean[];
  @ViewChild('quotationForm') quotationForm: NgForm;
  public quotationAlert: { success: boolean, failed: boolean, txt: string } = null;

  private scrolledToReservations: boolean = false;

  constructor(private route: ActivatedRoute,
              private titleService: TranslateTitleService,
              private calendarService: CalendarService,
              private fablabService: FablabService) {}

  ngOnInit() {
    this.titleService.setTitle('fablab.title');

    this.thisHour = new Date().getHours();
    this.thisDate = new Date().getDate();
    this.thisMonth = new Date().getMonth();
    this.thisYear = new Date().getFullYear();

    this.firstDay = new Date();
    this.firstDay.setHours(0, 0, 0, 0);
    this.firstDay.setDate(1);
    this.firstDayY = this.firstDay.getFullYear();
    this.firstDayM = this.firstDay.getMonth();
    this.updateCalendar();

    let time = 0;
    this.timesTable = [];
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 4; j++) {
        if (!this.timesTable[i])
          this.timesTable[i] = [];
        this.timesTable[i][j] = {
          hour: time,
          str: `${time} - ${time + 1}`
        };
        time++;
      }
    }

    this.route.data.subscribe((data: { me: User, machines: FablabMachine[] }) => {
      this.me = data.me;
      this.machines = data.machines.map(machine => {
        this.setOperator(machine, false);
        return machine;
      });
      this.resetQuotation();
    });
  }

  ngAfterViewChecked(): void {
    if (!this.scrolledToReservations && this.machineIdx !== null) {
      let formAnchor = document.getElementById('fablab-reservation-form-anchor');
      if (formAnchor) formAnchor.scrollIntoView();
      this.scrolledToReservations = true;
    }
  }

  private resetQuotation() {
    this.quotationMachinesSel = this.machines.map(() => false);
    this.quotation = {} as FablabQuotationRequest;
  }

  // noinspection JSMethodCanBeStatic
  setOperator(machine: FablabMachine, selected: boolean) {
    machine['operatorSelected'] = selected;
    machine['showPrice'] = machine.priceHour + (selected ? machine.operatorCost : 0);
  }

  private setMonthReservations() {
    const year = this.firstDayY;
    const month = this.firstDayM;

    if (this.reservationsCache[year]) {
      if (this.reservationsCache[year][month]) {
        this.monthReservations = _.cloneDeep(this.reservationsCache[year][month]);
        return;
      }
    }
    this.reservationsCache[year] = {};

    this.monthReservations = {};
    const daysInMonth = CalendarService.getMonthDays(year)[month];

    for (let day = 1; day <= daysInMonth; day++) {
      this.monthReservations[day] = { full: false };
    }

    this.reservations.forEach(reservation => {
      reservation.times.forEach(time => {
        if (time.date.getFullYear() === year && time.date.getMonth() === month)
          this.monthReservations[time.date.getDate()][time.hour] = true;
      });
    });

    for (let day = 1; day <= daysInMonth; day++) {
      let b = true;
      for (let hour = 0; hour < 24 && b; hour++)
        b = b && this.monthReservations[day][hour];
      this.monthReservations[day].full = b
    }

    this.reservationsCache[year][month] = _.cloneDeep(this.monthReservations);
  }

  selectMachine(idx: number) {
    this.selectedTimes = [];
    this.fablabService.machineReservations(this.machines[idx].id, true).subscribe(reservations => {
      this.reservations = reservations;
      this.reservationsCache = {};
      this.setMonthReservations();
      this.openedDate = null;
      this.showAlertSuccess = false;
      this.showAlertFailure = false;
      this.selectedTimes = [];
      this.withOperator = false;
      this.selectionsH = {};
      this.machineIdx = idx;
      this.totalPrice = 0;

      this.openDay(new Date().getDate());
      this.scrolledToReservations = false;
    });
  }

  get machine(): FablabMachine | null {
    return this.machineIdx !== null ? this.machines[this.machineIdx] : null;
  }

  get todayOpened(): boolean | null {
    if (this.openedDate === null)
      return null;

    let d = new Date();
    d.setHours(0, 0, 0, 0);
    let od = new Date(this.firstDay.getTime());
    od.setDate(this.openedDate);
    return d.getTime() === od.getTime();
  }

  openDay(day: number) {
    if (this.dayNotSelectable(day))
      return;
    this.openedDate = day;
  }

  selectTime(hour: number) {
    if (this.timeNotSelectable(hour))
      return;

    let date = new Date(this.firstDay.getTime());
    date.setDate(this.openedDate);

    const y = date.getFullYear();
    const m = date.getMonth();
    const d = date.getDate();

    for (let i = 0; i < this.selectedTimes.length; i++) {
      let t = this.selectedTimes[i];
      if (t.date.getTime() === date.getTime() && t.hour === hour) {
        this.selectedTimes.splice(i, 1);
        this.totalPrice -= this.machine.priceHour + (this.withOperator ? this.machine.operatorCost : 0);
        delete this.selectionsH[y][m][d][hour];
        if (_.isEmpty(this.selectionsH[y][m][d]))
          delete this.selectionsH[y][m][d];
        return;
      }
    }

    this.selectedTimes.push({
      date: date,
      hour: hour
    });

    this.totalPrice += this.machine.priceHour + (this.withOperator ? this.machine.operatorCost : 0);

    if (!this.selectionsH[y])
      this.selectionsH[y] = {};
    if (!this.selectionsH[y][m])
      this.selectionsH[y][m] = {};
    if (!this.selectionsH[y][m][d])
      this.selectionsH[y][m][d] = {};
    this.selectionsH[y][m][d][hour] = true;
  }

  private updateCalendar() {
    this.calendar = this.calendarService.getCalendar(this.firstDayY, this.firstDayM);
  }

  nextMonth() {
    this.firstDay.setMonth(this.firstDay.getMonth() + 1);
    this.firstDayY = this.firstDay.getFullYear();
    this.firstDayM = this.firstDay.getMonth();
    this.openedDate = 1;
    this.updateCalendar();
    this.setMonthReservations();
  }

  allowPrevMonth() {
    const y = this.firstDayY;
    const m = this.firstDayM;
    return (y === this.thisYear && m > this.thisMonth) || (y > this.thisYear);
  }

  prevMonth() {
    if (!this.allowPrevMonth())
      return;
    this.firstDay.setMonth(this.firstDay.getMonth() - 1);
    this.firstDayY = this.firstDay.getFullYear();
    this.firstDayM = this.firstDay.getMonth();
    let d = new Date();
    this.openedDate = this.firstDayM === d.getMonth() ? d.getDate() : 1;
    this.updateCalendar();
    this.setMonthReservations();
  }

  private getDayAndYesterday(day: number): [Date, Date] {
    let d = new Date(this.firstDay.getTime());
    d.setDate(day);
    let y = new Date();
    y.setDate(y.getDate() - 1);
    return [d, y];
  }

  dayIsSelectable(day: number | ''): boolean {
    if (day === '')
      return false;
    let [d, y] = this.getDayAndYesterday(day);
    return this.monthReservations[day] && !this.monthReservations[day].full &&
      d.getTime() >= y.getTime();
  }

  dayNotSelectable(day: number | ''): boolean {
    if (day === '')
      return false;
    let [d, y] = this.getDayAndYesterday(day);
    return (this.monthReservations[day] && this.monthReservations[day].full) ||
      d.getTime() < y.getTime();
  }

  timeIsSelectable(hour: number): boolean {
    let to = this.todayOpened;
    return !this.monthReservations[this.openedDate][hour] &&
      ((to && hour > this.thisHour) || !to);
  }

  timeNotSelectable(hour: number): boolean {
    return this.monthReservations[this.openedDate][hour] ||
      (this.todayOpened && hour <= this.thisHour);
  }

  withOperatorChanged() {
    let p = this.selectedTimes.length * this.machine.operatorCost;
    if (this.withOperator)
      this.totalPrice += p;
    else
      this.totalPrice -= p;
  }

  createReservation() {
    if (!this.selectedTimes || this.selectedTimes.length === 0)
      return;

    let reservation = {
      machine: { id: this.machine.id },
      times: this.selectedTimes.map((t: any) => {
        t.date = dateWithoutTimestamp(t.date);
        return t;
      }),
      operator: this.withOperator
    } as FablabReservation;

    this.showAlertSuccess = false;
    this.showAlertFailure = false;
    this.fablabService.createReservation(reservation).subscribe(
      () => {
        this.reservations = undefined;
        this.reservationsCache = {};
        this.openedDate = null;
        this.selectedTimes = [];
        this.withOperator = false;
        this.selectionsH = {};
        this.machineIdx = null;
        this.totalPrice = 0;
        this.showAlertSuccess = true;
      }, error => {
        console.error('failed to create reservation', error);
        this.showAlertFailure = true;
      });
  }

  toggleMachineQuotation(idx: number) {
    this.quotationMachinesSel[idx] = !this.quotationMachinesSel[idx];
  }

  createQuotation(event: Event) {
    event.preventDefault();
    if (this.quotationForm.invalid)
      return;

    let q = _.clone(this.quotation);
    q.machines = [];
    this.quotationMachinesSel.forEach((v, i) => {
      if (v) q.machines.push(this.machines[i]);
    });

    this.quotationAlert = null;
    this.fablabService.createQuotation(q).subscribe(
      quotation => {
        console.debug('created quotation', quotation);
        this.resetQuotation();
        this.quotationAlert = { success: true, failed: false, txt: 'fablab.quotation.alert.success' };
      }, error => {
        console.error('failed quotation', error);
        this.resetQuotation();
        this.quotationAlert = { success: false, failed: true, txt: 'fablab.quotation.alert.failed' };
      });
  }

}
