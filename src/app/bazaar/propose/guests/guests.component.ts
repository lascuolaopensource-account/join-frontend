import {Component, Input, OnInit} from "@angular/core";
import {BazaarIdeaGuest, User, UserService} from "@sos/sos-ui-shared";


@Component({
  selector: 'sos-bazaar-propose-guests',
  templateUrl: './guests.component.html',
  styleUrls: ['../propose.scss']
})
export class BazaarProposeGuestsComponent implements OnInit {

  @Input() guests: BazaarIdeaGuest[];
  @Input() customGuests: BazaarIdeaGuest[];
  @Input() textTop: string;
  @Input() textAdd: string;
  @Input() textBottom: string;
  @Input() textEmpty: string;
  @Input() editing: boolean;

  public searchingUser: string = null;
  private searchingUserTimeout: number = null;
  public foundUsers: User[] = [];

  constructor(private userService: UserService) {}

  ngOnInit() {}

  searchUser(name: string) {
    if (this.searchingUserTimeout !== null)
      window.clearTimeout(this.searchingUserTimeout);

    this.searchingUserTimeout = null;

    if (name.length > 2) {
      this.searchingUserTimeout = window.setTimeout(() => {
        this.userService.search(name).subscribe(users => {
          this.foundUsers = users;
        });
      }, 1000);
    }
  }

  addGuest(user: User | string) {
    const userPresent = user instanceof User && this.guests.filter(g => g.userId === user.id).length > 0;
    const present = userPresent || this.customGuests.filter(g => g.lastName === user as string).length > 0;
    if (present)
      return;

    const t = BazaarProposeGuestsComponent.userToGuest(user);
    if (t.custom)
      this.customGuests.push(t.guest);
    else
      this.guests.push(t.guest);
  }

  private static userToGuest(user: User | string): { guest: BazaarIdeaGuest, custom: boolean } {
    if (user instanceof User) {
      return {
        guest: new BazaarIdeaGuest(0, user.id, user.firstName, user.lastName, user.title || ''),
        custom: false
      };
    } else {
      return {
        guest: new BazaarIdeaGuest(0, null, null, user as string, ''),
        custom: true
      };
    }
  }

  removeGuest(idx: number, guests: BazaarIdeaGuest[]) {
    if (this.editing && guests[idx].id !== 0) {
      guests[idx]._delete = true;
    } else {
      guests.splice(idx, 1);
    }
  }

  get guestsLen(): number {
    return this.guests.filter(g => !g._delete).length;
  }

  get customGuestsLen(): number {
    return this.customGuests.filter(g => !g._delete).length;
  }

}
