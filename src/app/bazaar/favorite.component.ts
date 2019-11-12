import {Component, Input, OnInit} from "@angular/core";
import {
  BazaarEvent,
  BazaarIdea,
  BazaarIdeaSlim,
  BazaarLearn,
  BazaarPreference, BazaarPreferenceSlim,
  BazaarResearch,
  BazaarTeach
} from "@sos/sos-ui-shared";
import {BazaarPreferenceService} from "./preference.service";
import {Observable} from "rxjs/Observable";


@Component({
  selector: 'sos-bazaar-favorite',
  styles: [`
    button {
      padding: 0;
      cursor: pointer;
    }
    button:hover, button:focus {
      text-decoration: none;
    }
    .btn-link {
      color: inherit;
    }
  `],
  template: `
    <button type="button" [style.font-size]="fontSize" class="btn btn-link" (click)="markFavorite()">
      <i class="fa" [class.fa-heart]="preference && preference.favorite"
         [class.fa-heart-o]="!preference || !preference.favorite"></i>
    </button>
  `
})
export class BazaarFavoriteComponent implements OnInit {

  @Input() idea: BazaarIdea | BazaarIdeaSlim;
  @Input() fontSize: string;

  public preference: BazaarPreference | BazaarPreferenceSlim;

  constructor(private bazaarPreferenceService: BazaarPreferenceService) {}

  ngOnInit(): void {
    this.preference = this.idea.preference;

    // subscribe to updates from other components
    this.bazaarPreferenceService.preferenceUpdates.subscribe(preference => {
      if (preference.ideaId === this.idea.id && preference.ideaType === this.idea.ideaType)
        this.preference = preference;
    });
  }

  markFavorite() {
    let obs: Observable<BazaarPreference>;
    let preference;
    if (this.preference) {
      preference = {
        ideaId: this.idea.id,
        agree: this.preference.agree,
        favorite: !this.preference.favorite
      };
    } else {
      preference = {
        ideaId: this.idea.id,
        agree: false,
        favorite: true
      };
    }

    if (this.idea instanceof BazaarLearn ||
      (this.idea.ideaType && this.idea.ideaType === 'learn'))
      obs = this.bazaarPreferenceService.upsertFlagsLearn(preference);
    else if (this.idea instanceof BazaarTeach ||
      (this.idea.ideaType && this.idea.ideaType === 'teach'))
      obs = this.bazaarPreferenceService.upsertFlagsTeach(preference);
    else if (this.idea instanceof BazaarEvent ||
      (this.idea.ideaType && this.idea.ideaType === 'event'))
      obs = this.bazaarPreferenceService.upsertFlagsEvent(preference);
    else if (this.idea instanceof BazaarResearch ||
      (this.idea.ideaType && this.idea.ideaType === 'research'))
      obs = this.bazaarPreferenceService.upsertFlagsResearch(preference);
    else
      return;

    obs.subscribe(pref => {
      this.preference = pref;
      this.bazaarPreferenceService.publishPreferenceUpdate(pref, this.idea.ideaType);
    });
  }

}
