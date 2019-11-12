import {Component, Input} from "@angular/core";
import {User, UserService} from "@sos/sos-ui-shared";


@Component({
  selector: 'sos-card-user',
  template: `
    <div class="row">
      <div [ngClass]="{ 'col-10': !hideFavorite, col: hideFavorite }">
        <a class="title" [routerLink]="['/profile', user.id]">
          {{ user.firstName }} {{ user.lastName }}
          <span *ngIf="user.title">
            <span class="long-dash"></span> {{ user.title }}
          </span>
        </a>
      </div>
      <div class="col-2 text-right" *ngIf="!hideFavorite">
        <button class="btn btn-sm btn-link" (click)="favoriteUser(user)">
          <i class="fa" [class.fa-heart]="user.favorite"
             [class.fa-heart-o]="!user.favorite"></i>
        </button>
      </div>
    </div>
    <div class="row no-gutters detail-line" *ngIf="user.skills && user.skills.length > 0">
      <div class="col-2">
        <strong>{{ 'card.user.skills' | translate }}</strong>
      </div>
      <div class="col">
        <ul class="list-inline list-inline-commas mb-0">
          <li class="list-inline-item" *ngFor="let skill of user.skills"
              [hidden]="skill.request">{{ skill.name }}</li>
        </ul>
      </div>
    </div>
    <div class="row no-gutters detail-line" *ngIf="user.telephone">
      <div class="col-2">
        <strong>{{ 'card.user.tel' | translate }}</strong>
      </div>
      <div class="col">
        <a [href]="'tel:' + user.telephone">{{ user.telephone }}</a>
      </div>
    </div>
    <div class="row no-gutters detail-line">
      <div class="col-2">
        <strong>{{ 'card.user.email' | translate }}</strong>
      </div>
      <div class="col">
        <a [href]="'mailto:' + user.email">{{ user.email }}</a>
      </div>
    </div>
  `,
  styleUrls: ['./card-common.scss']
})
export class CardUserComponent {

  @Input() user: User;
  @Input() hideFavorite: boolean = false;

  constructor(private userService: UserService) {}

  favoriteUser(user: User) {
    this.userService.favorite(user.id, !user.favorite).subscribe(favorite => {
      user.favorite = favorite;
    });
  }

}
