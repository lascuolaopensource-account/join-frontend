import {Component} from "@angular/core";
import {LoadingService} from "./loading.service";
import {AuthService} from "@sos/sos-ui-shared";


@Component({
  selector: 'sos-loading',
  template: `
    <div id="loading-overlay" *ngIf="loadingService.loading">
      <div>
        <div class="sos-icon skull"></div>
        <div *ngIf="!authService.showLogin" [innerHTML]="'loading.load' | translate"></div>
        <div *ngIf="authService.showLogin">
          <button (click)="clickLogin($event)" class="btn btn-black"
                [innerHTML]="'loading.login' | translate"></button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    #loading-overlay {
      background-color: white;
      color: black;
      width: 100%;
      height: 100%;
      position: fixed;
      top: 0;
      left: 0;
      text-align: center;
      z-index: 999999999;
      display: table;
    }
    #loading-overlay > div {
      vertical-align: middle;
      display: table-cell;
    }
    .sos-icon.skull {
      font-size: 6rem;
    }
  `]
})
export class LoadingComponent {

  constructor(public loadingService: LoadingService,
              public authService: AuthService) {}

  clickLogin(evt: Event) {
    evt.preventDefault();
    this.authService.showLoginEmitter.emit();
  }

}
