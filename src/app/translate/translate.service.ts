import {Inject, Injectable} from "@angular/core";
import {TRANSLATIONS} from "./translations";


@Injectable()
export class TranslateService {
  private _currentLang: string;

  public get currentLang() {
    return this._currentLang;
  }

  // inject our translations
  constructor(@Inject(TRANSLATIONS) private _translations: any) { }

  public use(lang: string): void {
    // set current language
    this._currentLang = lang;
    if (localStorage.getItem('localeId') != lang) {
      localStorage.setItem('localeId', lang);
      // reloading is necessary because there is no known way to reload a provided object (`LOCALE_ID` in this case)
      location.reload(true);
    }
  }

  private translate(key: string): string {
    // private perform translation
    let translation = key;

    if (this._translations[this.currentLang] && this._translations[this.currentLang][key]) {
      return this._translations[this.currentLang][key];
    }

    return translation;
  }

  public instant(key: string, values?: { [key: string]: string }): string {
    // public perform translation
    let translation = this.translate(key);
    if (values) {
      for (let property in values) {
        if (values.hasOwnProperty(property)) {
          translation = translation.replace(`{{${property}}}`, values[property]);
        }
      }
    }
    return translation;
  }

}
