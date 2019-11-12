import {AbstractComponent} from "../../abstract-component";
import {BazaarIdea, IdeaType, User} from "@sos/sos-ui-shared";
import {OnDestroy, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {Alert} from "./alerts.component";
import {Observable} from "rxjs/Observable";
import * as _ from "lodash";
import {RootStyleService} from "../../root-style.service";
import {TranslateTitleService} from "../../translate";
import {NgForm} from "@angular/forms";


export abstract class BazaarAbstractPropose extends AbstractComponent
  implements OnInit, OnDestroy {

  public me: User;
  public idea: BazaarIdea;
  public alerts: Alert[] = [];
  public editing: boolean = false;
  public submitText: string;
  public showSavedComponent: boolean = false;
  public invalidTopics: boolean;

  @ViewChild(NgForm) proposeForm: NgForm;

  constructor(protected route: ActivatedRoute,
              protected router: Router,
              protected rootStyleService: RootStyleService,
              protected titleService: TranslateTitleService,
              protected ideaType: IdeaType) {
    super();
  }

  protected abstract setForEditing(): void

  ngOnInit() {
    this.titleService.setTitle(`bazaar.propose.${this.ideaType}.title`);

    this.rootStyleService.set({
      'background-color': '#12c8bb'
    });

    this.route.data.subscribe((data: { idea?: BazaarIdea, me: User }) => {
      this.me = data.me;
      if (data.idea) {
        // redirect if the user is not the creator
        if (data.idea.creator.id !== this.me.id)
          return this.router.navigate(['bazaar']);
        this.idea = data.idea;
        this.editing = true;
        this.submitText = 'bazaar.propose.update';
        this.setForEditing();
      } else {
        this.editing = false;
        this.submitText = 'bazaar.propose.create';
        this.idea.creator = this.me;
      }
    });
  }

  ngOnDestroy(): void {
    this.rootStyleService.set({ 'background-color': '' });
  }

  protected updateMultiEnumField(prop: string, value: string, checked: boolean) {
    if (checked) {
      this.idea[prop].push(value);
    } else {
      this.idea[prop] = this.idea[prop].filter(f => f !== value);
    }
  }

  protected isInvalid(): boolean {
    return this.proposeForm.invalid || this.invalidTopics;
  }

  protected abstract sendableIdea(): BazaarIdea | any
  protected abstract createIdea(idea: BazaarIdea): Observable<BazaarIdea>
  protected abstract updateIdea(idea: BazaarIdea): Observable<BazaarIdea>

  protected onSaved(): void {}

  submitIdea(event: Event) {
    event.preventDefault();

    if (this.isInvalid())
      return;

    this.alerts = [];
    const idea = this.sendableIdea();
    const observable = this.editing ? this.updateIdea(idea) : this.createIdea(idea);

    observable.subscribe(
      idea => {
        this.idea = idea;
        this.showSavedComponent = true;
        this.onSaved();
      },
      (error) => {
        const errors = error.json().errors;
        this.alerts = errors.map(e => {
          e.path = _.tail(e.path.split('.')).join('.');
          return e;
        });
      }
    );
  }

}
