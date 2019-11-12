import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {MembershipService, MembershipType, User, UserService} from "@sos/sos-ui-shared";
import {TranslateService, TranslateTitleService} from "../translate";


function findColumnSize(nMemberships: number): number {
  if (nMemberships <= 1) return 12;
  else if (nMemberships === 2) return 6;
  else if (nMemberships % 4 === 0) return 3;
  else if (nMemberships % 3 === 0) return 4;
  else return 3;
}

@Component({
  selector: 'sos-membership',
  templateUrl: './membership.component.html',
  styleUrls: ['./membership.component.scss']
})
export class MembershipComponent implements OnInit {

  public user: User;
  public memberships: MembershipType[];
  public payedMemberships: MembershipType[];
  public membershipColumnSize: number;
  public bottomTxt: string;

  constructor(private route: ActivatedRoute,
              private userService: UserService,
              private membershipService: MembershipService,
              private titleService: TranslateTitleService,
              private translateService: TranslateService) {}

  ngOnInit() {
    this.titleService.setTitle('membership.title');

    this.route.data.subscribe((data: { me: User, membershipTypes: MembershipType[] }) => {
      const baseMembership: MembershipType = {
        id: null,
        name: this.translateService.instant('membership.base.title'),
        language: null,
        offer: this.translateService.instant('membership.base.list'),
        bottom: null,
        position: null,
        price: 0,
        createdAt: null
      };

      this.memberships = data.membershipTypes.sort((a, b) => a.position - b.position);
      this.memberships = [baseMembership, ...this.memberships];

      this.payedMemberships = this.memberships.filter(m => m.price > 0);
      this.membershipColumnSize = findColumnSize(this.memberships.length);
      this.bottomTxt = this.translateService.instant('membership.bottom.text', {
        memberships: this.payedMemberships.length.toString()
      });

      this.user = data.me;
      // the following is required to that the SosAppComponent gets updated too
      this.userService.updateUser(this.user);
    });
  }

  // noinspection JSMethodCanBeStatic
  private handleError(error: any) {
    console.error(error);
  }

  requestNew(type: MembershipType) {
    this.membershipService.requestNew(type.id).subscribe(
      membershipRequest => {
        this.user.memberships.request = membershipRequest;
      },
      this.handleError
    );
  }

  requestRenewal() {
    this.membershipService.requestRenewal().subscribe(
      membershipRequest => {
        this.user.memberships.request = membershipRequest;
      },
      this.handleError
    );
  }

  cancelRequest() {
    this.membershipService.deleteRequest().subscribe(
      () => {
        this.user.memberships.request = null;
      },
      this.handleError
    );
  }

  cancelActive() {
    this.membershipService.deleteActive().subscribe(
      () => {
        this.user.memberships.active = null;
        this.user.memberships.renewal = null;
        this.user.memberships.request = null;
      },
      this.handleError
    );
  }

  cancelRenewal() {
    this.membershipService.deleteRenewal().subscribe(
      () => {
        this.user.memberships.renewal = null;
      },
      this.handleError
    );
  }

}
