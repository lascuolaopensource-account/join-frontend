import {EventEmitter, Injectable} from '@angular/core';


@Injectable()
export class RootStyleService {

  public onUpdate = new EventEmitter<object>();

  constructor() {}

  set(value: object) {
    this.onUpdate.emit(value);
  }

}
