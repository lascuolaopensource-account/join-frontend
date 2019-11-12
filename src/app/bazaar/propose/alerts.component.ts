import {Component, Input} from "@angular/core";


export type Alert = { path: string, messages: string[] };

@Component({
  selector: 'sos-bazaar-propose-alerts',
  template: `
    <div *ngIf="alerts.length > 0" class="alert alert-danger">
      <p [innerHTML]="'bazaar.propose.alerts' | translate"></p>
      <ul class="list-unstyled">
        <li *ngFor="let alert of alerts">
          <strong>{{ alert.path }}</strong>
          <ul class="list-inline d-inline">
            <li class="list-inline-item" *ngFor="let message of alert.messages">{{ message }}</li>
          </ul>
        </li>
      </ul>
    </div>
  `
})
export class BazaarProposeAlertsComponent {

  @Input() alerts: Alert[];

}
