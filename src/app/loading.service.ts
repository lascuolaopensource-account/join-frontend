import {Injectable} from '@angular/core';


@Injectable()
export class LoadingService {

  public loading: boolean;

  constructor() {
    this.loading = false;
  }

}
