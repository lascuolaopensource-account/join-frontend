import {Component, Input, OnInit} from "@angular/core";
import {BazaarIdea, BazaarPreference} from "@sos/sos-ui-shared";
import {ActivatedRoute, Router} from "@angular/router";
import {Observable} from "rxjs/Observable";
import {BazaarPreferenceService} from "../preference.service";
import {BazaarPostedCommentService} from "./comments/posted-comment.service";


@Component({
  selector: 'sos-bazaar-show-interactions-bar',
  styles: [`
    :host > div {
      display: inline-block;
    }
    
    :host > div:not(:first-of-type) {
      border-left: 1px solid black;
      padding-left: .8rem;
    }
    
    :host, button {
      font-size: 1.8rem;
      padding: 0;
    }
    
    a, .btn-link, :host {
      color: #dc64d7;
    }
    
    button {
      cursor: pointer;
    }

    a:hover, a:focus, button:hover, button:focus {
      text-decoration: none;
    }
    
    span.small {
      font-size: 40%;
    }
  `],
  template: `
    <div [title]="'bazaar.interact.agrees' | translate">
      <span class="small">{{ idea.counts.agrees | number }}</span>
      <button class="btn btn-link" (click)="updateAgree()">
        <i class="sos-icon agree" [class.shaded]="agrees"></i>
      </button>
    </div>
    <div [title]="'bazaar.interact.wishes' | translate">
      <span class="small">{{ idea.counts.wishes | number }}</span>
      <button class="btn btn-link" (click)="clickWish()">
        <i class="sos-icon wish" [class.shaded]="wishes"></i>
      </button>
    </div>
    <div [title]="'bazaar.interact.favorites' | translate">
      <span class="small">{{ idea.counts.favorites | number }}</span>
      <sos-bazaar-favorite fontSize="1.8rem" [idea]="idea"></sos-bazaar-favorite>
    </div>
    <div [title]="'bazaar.interact.comments' | translate">
      <span class="small">{{ idea.counts.comments | number }}</span>
      <a [routerLink]="commentsOpen ? '.' : 'comments'" [queryParams]="queryParams">
        <i class="sos-icon comment" [class.shaded]="commentsOpen"></i>
      </a>
    </div>
  `
})
export class BazaarShowInteractionsBarComponent implements OnInit {

  @Input() idea: BazaarIdea;
  @Input() commentsOpen: boolean;

  public preference: BazaarPreference;
  public queryParams: object;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private bazaarPreferenceService: BazaarPreferenceService,
              private postedCommentService: BazaarPostedCommentService) {}

  ngOnInit(): void {
    this.preference = this.idea.preference || new BazaarPreference(0, this.idea.id, 0, false, null, false);

    this.bazaarPreferenceService.preferenceUpdates.subscribe(preference => {
      if (preference.ideaId === this.idea.id && preference.ideaType === this.idea.ideaType) {
        let doUpdate = !this.preference || (this.preference.favorite !== preference.favorite);
        this.preference = preference;
        if (doUpdate) {
          if (this.preference.favorite)
            this.idea.counts.favorites++;
          else this.idea.counts.favorites--;
        }
      }
    });

    this.postedCommentService.onPosted.subscribe(added => {
      if (added) this.idea.counts.comments++;
      else this.idea.counts.comments--;
    });

    this.postedCommentService.onWished.subscribe(added => {
      if (added) this.idea.counts.wishes++;
      else this.idea.counts.wishes--;
    });

    this.route.queryParamMap.subscribe(paramMap => {
      this.queryParams = {};
      paramMap.keys.forEach(k => {
        this.queryParams[k] = paramMap.get(k);
      });
    });
  }

  get agrees(): boolean {
    return this.preference && this.preference.agree;
  }

  get wishes(): boolean {
    return this.preference && this.preference.wish !== null;
  }

  clickWish() {
    this.queryParams['wish'] = !this.wishes;
    // noinspection JSIgnoredPromiseFromCall
    this.router.navigate(['comments'], { queryParams: this.queryParams, relativeTo: this.route });
  }

  updateAgree() {
    this.flipAgree();
    this.updatePreference(() => this.flipAgree());
  }

  private flipAgree() {
    this.preference.agree = !this.preference.agree;
    if (this.preference.agree)
      this.idea.counts.agrees++;
    else this.idea.counts.agrees--;
  }

  private updatePreference(errorCb: (e: any) => void) {
    this.upsertPreference().subscribe(
      pref => {
        this.preference = pref;
      },
      error => {
        console.error('error upserting idea preference', error);
        errorCb(error);
      }
    );
  }

  private upsertPreference(): Observable<BazaarPreference> {
    if (this.router.url.indexOf('learn') !== -1) {
      return this.bazaarPreferenceService.upsertFlagsLearn(this.preference);
    } else if (this.router.url.indexOf('teach') !== -1) {
      return this.bazaarPreferenceService.upsertFlagsTeach(this.preference);
    } else if (this.router.url.indexOf('event') !== -1) {
      return this.bazaarPreferenceService.upsertFlagsEvent(this.preference);
    } else if (this.router.url.indexOf('research') !== -1) {
      return this.bazaarPreferenceService.upsertFlagsResearch(this.preference);
    } else {
      throw new Error(`cannot find idea type in url ${this.router.url}`);
    }
  }

}
