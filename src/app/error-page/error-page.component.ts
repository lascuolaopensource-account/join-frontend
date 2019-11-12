import {AfterViewInit, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {DOCUMENT} from "@angular/common";
import {TranslateTitleService} from "../translate";
import {ActivatedRoute} from "@angular/router";


@Component({
  selector: 'sos-error-page',
  templateUrl: './error-page.component.html'
})
export class ErrorPageComponent implements OnInit, AfterViewInit, OnDestroy {

  public code: number;

  constructor(@Inject(DOCUMENT) private document: Document,
              private titleService: TranslateTitleService,
              private route: ActivatedRoute) {}

  private get htmlElement() {
    return this.document.getElementsByTagName('html')[0];
  }

  ngOnInit(): void {
    this.titleService.setTitle('errorPage.title');
    this.route.paramMap.subscribe(paramMap => {
      this.code = parseInt(paramMap.get('code'));
    });
  }

  ngAfterViewInit(): void {
    this.htmlElement.setAttribute('class', 'error-page');
  }

  ngOnDestroy(): void {
    this.htmlElement.removeAttribute('class');
  }

}
