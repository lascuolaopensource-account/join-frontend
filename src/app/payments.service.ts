import {Injectable} from "@angular/core";
import {ApiService, AuthService, Environment} from "@sos/sos-ui-shared"
import {Http} from "@angular/http";
import {Observable} from "rxjs/Observable";


@Injectable()
export class PaymentsService extends ApiService {

  constructor(authService: AuthService, environment: Environment, private http: Http) {
    super(authService, environment)
  }

  public getClientToken(): Observable<string> {
    return this.http.get(`${this.backendUrl}/payments/token`, this.options)
      .map(response => response.json().token)
  }

}
