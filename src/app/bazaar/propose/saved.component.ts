import {Component, EventEmitter, Input, Output} from "@angular/core";
import {BazaarIdea} from "@sos/sos-ui-shared";


@Component({
  selector: 'sos-bazaar-propose-saved',
  template: `
    <div class="fluid-content">
      <div class="text-center text-white my-5">
        <div class="h1 font-weight-normal" [innerHTML]="'bazaar.propose.saved.title' | translate"></div>
        <div class="h5 mb-0" [innerHTML]="'bazaar.propose.saved.subtitle' | translate"></div>
      </div>
      <div class="row no-gutters bottom py-3">
        <div class="col-6 text-sm-center">
          <a routerLink="/bazaar" class="text-sm-large"
             [innerHTML]="'bazaar.propose.saved.bazaar' | translate"></a>
        </div>
        <div class="col-6 text-right text-sm-center">
          <button type="button" *ngIf="editing" class="btn btn-link text-sm-large"
                  [innerHTML]="'bazaar.propose.saved.edit' | translate"
                  (click)="editIdea.emit()"></button>
          <a *ngIf="!editing" class="text-sm-large"
             [routerLink]="['/bazaar/propose', idea.ideaType, idea.id]"
             [innerHTML]="'bazaar.propose.saved.edit' | translate"></a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bottom {
      border-top: 1px solid black;
      font-weight: bold;
    }
    .btn-link {
      padding: 0;
      font-weight: bold;
    }
  `]
})
export class BazaarProposeSavedComponent {

  @Input() idea: BazaarIdea;
  @Input() editing: boolean;
  @Output() editIdea = new EventEmitter<void>();

  constructor() {}

}
