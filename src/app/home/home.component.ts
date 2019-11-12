import {AfterViewInit, Component, OnInit} from "@angular/core";
import {
  ActivitiesService,
  ActivityEventSlim,
  ActivityResearchSlim,
  ActivityTeachSlim,
  BazaarIdea,
  BazaarIdeasService,
  Skill,
  SkillsService,
  User,
  UserService
} from "@sos/sos-ui-shared";
import {ActivatedRoute, Router} from "@angular/router";
import {TranslateTitleService} from "../translate";
import {Observable} from "rxjs/Observable";
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/forkJoin';
import {LoadingService} from "../loading.service";
import {isNumeric} from "rxjs/util/isNumeric";


declare const $: any;


type AnyActivity = ActivityResearchSlim & ActivityTeachSlim & ActivityEventSlim
type SearchSkill = { id: number, name: string }

class SearchModel {
  constructor(public value: string | null = null,
              public skills: SearchSkill[] | null = null,
              public matchAll: boolean = true) {}

  get validValue(): boolean {
    return this.value && this.value.length > 2;
  }
  get validSkills(): boolean {
    return this.skills && this.skills.length > 0;
  }
  get isValid(): boolean {
    return this.validValue || this.validSkills;
  }

  toQuery(): { search?: string } {
    let s = Object.create({});
    if (this.validValue)
      s.value = this.value;
    if (this.validSkills) {
      s.skills = this.skills;
      s.matchAll = this.matchAll;
    }

    if (s.value || s.skills)
      return { search: JSON.stringify(s) };
    else return {};
  }

  static fromQuery(s: string): SearchModel | null {
    try {
      let json = JSON.parse(s);
      let model = new SearchModel(
        json.value ? json.value : null,
        json.skills ? json.skills : null,
        json.matchAll ? json.matchAll : false);
      if (model.isValid)
        return model;
      else return null;
    } catch (e) {
      console.error('failed to parse json from search: "%s"', e.message);
      return null;
    }
  }
}

@Component({
  selector: 'sos-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {

  private url: string = './';

  public user: User;
  public showCompleteProfile: boolean;

  public search: SearchModel = new SearchModel();
  public foundUsers: User[];
  public foundIdeas: BazaarIdea[];
  public foundActivities: AnyActivity[];
  private foundSkills: { [name: string]: Skill } = {};
  public validSearch: boolean = false;
  public showNoResults: boolean = false;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private titleService: TranslateTitleService,
              private userService: UserService,
              private bazaarIdeasService: BazaarIdeasService,
              private activitiesService: ActivitiesService,
              private skillsService: SkillsService,
              private loadingService: LoadingService) {}

  ngOnInit() {
    this.titleService.setTitle('home.title');

    this.route.queryParamMap.subscribe(paramMap => {
      if (!paramMap.has('search'))
        return;

      let search = SearchModel.fromQuery(paramMap.get('search'));
      if (search === null) {
        // noinspection JSIgnoredPromiseFromCall
        this.router.navigate([this.url], { relativeTo: this.route });
        return;
      }

      this.search = search;
      this.validSearch = this.search.isValid;
      this.doSearch()
    });

    this.route.data.subscribe((data: { me: User }) => {
      this.user = data.me;
      this.showCompleteProfile = !this.user.bio || this.user.skills.length < 1 || !this.user.city;
    });
  }

  ngAfterViewInit(): void {
    $('#search-skill').tagEditor({
      delimiter: ',,',
      initialTags: this.search.skills ? this.search.skills.map(s => s.name) : [],
      autocomplete: {
        source: (req, res) => {
          if (!req.term || req.term.length < 3)
            res([]);
          else
            this.skillsService.search(req.term).subscribe(skills => {
              skills.forEach(skill => {
                this.foundSkills[skill.name] = skill;
              });
              res(skills.map(s => s.name));
            });
        }
      },
      beforeTagSave: (field, editor, tags, tag, val) => {
        if (tag)
          this.removeSkillFromSearch(tag);
        let fs = this.foundSkills[val];
        if (fs)
          this.addSkillToSearch(fs);
        else return false;
      },
      beforeTagDelete: (field, editor, tags, val) => {
        this.removeSkillFromSearch(val);
      }
    });
  }

  onRouterOutletActivate() {
    this.url = './welcome'
  }

  navigateSearch(event: Event) {
    event.preventDefault();
    // noinspection JSIgnoredPromiseFromCall
    this.router.navigate([this.url], {
      queryParams: this.search.toQuery(),
      relativeTo: this.route
    });
  }

  private doSearch() {
    if (!this.validSearch)
      return;

    let skills = this.search.validSkills ? this.search.skills.map(s => s.id) : null;
    let userObs = this.userService.search(this.search.value, skills, this.search.matchAll);

    let activitiesObs: Observable<AnyActivity[]> =
      this.activitiesService.all(null, this.search.value, skills, this.search.matchAll);

    let ideasObs = Observable.of(null);
    if (this.search.validValue) {
      ideasObs = this.bazaarIdeasService.search(this.search.value);
    }

    this.showNoResults = false;
    this.foundUsers = null;
    this.foundIdeas = null;
    this.foundActivities = null;

    this.loadingService.loading = true;
    Observable.forkJoin(userObs, ideasObs, activitiesObs).subscribe(data => {
      this.foundUsers = data[0].map(user => {
        user.skills = user.skills.filter(s => !s.request);
        return user;
      });

      if (!this.foundUsers || this.foundUsers.length < 1)
        this.showNoResults = true;

      this.foundIdeas = data[1];
      if (this.showNoResults)
        this.showNoResults = !this.foundIdeas || this.foundIdeas.length < 1;

      this.foundActivities = data[2];
      if (this.showNoResults)
        this.showNoResults = !this.foundActivities || this.foundActivities.length < 1;

      this.loadingService.loading = false;
    });
  }

  private addSkillToSearch(skill: Skill) {
    if (!this.search.skills)
      this.search.skills = [];
    if (this.search.skills.find(s => s.id === skill.id))
      return;
    this.search.skills.push({ id: skill.id, name: skill.name });
    this.validSearch = true;
  }

  setValidSearch() {
    this.validSearch = this.search.isValid;
  }

  private removeSkillFromSearch(idx: number | string) {
    if (!isNumeric(idx))
      idx = this.search.skills.map(s => s.name).indexOf(idx);
    this.search.skills.splice(idx, 1);
    this.setValidSearch();
  }

}
