import {AfterViewChecked, Component} from "@angular/core";
import {BazaarAbstractPropose} from "../abstract-propose";
import {ActivatedRoute, Router} from "@angular/router";
import {
  BazaarIdea,
  BazaarIdeasService,
  BazaarResearch,
  BazaarResearchRole,
  Skill,
  SkillsService
} from "@sos/sos-ui-shared";
import {Observable} from "rxjs/Observable";
import * as _ from "lodash";
import {RootStyleService} from "../../../root-style.service";
import {TranslateTitleService} from "../../../translate";


declare const $: any;


@Component({
  selector: 'sos-bazaar-propose-research',
  templateUrl: './research.component.html',
  styleUrls: ['../propose.scss']
})
export class BazaarProposeResearchComponent extends BazaarAbstractPropose implements AfterViewChecked {

  public idea: BazaarResearch = new BazaarResearch(
    0, null, null, [], null, null, null, null, [], null, null, null, null, null);

  public deadlineDate: Date;

  private foundSkills: { [name: string]: Skill } = {};

  private savedSkills: { [key: number]: number[] } = {};

  public invalidPositions: boolean = false;
  public invalidPositionsS: boolean[] = [];
  public invalidPositionsL: boolean = false;

  private activePositionTagEditors: boolean[] = [];

  constructor(route: ActivatedRoute,
              router: Router,
              private bazaarIdeasService: BazaarIdeasService,
              private skillsService: SkillsService,
              rootStyleService: RootStyleService,
              titleService: TranslateTitleService) {
    super(route, router, rootStyleService, titleService, 'research');
  }

  private updateInvalidPositions() {
    this.invalidPositionsL = this.idea.positions.filter(p => !p._delete).length === 0;
    this.invalidPositions = this.invalidPositionsL ||
      this.invalidPositionsS.indexOf(true) !== -1;
  }

  private static isPositionInvalid(p: BazaarResearchRole): boolean {
    return !p._delete && p.skills.filter(s => !s._delete).length === 0;
  }

  ngOnInit() {
    super.ngOnInit();
    if (!this.idea.createdAt)
      this.idea.createdAt = new Date();
  }

  private makeTagEditor(posIdx: number) {
    $(`#field-skill-${posIdx}`).tagEditor({
      initialTags: this.idea.positions[posIdx].skills.map(s => s.name),
      delimiter: ',,',
      autocomplete: {
        source: (req, res) => {
          if (!req.term || req.term.length < 3)
            res([]);
          else
            this.skillsService.search(req.term, true).subscribe(skills => {
              skills.forEach(skill => {
                this.foundSkills[skill.name] = skill;
              });
              res(skills.map(s => s.name));
            });
        }
      },
      beforeTagSave: (field, editor, tags, tag, val) => {
        this.deleteSkill(posIdx, tag);
        this.addSkill(posIdx, val);
      },
      beforeTagDelete: (field, editor, tags, val) => {
        this.deleteSkill(posIdx, val);
      }
    });
  }

  ngAfterViewChecked(): void {
    for (let i = 0; i < this.activePositionTagEditors.length; i++) {
      if (!this.activePositionTagEditors[i] && !this.showSavedComponent) {
        this.makeTagEditor(i);
        this.activePositionTagEditors[i] = true;
      }
    }
  }

  protected setForEditing(): void {
    this.deadlineDate = new Date(this.idea.createdAt);
    this.deadlineDate.setDate(this.deadlineDate.getDate() + this.idea.deadline);

    this.idea.positions.forEach(position => {
      this.savedSkills[position.id] = position.skills.map(s => s.id);
    });

    this.invalidPositionsS = this.idea.positions.map(BazaarProposeResearchComponent.isPositionInvalid);
    this.updateInvalidPositions();

    this.activePositionTagEditors = this.idea.positions.map(() => false);
  }

  updateDeadline(date: string) {
    this.deadlineDate = new Date(date);
    this.idea.deadline = Math.ceil((this.deadlineDate.getTime() - this.idea.createdAt.getTime()) / (1000 * 3600 * 24));
  }

  protected isInvalid(): boolean {
    return super.isInvalid() || this.invalidPositions;
  }

  protected sendableIdea(): BazaarIdea {
    const idea = this.idea.asJson;
    delete idea['creator'];
    return idea;
  }

  protected createIdea(idea: BazaarIdea): Observable<BazaarIdea> {
    return this.bazaarIdeasService.createResearch(idea);
  }

  protected updateIdea(idea: BazaarIdea): Observable<BazaarIdea> {
    return this.bazaarIdeasService.updateResearch(idea);
  }

  addPosition() {
    this.idea.positions.push(new BazaarResearchRole(0, null, []));
    this.invalidPositions = true;
    this.invalidPositionsL = false;
    this.invalidPositionsS.push(true);
    this.activePositionTagEditors.push(false);
  }

  removePosition(idx: number) {
    if (this.idea.positions[idx].id === 0) {
      this.idea.positions.splice(idx, 1);
      this.invalidPositionsS.splice(idx, 1);
      this.activePositionTagEditors.splice(idx, 1);
    } else {
      this.idea.positions[idx]._delete = true;
      this.invalidPositionsS[idx] = false;
      this.activePositionTagEditors[idx] = true;
    }

    $(`#field-skill-${idx}`).tagEditor('destroy');

    this.updateInvalidPositions();
  }

  private addSkill(posIdx: number, skillName: string) {
    if (!skillName) return;

    let skill = this.foundSkills[skillName] || new Skill(0, skillName);
    let position = this.idea.positions[posIdx];

    // avoid sending duplicates if re-adding a skill that was previously _delete'd
    if (this.editing && _.includes(position.skills.filter(s => s._delete).map(s => s.name), skill.name)) {
      position.skills.forEach(s => {
        if (s.name === skill.name)
          s._delete = false;
      });
      return;
    }

    position.skills.push(skill);

    this.invalidPositionsS[posIdx] = false;
    this.updateInvalidPositions();
  }

  private deleteSkill(posIdx: number, skillName: string) {
    if (!skillName) return;
    let skillIdx = this.idea.positions[posIdx].skills.map(s => s.name).indexOf(skillName);
    if (skillIdx === -1) return;
    const skill = this.idea.positions[posIdx].skills[skillIdx];
    if (skill.id === 0 || (this.editing && !_.includes(this.savedSkills[this.idea.positions[posIdx].id], skill.id))) {
      this.idea.positions[posIdx].skills.splice(skillIdx, 1);
    } else {
      this.idea.positions[posIdx].skills[skillIdx]._delete = true
    }

    this.invalidPositionsS[posIdx] = BazaarProposeResearchComponent.isPositionInvalid(this.idea.positions[posIdx]);
    this.updateInvalidPositions();
  }

  protected onSaved(): void {
    super.onSaved();
    for (let i = 0; i < this.activePositionTagEditors.length; i++) {
      if (this.activePositionTagEditors[i]) {
        $(`#field-skill-${i}`).tagEditor('destroy');
        this.activePositionTagEditors[i] = false;
      }
    }
  }

}
