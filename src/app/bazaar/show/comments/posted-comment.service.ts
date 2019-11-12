import {EventEmitter, Injectable} from "@angular/core";


@Injectable()
export class BazaarPostedCommentService {

  public onPosted = new EventEmitter<boolean>();
  public onWished = new EventEmitter<boolean>();

  constructor() {}

  private publish(wish: boolean, value: boolean) {
    if (wish) this.onWished.emit(value);
    else this.onPosted.emit(value);
  }

  posted(wish: boolean = false) {
    this.publish(wish, true);
  }

  removed(wish: boolean = false) {
    this.publish(wish, false);
  }

}
