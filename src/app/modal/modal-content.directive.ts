import {Directive, ViewContainerRef} from '@angular/core';


@Directive({
  selector: '[sos-modal-content]'
})
export class ModalContentDirective {

  constructor(public viewContainerRef: ViewContainerRef) {}

}
