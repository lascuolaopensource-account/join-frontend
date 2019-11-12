import {Component, Inject, OnInit} from "@angular/core";
import {Language, User, UserService} from "@sos/sos-ui-shared";
import {TranslateService} from "./translate";
import {NavigationEnd, NavigationStart, Router} from "@angular/router";
import {LoadingService} from "./loading.service";
import {ModalService} from "./modal/modal.service";
import {RootStyleService} from "./root-style.service";
import {DOCUMENT} from "@angular/common";


@Component({
  selector: 'sos-app',
  templateUrl: './sos.component.html'
})
export class SosAppComponent implements OnInit {

  supportedLanguages = [
    new Language("en"),
    new Language("it")
  ];

  selectedLanguageId: number;
  user: User;

  rootStyle: object;


  constructor(private translateService: TranslateService,
              private userService: UserService,
              private router: Router,
              private loadingService: LoadingService,
              private modalService: ModalService,
              private rootStyleService: RootStyleService,
              @Inject(DOCUMENT) private document: Document) {

    this.supportedLanguages.forEach((l, i) => {
      if (l.code === localStorage.getItem('localeId')) {
        this.selectedLanguageId = i;
      }
    });

    this.userService.userUpdated.subscribe(user => {
      this.user = user;
      this.selectedLanguageId = this.getLanguageId(user.preferredLang);
      this.translateService.use(this.selectedLanguage.code)
    });

    if (!this.selectedLanguageId)
      this.selectedLanguageId = 0;
    this.translateService.use(this.selectedLanguage.code);
  }

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loadingService.loading = true;
      } else if (event instanceof NavigationEnd) {
        this.loadingService.loading = false;
        this.modalService.showModal(false);
      }
    });

    this.rootStyleService.onUpdate.subscribe(value => {
      this.rootStyle = value;
      let keys = Object.keys(value);
      for (let i = 0; i < keys.length; i++) {
        let k = keys[i];
        if (value.hasOwnProperty(k))
          this.document.body.style[k] = value[k];
      }
    });
  }

  changeLanguage(index: number) {
    const old_lang = this.selectedLanguageId;

    if (index < 0 || index >= this.supportedLanguages.length)
      return;
    this.selectedLanguageId = index;

    if (this.user) {
      this.user.preferredLang = this.selectedLanguage;
      this.userService.update(this.user).subscribe(() => {}, () => {
        this.selectedLanguageId = old_lang;
      });
    } else {
      this.translateService.use(this.selectedLanguage.code);
    }
  }

  private get selectedLanguage(): Language {
    return this.supportedLanguages[this.selectedLanguageId];
  }

  private getLanguageId(lang: Language): number {
    for (let i = 0; i < this.supportedLanguages.length; i++) {
      if (this.supportedLanguages[i].code == lang.code)
        return i;
    }
    return -1;
  }

}
