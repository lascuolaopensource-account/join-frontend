import {Component} from "@angular/core";


@Component({
  template: `
    <h3 class="text-center">{{ 'bazaar.propose.modal.title' | translate }}</h3>
    <ul class="list-unstyled">
      <li class="text-right-arrow">
        <a routerLink="/bazaar/propose/learn">{{ 'bazaar.propose.modal.learn' | translate }}</a>
      </li>
      <li class="text-right-arrow">
        <a routerLink="/bazaar/propose/teach">{{ 'bazaar.propose.modal.teach' | translate }}</a>
      </li>
      <li class="text-right-arrow">
        <a routerLink="/bazaar/propose/research">{{ 'bazaar.propose.modal.research' | translate }}</a>
      </li>
      <li class="text-right-arrow">
        <a routerLink="/bazaar/propose/event">{{ 'bazaar.propose.modal.event' | translate }}</a>
      </li>
    </ul>
  `,
  styles: [`
    a {
      color: white;
      font-weight: bold;
    }
    a:hover {
      color: gold;
    }
  `]
})
export class BazaarProposeModalComponent {

  constructor() {}

}
