import {AfterViewChecked, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {Skill, SkillsService, User, UserService} from "@sos/sos-ui-shared";
import {TranslateService, TranslateTitleService} from "../translate";
import * as _ from 'lodash';
import {NgForm} from "@angular/forms";
import {CitiesService} from "../cities.service";
import {Subject} from "rxjs/Subject";
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/filter';


declare const $: any;


@Component({
  selector: 'sos-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, AfterViewChecked, OnDestroy {

  public user: User;
  public profileUser: User;
  public isSelf: boolean;
  public favoriteText: string;
  public showingReservations: boolean;
  public editing: boolean = false;
  private tagEditorStarted: boolean = false;
  private foundSkills: { [name: string]: Skill } = {};
  public newSkills: { id: number, name: string }[];
  public showChangedEmailAlert: string | null = null;
  public searchCity$ = new Subject<string>();
  public searchCityKey$ = new Subject<number>();
  public foundCities: string[] = [];

  @ViewChild('profileForm') form: NgForm;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private userService: UserService,
              private titleService: TranslateTitleService,
              private skillService: SkillsService,
              private translateService: TranslateService,
              private citiesService: CitiesService) { }

  private updateFavoriteText() {
    if (this.profileUser.favorite !== null) {
      this.favoriteText = this.profileUser.favorite ?
        'profile.favorites.remove' : 'profile.favorites.add';
    }
  }

  private updateForEditing() {
    if (this.editing) {
      if (this.profileUser) {
        this.newSkills = this.profileUser.skills.map(s => {
          return { id: s.skillId, name: s.name };
        });
      }
    } else {
      this.user = _.cloneDeep(this.profileUser);
      this.newSkills = null;
    }
  }

  ngOnInit() {
    this.route.data.subscribe((data: { me: User, user: User, self: boolean }) => {
      this.user = data.me;
      this.profileUser = data.self ? _.cloneDeep(data.me) : data.user;
      this.isSelf = data.self;
      if (this.isSelf)
        this.titleService.setTitle('profile.title.me');
      else
        this.titleService.setTitle('profile.title', { user: this.profileUser.firstName + ' ' + this.profileUser.lastName });
      this.updateFavoriteText();

      // the following is required to that the SosAppComponent gets updated too
      this.userService.updateUser(this.user);

      this.updateForEditing();
    });

    this.route.queryParamMap.subscribe(paramMap => {
      this.editing = paramMap.has('edit');
      this.updateForEditing();
    });

    this.userService.userUpdated.subscribe(user => {
      this.user = user;
      if (this.profileUser.id === this.user.id)
        this.profileUser = user;
    });

    this.searchCity$
      .debounceTime(500)
      .distinctUntilChanged()
      .filter(term => term.length > 2)
      .switchMap(term => this.citiesService.search(term))
      .subscribe(cities => {
        this.foundCities = cities;
      });

    this.searchCityKey$.subscribe(key => {
      let focusedEl = $('#cities-dropdown :focus');
      switch (key) {
        case 40:  // arrow down
          focusedEl.next().focus();
          break;
        case 38:  // arrow up
          focusedEl.prev().focus();
          break;
        case 13:  // enter
          focusedEl.click();
          break;
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.editing) {
      if (this.tagEditorStarted)
        return;
      $('#search-skill').tagEditor({
        delimiter: ',,',
        placeholder: this.translateService.instant('profile.edit.skills'),
        initialTags: this.newSkills ? this.newSkills.map(s => s.name) : [],
        autocomplete: {
          source: (req, res) => {
            if (!req.term || req.term.length < 3)
              res([]);
            else
              this.skillService.search(req.term).subscribe(skills => {
                skills.forEach(skill => {
                  this.foundSkills[skill.name] = skill;
                });
                res(skills.map(s => s.name));
              });
          }
        },
        beforeTagSave: (field, editor, tags, tag, val) => {
          this.removeSkill(tag);
          this.addSkill(val);
        },
        beforeTagDelete: (field, editor, tags, val) => {
          this.removeSkill(val);
        }
      });
      this.tagEditorStarted = true;
    } else {
      this.tagEditorStarted = false
    }
  }

  ngOnDestroy(): void {
    $('#search-skill').tagEditor('destroy');
  }

  favorite() {
    this.userService.favorite(this.profileUser.id, !this.profileUser.favorite).subscribe(favorite => {
      this.profileUser.favorite = favorite;
      this.updateFavoriteText();
    });
  }

  reservationsOutletChange(active: boolean) {
    this.showingReservations = active;
  }

  toggleEditing() {
    let qp = this.editing ? {} : { edit: true };
    if (this.editing)
      $('#search-skill').tagEditor('destroy');
    // noinspection JSIgnoredPromiseFromCall
    this.router.navigate(['.'], { queryParams: qp, relativeTo: this.route });
  }

  private addSkill(name: string) {
    if (!name) return;
    let skill = this.foundSkills[name];
    let s = skill ? { id: skill.id, name: skill.name } : { id: 0, name: name };
    this.newSkills.push(s);
  }

  private removeSkill(name: string) {
    if (!name) return;
    let index = this.newSkills.map(s => s.name).indexOf(name);
    if (index !== -1)
      this.newSkills.splice(index, 1);
  }

  saveProfile() {
    if (!this.isSelf || this.form.invalid)
      return;

    let changedSkills = false;
    let skillNames = this.newSkills.map(s => s.name).sort();
    let oldSkillNames = this.profileUser.skills.map(s => s.name).sort();
    if (skillNames.length === oldSkillNames.length) {
      for (let i = 0; i < this.profileUser.skills.length; i++) {
        if (skillNames[i] != oldSkillNames[i]) {
          changedSkills = true;
          break;
        }
      }
    } else {
      changedSkills = true;
    }

    let changedCity = this.profileUser.city !== this.user.city;

    if (this.form.untouched && !changedSkills && !changedCity) {
      this.toggleEditing();
      return;
    }

    if (this.user.city && !this.user.city.city)
      this.user.city.city = null;

    const newEmail = this.user.email;
    this.userService.update(this.user, this.newSkills).subscribe(user => {
      this.profileUser = user;
      this.showChangedEmailAlert = this.profileUser.email !== newEmail ? newEmail : null;
      this.toggleEditing();
    });
  }

}
