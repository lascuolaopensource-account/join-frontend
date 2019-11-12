import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {AuthService, Environment, Language, User} from "@sos/sos-ui-shared";
import {NavigationStart, Router} from "@angular/router";
import {RootStyleService} from "../root-style.service";


declare const $: any;

const FONT_FEATS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];


function getDifferentRandom(prev: number, max: number): number {
  let i;
  do {
    i = Math.floor(Math.random() * max);
  } while (i === prev);
  return i;
}

@Component({
  selector: 'sos-header',
  templateUrl: 'header.component.html',
  styleUrls: [ 'header.component.scss' ]
})
export class HeaderComponent implements AfterViewInit, OnInit {

  @Input() user: User;
  @Input() supportedLanguages: Language[];
  @Input() selectedLanguageId: number;
  @Output() onLangChanged = new EventEmitter<number>();

  public logoutUrl: string;
  public rootStyle: object;
  public applyRootStyle: boolean = false;
  public rulesUrl: string;

  constructor(private authService: AuthService,
              private router: Router,
              private rootStyleService: RootStyleService,
              private environment: Environment) {
    this.logoutUrl = authService.logoutUrl;
    this.rulesUrl = environment.rulesUrl;
  }

  get showLogin() {
    return this.authService.showLogin;
  }

  clickLogin(evt: Event) {
    evt.preventDefault();
    this.authService.showLoginEmitter.emit();
  }

  ngOnInit() {
    const N_LETTERS = 'SOS'.length;
    let oldRandoms = [0, 0, 0];
    window.setInterval(() => {
      for (let i = 0; i < N_LETTERS; i++) {
        let r = getDifferentRandom(oldRandoms[i], FONT_FEATS.length);
        $(`.navbar-brand > span:nth-of-type(${i+1})`).attr('class', 'font-feat-' + FONT_FEATS[r]);
        oldRandoms[i] = r;
      }
    }, 300);

    this.rootStyleService.onUpdate.subscribe(value => {
      this.rootStyle = value;
      this.applyRootStyle = Object.keys(this.rootStyle).length > 0;
    });
  }

  ngAfterViewInit() {
    let elem = $('#main-navbar');

    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        elem.collapse('hide');
      }
    });

    elem.on('show.bs.collapse', () => {
      $('body').css('overflow', 'hidden');
    });
    elem.on('hidden.bs.collapse', () => {
      $('body').css('overflow', 'auto');
    });
  }

  changeLanguage(languageId: number) {
    this.onLangChanged.emit(languageId);
  }

  doLogout(event: Event) {
    event.preventDefault();
    this.authService.removeToken();
    document.forms['logout-form'].submit();
  }

}
