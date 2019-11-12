import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs/Observable";
import {PaymentsService} from "./payments.service";


@Injectable()
export class PaymentClientTokenResolver implements Resolve<string> {

  constructor(private paymentsService: PaymentsService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<string> {
    return this.paymentsService.getClientToken();
  }

}
