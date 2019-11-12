import {InjectionToken, LOCALE_ID} from "@angular/core";
import {LANG_EN_VALUES} from "./langs/en";
import {LANG_IT_VALUES} from "./langs/it";

export const TRANSLATIONS = new InjectionToken('translations');

export const dictionary = {
  en: LANG_EN_VALUES,
  it: LANG_IT_VALUES
};

export function initialLocaleId() {
  return localStorage.getItem('localeId') || 'en';
}

export const TRANSLATION_PROVIDERS = [
  { provide: TRANSLATIONS, useValue: dictionary },
  { provide: LOCALE_ID, useFactory: initialLocaleId }
];
