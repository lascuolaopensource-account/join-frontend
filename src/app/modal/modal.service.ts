import {EventEmitter, Injectable, Type} from '@angular/core';


@Injectable()
export class ModalService {

  public showModalChanges = new EventEmitter<boolean>();
  public componentChanges = new EventEmitter<Type<any>>();

  constructor() {}

  selectComponent(component: Type<any>) {
    this.componentChanges.emit(component);
  }

  showModal(show: boolean) {
    this.showModalChanges.emit(show);
  }

}
