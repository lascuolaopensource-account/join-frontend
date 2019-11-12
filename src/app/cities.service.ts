import {Injectable} from "@angular/core";
import {ApiService, AuthService, Environment} from "@sos/sos-ui-shared";
import {Http} from "@angular/http";
import {Observable} from "rxjs/Observable";


@Injectable()
export class CitiesService extends ApiService {

  constructor(authService: AuthService, environment: Environment, private http: Http) {
    super(authService, environment)
  }

  search(term: string): Observable<string[]> {
    return this.http.get(`${this.backendUrl}/cities/${encodeURI(term)}`, this.options)
      .map(response => response.json().cities)
  }

}
