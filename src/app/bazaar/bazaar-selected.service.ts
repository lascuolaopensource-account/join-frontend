import {EventEmitter, Injectable} from "@angular/core";
import {BazaarIdea} from "@sos/sos-ui-shared";
import {Subscription} from "rxjs/Subscription";


@Injectable()
export class BazaarSelectedService {

  private selectedIdea: EventEmitter<BazaarIdea | null> = new EventEmitter<BazaarIdea | null>();

  subscribe(fn: (idea: BazaarIdea | null) => void): Subscription {
    return this.selectedIdea.subscribe(fn);
  }

  select(idea: BazaarIdea | null): void {
    this.selectedIdea.emit(idea);
  }

}
