import {ChangeDetectorRef, Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {BazaarIdeaFramework, BazaarIdeaSlim, IdeaType, User, UserService} from "@sos/sos-ui-shared";
import {AbstractComponent} from "../abstract-component";
import * as _ from "lodash";
import {BazaarSelectedService} from "./bazaar-selected.service";
import {Subscription} from "rxjs/Subscription";
import {BazaarPreferenceService} from "./preference.service";
import {TranslateTitleService} from "../translate";
import {ModalService} from "../modal/modal.service";
import {BazaarProposeModalComponent} from "./propose-modal.component";


type FrameworkFilter = {
  selected: boolean,
  translation: string,
  value: BazaarIdeaFramework,
  param: string,
  validIdea?: (IdeaType) => boolean,
  filterClass: string
}

type Direction = 'asc' | 'desc'

type Sorter = {
  direction: Direction | null,
  translation: string,
  param: string,
  test: (i1: BazaarIdeaSlim, i2: BazaarIdeaSlim, d: Direction) => number
}

type ProgressStyle = { width: string, background: string }

@Component({
  selector: 'sos-bazaar',
  templateUrl: './bazaar.component.html',
  styleUrls: ['./bazaar.component.scss']
})
export class BazaarComponent extends AbstractComponent implements OnInit, OnDestroy {

  public user: User;
  public bazaarIdeas: BazaarIdeaSlim[];
  public filteredIdeas: BazaarIdeaSlim[];
  public frameworksFilter: FrameworkFilter[];
  public selectedIdeaIndex: number | null = null;
  public showingMines: boolean;
  public sorters: Sorter[];
  public maxScore: number;
  public progressStyles: { [t: string]: { [id: number]: ProgressStyle } } = {};

  private ideaSubscription: Subscription;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private userService: UserService,
              private selectedIdeaService: BazaarSelectedService,
              private cdRef: ChangeDetectorRef,
              private bazaarPreferenceService: BazaarPreferenceService,
              private titleService: TranslateTitleService,
              private modalService: ModalService) {
    super();

    this.frameworksFilter = [
      {
        selected: false,
        translation: 'bazaar.filters.framework.teaching_framework',
        value: BazaarIdeaFramework.TeachingFramework,
        param: 'teaching',
        validIdea: (ideaType) => ideaType === 'teach' || ideaType === 'learn',
        filterClass: 'filter-teach'
      }, {
        selected: false,
        translation: 'bazaar.filters.framework.research_framework',
        value: BazaarIdeaFramework.ResearchFramework,
        param: 'research',
        validIdea: (ideaType) => ideaType === 'research',
        filterClass: 'filter-research'
      }, {
        selected: false,
        translation: 'bazaar.filters.framework.entertainment_framework',
        value: BazaarIdeaFramework.EntertainmentFramework,
        param: 'event',
        validIdea: (ideaType) => ideaType === 'event',
        filterClass: 'filter-event'
      }, {
        selected: true,
        translation: 'bazaar.filters.framework.all',
        value: null,
        param: null,
        filterClass: ''
      }
    ];

    this.sorters = [
      {
        direction: null,
        translation: 'bazaar.sort.score',
        param: 'score',
        test: (ideaA, ideaB, direction) =>
          direction === 'desc' ?
            (ideaA.score > ideaB.score ? -1 : (ideaA.score < ideaB.score ? 1 : 0)) :
            (ideaA.score < ideaB.score ? -1 : (ideaA.score > ideaB.score ? 1 : 0))
      }, {
        direction: null,
        translation: 'bazaar.sort.date',
        param: 'date',
        test: (ideaA, ideaB, direction) =>
          direction === 'desc' ?
            (ideaA.createdAt > ideaB.createdAt ? -1 : (ideaA.createdAt < ideaB.createdAt ? 1 : 0)) :
            (ideaA.createdAt < ideaB.createdAt ? -1 : (ideaA.createdAt > ideaB.createdAt ? 1 : 0))
      }, {
        direction: null,
        translation: 'bazaar.sort.alpha',
        param: 'alpha',
        test: (ideaA, ideaB, direction) => {
          let c = ideaA.title.localeCompare(ideaB.title);
          return direction === 'asc' ? c : (c < 0 ? 1 : (c > 0 ? -1 : 0));
        }
      }
    ];
  }

  private setAllFrameworkFilter(selected: boolean) {
    this.frameworksFilter[this.frameworksFilter.length - 1].selected = selected;
  }

  showProposeModal() {
    this.modalService.selectComponent(BazaarProposeModalComponent);
    this.modalService.showModal(true);
  }

  ngOnInit() {
    this.titleService.setTitle('bazaar.title');

    this.route.data.subscribe((data: { me: User, bazaarIdeas: BazaarIdeaSlim[] }) => {
      this.user = data.me;
      this.userService.updateUser(this.user);
      this.bazaarIdeas = data.bazaarIdeas;
      this.filteredIdeas = _.cloneDeep(this.bazaarIdeas);
    });

    this.route.queryParamMap.subscribe(queryParamMap => {
      if (queryParamMap.has('propose'))
        this.showProposeModal();

      this.showingMines = queryParamMap.has('mines');
      let allFrameworks = true;
      this.frameworksFilter.forEach(filter => {
        if (filter.value !== null) {
          filter.selected = queryParamMap.has(filter.param);
          allFrameworks = allFrameworks && !filter.selected;
        }
      });

      let noSorter = true;
      this.sorters.forEach(sorter => {
        if (queryParamMap.has(sorter.param)) {
          let v = queryParamMap.get(sorter.param);
          if (v === 'asc' || v === 'desc') {
            sorter.direction = v;
            noSorter = false;
          }
        }
      });

      if (noSorter)
        this.sorters[0].direction = 'desc';

      this.filterIdeas(allFrameworks);
    });

    this.ideaSubscription = this.selectedIdeaService.subscribe(selectedIdea => {
      if (selectedIdea === null) {
        this.selectedIdeaIndex = null;
      } else {
        this.selectedIdeaIndex = _.findIndex(this.filteredIdeas, idea => {
          return idea.id === selectedIdea.id && idea.ideaType === selectedIdea.ideaType;
        });
      }
      // send user to child
      this.userService.updateUser(this.user);
      // detect changes caused by child component
      this.cdRef.detectChanges();
    });

    this.bazaarPreferenceService.preferenceUpdates.subscribe(preference => {
      this.bazaarIdeas.forEach(idea => {
        if (preference.ideaId === idea.id && preference.ideaType === idea.ideaType)
          idea.preference = preference;
      });
    });
  }

  ngOnDestroy() {
    this.ideaSubscription.unsubscribe();
  }

  private filterIdeas(allFrameworks: boolean) {
    this.setAllFrameworkFilter(allFrameworks);
    this.filteredIdeas = _.cloneDeep(this.bazaarIdeas);

    if (!allFrameworks) {
      let selectedF = this.frameworksFilter.filter(f => f.selected);
      this.filteredIdeas = this.filteredIdeas.filter(idea => {
        for (let i = 0; i < selectedF.length; i++) {
          if (selectedF[i].validIdea && selectedF[i].validIdea(idea.ideaType))
            return true;
        }
        return false;
      });
    }

    let selectedS = this.sorters.find(s => s.direction !== null);
    if (selectedS) {
      this.filteredIdeas.sort((a, b) => selectedS.test(a, b, selectedS.direction));
    }

    this.maxScore = 0;
    this.filteredIdeas.forEach(idea => {
      if (idea.score > this.maxScore)
        this.maxScore = idea.score;
    });

    this.progressStyles = {};
    this.bazaarIdeas.forEach(idea => {
      if (!this.progressStyles[idea.ideaType])
        this.progressStyles[idea.ideaType] = {};
      this.progressStyles[idea.ideaType][idea.id] = this.progressStyle(idea.score, idea.ideaType);
    });
  }

  private static scale(x: number, a: number, b: number): number {
    return Math.floor((((b - a) * x) / 100) + a)
  }

  private progressStyle(score: number, ideaType: IdeaType): ProgressStyle {
    let p = (score * 100) / this.maxScore;
    let p2 = BazaarComponent.scale(p, 0, 50);
    let [c, s] = ideaType === 'teach' || ideaType === 'learn' ? ['176', '55']
      : ideaType === 'research' ? ['303', '75'] : ['51', '100'];
    return {
      width: `${p}%`,
      background: `linear-gradient(to right, hsl(0, 100%, 100%), hsl(${c}, ${s}%, ${100-p2}%))`
    };
  }

  selectFramework(selectedFilter: FrameworkFilter) {
    if (selectedFilter.value === null) {
      this.frameworksFilter.forEach(filter => {
        filter.selected = filter.value === null;
      });
    } else {
      selectedFilter.selected = !selectedFilter.selected;
      this.setAllFrameworkFilter(false);
    }
    this.updateFilters();
  }

  get queryParams() {
    let qp = {};

    if (this.showingMines)
      qp['mines'] = true;

    this.frameworksFilter.forEach(filter => {
      if (filter.value !== null && filter.selected)
        qp[filter.param] = true;
    });

    this.sorters.forEach(s => {
      if (s.direction !== null)
        qp[s.param] = s.direction;
    });

    return qp;
  }

  private updateFilters() {
    // noinspection JSIgnoredPromiseFromCall
    this.router.navigate(['./'], { relativeTo: this.route, queryParams: this.queryParams });
  }

  showMinesOnly() {
    this.showingMines = true;
    this.updateFilters();
  }

  showAll() {
    this.showingMines = false;
    this.updateFilters();
  }

  selectSorter(sorter: Sorter, idx: number) {
    switch (sorter.direction) {
      case 'asc':
        sorter.direction = 'desc';
        break;
      case 'desc':
        sorter.direction = 'asc';
        break;
      default:
        sorter.direction = 'desc';
    }

    this.sorters.forEach((s, i) => {
      if (i === idx)
        return;
      s.direction = null;
    });

    this.updateFilters();
  }

}
