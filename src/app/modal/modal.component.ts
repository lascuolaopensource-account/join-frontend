import {Component, ComponentFactoryResolver, OnInit, Type, ViewChild} from '@angular/core';
import {ModalContentDirective} from "./modal-content.directive";
import {ModalService} from "./modal.service";


declare const $: any;

@Component({
  selector: 'sos-modal',
  template: `
    <div class="modal fade" id="sos-modal" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-body">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true" class="sos-icon large skull"></span>
            </button>
            <ng-template sos-modal-content></ng-template>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {

  @ViewChild(ModalContentDirective) sosModalContent;

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
              private modalService: ModalService) {}

  ngOnInit(): void {
    this.modalService.componentChanges.subscribe(component => {
      this.setComponent(component);
    });

    this.modalService.showModalChanges.subscribe(showModal => {
      // noinspection TypeScriptUnresolvedFunction
      $('#sos-modal').modal(showModal ? 'show' : 'hide');
    });
  }

  private setComponent(component: Type<any>) {
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
    let viewContainerRef = this.sosModalContent.viewContainerRef;
    viewContainerRef.clear();
    viewContainerRef.createComponent(componentFactory);
  }

}
