import {Component, OnInit} from '@angular/core';
import {ActivitySlim, BazaarIdea, User, UserService} from "@sos/sos-ui-shared";
import {AbstractComponent} from "../abstract-component";
import {ActivatedRoute} from "@angular/router";
import {TranslateTitleService} from "../translate";


type RouteData = {
  me: User,
  ideas: BazaarIdea[],
  users: User[],
  activities: ActivitySlim[]
}


@Component({
  selector: 'sos-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent extends AbstractComponent implements OnInit {

  public users: User[];
  public ideas: BazaarIdea[];
  public activities: ActivitySlim[];

  constructor(private route: ActivatedRoute,
              private titleService: TranslateTitleService,
              private userService: UserService) {
    super();
  }

  ngOnInit() {
    this.titleService.setTitle('favorites.title');

    this.route.data.subscribe((data: RouteData) => {
      this.users = data.users;
      this.ideas = data.ideas;
      this.activities = data.activities;

      this.userService.updateUser(data.me);
    });
  }

}
