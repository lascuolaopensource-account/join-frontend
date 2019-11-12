import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {FablabMachine, FablabReservation, FablabService} from '@sos/sos-ui-shared';


type RouteData = { reservations: FablabReservation[], machines: FablabMachine[] };

type EnhancedReservation = FablabReservation & {
  totalPrice: number,
  showDeletion: boolean
};


@Component({
  selector: 'sos-profile-reservations',
  templateUrl: './reservations.component.html'
})
export class ProfileReservationsComponent implements OnInit {

  public reservations: EnhancedReservation[];

  constructor(private route: ActivatedRoute,
              private router: Router,
              private fablabService: FablabService) {}

  ngOnInit() {
    this.route.data.subscribe((data: RouteData) => {
      this.reservations = data.reservations.map((r: EnhancedReservation) => {
        const machine = data.machines.find(m => m.id === r.machine.id);
        let p = machine.priceHour + (r.operator ? machine.operatorCost : 0);
        r.totalPrice = r.times.length * p;
        r.showDeletion = false;
        return r;
      });
    });
  }

  closeViaParent() {
    // noinspection JSIgnoredPromiseFromCall
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  askDeletion(idx: number, show: boolean) {
    this.reservations[idx].showDeletion = show;
  }

  deleteReservation(idx: number) {
    let r = this.reservations[idx];
    this.fablabService.deleteReservation(r.id).subscribe(
      () => {
        this.reservations.splice(idx, 1);
      }, error => {
        console.error('failed to delete reservation', error);
        r.showDeletion = false;
      });
  }

}
