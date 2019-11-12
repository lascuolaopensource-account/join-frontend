import {Injectable} from "@angular/core";
import {Title} from "@angular/platform-browser";
import {TranslateService} from "./translate.service";


@Injectable()
export class TranslateTitleService {

  constructor(private titleService: Title, private translateService: TranslateService) {}

  public setTitle(title: string, values?: { [key: string]: string }): void {
    this.titleService.setTitle(this.translateService.instant(title, values));
  }

}
