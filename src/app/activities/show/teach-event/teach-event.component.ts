import {AfterViewInit, Component, ElementRef, Inject, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {
  ActivitiesService,
  ActivityEvent,
  ActivitySubscription,
  ActivityTeach,
  ActivityType,
  PaymentMethod,
  RecurringMeetings
} from "@sos/sos-ui-shared";
import {TranslateService, TranslateTitleService} from "../../../translate";
import {AbstractComponent} from "../../../abstract-component";
import * as braintree from "braintree-web";
import {SOS_CONFIG} from "../../../../sos.config";


declare const paypal: any;
declare const $: any;

type RouteData = {
  activity: ActivityTeach | ActivityEvent,
  token: string
}


@Component({
  selector: 'sos-activity-teach-event-show',
  templateUrl: './teach-event.component.html',
  styleUrls: ['./teach-event.component.scss']
})
export class ActivityTeachEventShowComponent extends AbstractComponent implements OnInit, AfterViewInit {

  public activity: ActivityTeach | ActivityEvent;
  public activityType: ActivityType;
  public outputDescription: string = null;
  public audienceString: string;
  public isRecurring: boolean;
  public hasSkills: boolean;
  public guestsTxt: string;
  public showPaymentOptions: boolean = false;
  public sendingPaypal: boolean = false;
  public showCreditCard: boolean = false;
  public disabledSubmitCredit: boolean = true;
  public showWireTransfer: boolean = false;
  public croModel: string;
  public disabledSubmitWire: boolean = false;
  public creditCardType: { type?: string, niceType?: string } = {};
  public canSubscribe: boolean;

  private paypalInstance = null;

  public creditCardAlerts: string[] = null;

  public showSubConfirmation: boolean = false;

  private braintreeClientToken: string;
  private hostedFieldsInstance: braintree.HostedFields = null;

  public contactLink: string;
  public contactLinkTxt: string;

  constructor(private route: ActivatedRoute,
              private titleService: TranslateTitleService,
              private element: ElementRef,
              private translateService: TranslateService,
              private activitiesService: ActivitiesService,
              @Inject(SOS_CONFIG) private sosConfig) {
    super();
  }

  ngOnInit() {
    this.route.data.subscribe((data: RouteData) => {
      this.activity = data.activity;
      this.braintreeClientToken = data.token;

      let translationH = { title: this.activity.title };
      let subject = this.translateService.instant(`activity.${this.activity.type}.contact.subject`, translationH);
      this.contactLink = (this.activity.type === 'teach' ? this.sosConfig.scholarshipLink : this.sosConfig.contactLink)
        + `?subject=${subject}`;

      if (this.activity.type === 'teach')
        this.outputDescription = (this.activity as ActivityTeach).outputDescription;

      this.activityType = this.activity.type;

      this.audienceString = this.activity.audience.map(a => {
        const t = this.translateEnum('audience', this.audienceTypes[a]);
        return this.translateService.instant(t).toLowerCase();
      }).join(', ');

      this.titleService.setTitle('activity.teachEvent.title', { title: this.activity.title });

      this.isRecurring = this.activity.schedule instanceof RecurringMeetings;

      this.hasSkills = (this.activity.requiredSkills && this.activity.requiredSkills.length > 0) ||
        (this.activity.acquiredSkills && this.activity.acquiredSkills.length > 0);

      this.guestsTxt = this.activityType === 'teach' ? 'activity.teachEvent.teachers' : 'activity.teachEvent.guests';

      this.disableSubscribeBtn;

      this.contactLinkTxt = `activity.${this.activity.type}.contact`;
    });
  }

  private initBraintree() {
    if (!this.braintreeClientToken || !this.activity.costs)
      return;

    braintree.client.create({ authorization: this.braintreeClientToken }, (clientErr, clientInstance) => {
      if (clientErr) {
        console.error('Error creating braintree client:', clientErr);
        return;
      }

      braintree.hostedFields.create({
        client: clientInstance,
        styles: {
          'input': {
            'font-size': '16px'
          }
        },
        fields: {
          number: {
            selector: '#card-number'
          },
          cvv: {
            selector: '#cvv'
          },
          expirationDate: {
            selector: '#expiration-date'
          }
        }
      }, (hostedFieldsErr, hostedFieldsInstance) => {
        if (hostedFieldsErr) {
          console.error('Error creating credit card hosted fields:', hostedFieldsErr);
          return;
        }

        hostedFieldsInstance.on('cardTypeChange', event => {
          if (event.cards && event.cards.length === 1) {
            this.creditCardType = event.cards[0];
          }
        });

        this.disabledSubmitCredit = false;
        this.hostedFieldsInstance = hostedFieldsInstance;
      });

      braintree.paypal.create({ client: clientInstance }, (paypalErr, paypalInstance) => {
        if (paypalErr) {
          console.error('Error creating paypal:', paypalErr);
          return;
        }
        this.paypalInstance = paypalInstance;
      });
    });
  }

  ngAfterViewInit(): void {
    $(this.element.nativeElement).find('.carousel').carousel();
    if (this.canSubscribe)
      this.initBraintree();
  }

  changeFavorite(evt: Event) {
    evt.preventDefault();
    const favorite = !this.activity.favorite;
    const obs = this.activityType === 'teach' ?
      this.activitiesService.favoriteTeach(this.activity.id, favorite) :
      this.activitiesService.favoriteEvent(this.activity.id, favorite);

    obs.subscribe(() => {
      this.activity.favorite = favorite;
    });
  }

  get disableSubscribeBtn(): boolean {
    const now = new Date;
    let deadline: Date = null;
    if (this.activity.deadline) {
      deadline = new Date(this.activity.deadline.toString());
      deadline.setDate(deadline.getDate() + 1);
    }


    this.canSubscribe = deadline != null && deadline > now && !this.activity.subscription;

    if (!this.activity.costs && !this.activity.payments) {
      return !this.canSubscribe;
    } else {
      return !(this.canSubscribe && this.paypalInstance);
    }
  }

  private afterSuccessfulSub(sub: ActivitySubscription) {
    this.activity.subscription = sub;
    this.showSubConfirmation = true;
    this.canSubscribe = false;
    this.showPaymentOptions = false;
    this.showWireTransfer = false;
    this.showCreditCard = false;
  }

  clickSubscribe() {
    if (this.activity.costs !== null) {
      this.showPaymentOptions = true;
      return;
    }

    this.getSubscribeObs().subscribe(
      activitySubscription => {
        this.afterSuccessfulSub(activitySubscription);
      },
      error => {
        console.error('failed to create subscription without payment', error);
      }
    );
  }

  clickShowCreditCard() {
    this.showCreditCard = true;
    this.showWireTransfer = false;
  }

  clickShowWireTransfer() {
    this.showWireTransfer = true;
    this.showCreditCard = false;
  }

  submitCreditCard(evt: Event) {
    evt.preventDefault();
    if (this.disabledSubmitCredit)
      return;

    this.creditCardAlerts = null;
    this.hostedFieldsInstance.tokenize({ vault: false }, (tokenizeErr, payload) => {
      if (tokenizeErr) {
        console.error('Failed to tokenize hosted fields:', tokenizeErr);
        if (tokenizeErr.details && tokenizeErr.details['invalidFieldKeys']) {
          this.creditCardAlerts = tokenizeErr.details['invalidFieldKeys']
            .map(k => `activities.teachEvent.credit.error.${k}`);
        } else {
          this.creditCardAlerts = ['activities.teachEvent.credit.error']
        }
        return;
      }

      const options = { paymentMethod: 'credit_card' as PaymentMethod, referenceId: payload.nonce };
      console.log('sending payment:', options);
      this.disabledSubmitCredit = true;
      this.getSubscribeObs(options).subscribe(
        activitySub => {
          this.afterSuccessfulSub(activitySub);
        },
        error => {
          console.error('failed to create subscription with credit card payment', error);
          this.disabledSubmitCredit = false;
        }
      );
    });
  }

  submitWireTransfer(evt: Event) {
    evt.preventDefault();
    if (this.disabledSubmitWire)
      return;

    const options = { paymentMethod: 'wire_transfer' as PaymentMethod, referenceId: this.croModel };
    console.log('sending payment:', options);
    this.disabledSubmitWire = true;
    this.getSubscribeObs(options).subscribe(
      activitySub => {
        this.afterSuccessfulSub(activitySub);
      },
      error => {
        console.error('failed to create subscription with wire payment', error);
        this.disabledSubmitWire = false;
      }
    );
  }

  clickPayPal() {
    if (!this.paypalInstance)
      return;

    this.sendingPaypal = true;
    this.paypalInstance.tokenize({
      flow: 'checkout',
      intent: 'sale',
      currency: 'EUR',
      amount: this.activity.costs
    }, (tokenizeErr, payload) => {
      if (tokenizeErr) {
        console.error('Failed to tokenize paypal payment:', tokenizeErr);
        this.sendingPaypal = false;
        return;
      }

      if (!payload || !payload.nonce) {
        console.warn('no payload or nonce was given');
        this.sendingPaypal = false;
        return;
      }

      const options = { paymentMethod: 'paypal' as PaymentMethod, referenceId: payload.nonce };
      console.log('sending payment:', options);
      this.getSubscribeObs(options).subscribe(
        activitySub => {
          this.activity.subscription = activitySub;
          this.showSubConfirmation = true;
        },
        error => {
          this.sendingPaypal = false;
          console.error('failed to create subscription with paypal payment', error);
        }
      );
    });
  }

  private getSubscribeObs(options: { paymentMethod: PaymentMethod, referenceId: string } = null) {
    const paymentInfo = options ? {
      paymentMethod: options.paymentMethod,
      amount: this.activity.costs,
      referenceId: options.referenceId
    } : null;

    return this.activity.type === 'event' ?
      this.activitiesService.subscribeEvent(this.activity.id, paymentInfo) :
      this.activitiesService.subscribeTeach(this.activity.id, paymentInfo);
  }

}
