import {Component} from "@angular/core";


@Component({
  selector: 'sos-home-welcome-component',
  styleUrls: ['./welcome.component.scss'],
  template: `
    <h3>{{ 'home.welcome.title' | translate }}</h3>
    <div class="mb-5" [innerHTML]="'home.welcome.body' | translate"></div>
  `
})
export class HomeWelcomeComponent {}
