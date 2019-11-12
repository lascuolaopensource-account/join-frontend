import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {BazaarComment, BazaarCommentsService, BazaarPreference, IdeaType} from "@sos/sos-ui-shared";
import {BazaarPreferenceService} from "../../preference.service";
import {Observable} from "rxjs/Observable";
import {BazaarPostedCommentService} from "./posted-comment.service";


declare const $: any;

@Component({
  selector: 'sos-bazaar-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class BazaarCommentsComponent implements OnInit {

  public preference: BazaarPreference | null;
  public ideaId: number;
  public comments: BazaarComment[];
  public newComment: string;
  public commentError: string | null = null;
  public wishing: boolean = false;
  public queryParams: object;

  @ViewChild('commentsCard') private commentsCard: ElementRef;
  @ViewChild('formElm') private commentForm: ElementRef;
  private scrolled: boolean = false;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private bazaarPreferenceService: BazaarPreferenceService,
              private bazaarCommentsService: BazaarCommentsService,
              private postedCommentService: BazaarPostedCommentService) {}

  ngOnInit() {
    this.route.data.subscribe((data: { preference: BazaarPreference | null, comments: BazaarComment[] }) => {
      this.ideaId = parseInt(this.route.parent.snapshot.params['id']);
      this.preference = data.preference ? data.preference : this.newPreference();
      this.comments = data.comments;
    });

    this.route.queryParamMap.subscribe(params => {
      this.queryParams = {};
      params.keys.forEach(k => {
        if (k === 'wish')
          return;
        this.queryParams[k] = params.get(k);
      });

      this.wishing = params.has('wish');
      if (this.wishing) {
        this.preference = this.preference || this.newPreference();
        if (this.preference.wish && this.preference.wish.id !== 0) {
          // noinspection JSIgnoredPromiseFromCall
          this.router.navigate(['.'], { relativeTo: this.route, queryParams: this.queryParams });
        } else {
          this.preference.wish = new BazaarComment(0, 0, null, null, null, null);
          this.scrollTo(true);
        }
      } else {
        this.scrollTo();
      }
    });
  }

  private scrollTo(forceIt: boolean = false) {
    if (forceIt || !this.scrolled) {
      this.scrolled = true;
      const handler = window.setInterval(() => {
        try {
          if (this.wishing)
            this.commentForm.nativeElement.scrollIntoView();
          else
            this.commentsCard.nativeElement.scrollIntoView();
          if (window.document.body.scrollHeight - window.innerHeight > window.document.body.scrollTop)
            window.document.body.scrollTop -= 240; // this is the computed size of the whole header
          window.clearInterval(handler);
        } catch (e) {}
      }, 100);
    }
  }

  private newPreference(): BazaarPreference {
    return new BazaarPreference(0, this.ideaId, 0, false, null, false);
  }

  private get isLearn(): boolean { return this.router.url.indexOf('learn') !== -1 }
  private get isTeach(): boolean { return this.router.url.indexOf('teach') !== -1 }
  private get isEvent(): boolean { return this.router.url.indexOf('event') !== -1 }
  private get isResearch(): boolean { return this.router.url.indexOf('research') !== -1 }

  private get ideaType(): IdeaType {
    if (this.isLearn) return 'learn';
    else if (this.isTeach) return 'teach';
    else if (this.isEvent) return 'event';
    else if (this.isResearch) return 'research';
    else throw new Error(`cannot find idea type in url ${this.router.url}`);
  }

  private upsertWish(comment: string, cb: () => void): void {
    let obs;
    if (this.isLearn) {
      obs = this.bazaarPreferenceService.upsertWishLearn(this.ideaId, comment);
    } else if (this.isTeach) {
      obs = this.bazaarPreferenceService.upsertWishTeach(this.ideaId, comment);
    } else if (this.isEvent) {
      obs = this.bazaarPreferenceService.upsertWishEvent(this.ideaId, comment);
    } else if (this.isResearch) {
      obs = this.bazaarPreferenceService.upsertWishResearch(this.ideaId, comment);
    } else {
      throw new Error(`cannot find idea type in url ${this.router.url}`);
    }

    this.commentError = null;
    obs.subscribe(
      preference => {
        this.preference = preference;
        this.comments.push(preference.wish);
        this.bazaarPreferenceService.publishPreferenceUpdate(this.preference, this.ideaType);
        this.postedCommentService.posted(true);
        this.router.navigate(['./'], { relativeTo: this.route, queryParams: this.queryParams })
          .then(() => cb());
      },
      error => {
        console.error('error upserting wish', error);
        this.commentError = 'bazaar.comments.error';
        cb();
      }
    )
  }

  private createComment(): Observable<BazaarComment> {
    if (this.isLearn) {
      return this.bazaarCommentsService.createLearn(this.ideaId, this.newComment);
    } else if (this.isTeach) {
      return this.bazaarCommentsService.createTeach(this.ideaId, this.newComment);
    } else if (this.isEvent) {
      return this.bazaarCommentsService.createEvent(this.ideaId, this.newComment);
    } else if (this.isResearch) {
      return this.bazaarCommentsService.createResearch(this.ideaId, this.newComment);
    } else {
      throw new Error(`cannot find idea type in url ${this.router.url}`);
    }
  }

  submitComment() {
    if (this.wishing) {
      this.upsertWish(this.newComment, () => { this.newComment = null; });
      return;
    }

    const obs = this.createComment();
    if (!obs)
      return;

    this.commentError = null;
    obs.subscribe(
      comment => {
        this.comments.push(comment);
        this.newComment = null;
        this.postedCommentService.posted();
      },
      error => {
        console.error('error creating comment', error);
        this.commentError = 'bazaar.comments.error';
      }
    )
  }

  deleteComment(comment: BazaarComment, idx: number): void {
    if (this.preference.wish && this.preference.wish.id === comment.id) {
      this.bazaarPreferenceService.destroyWish(this.preference.id).subscribe(() => {
        this.comments.splice(idx, 1);
        this.preference.wish = null;
        this.bazaarPreferenceService.publishPreferenceUpdate(this.preference, this.ideaType);
        this.postedCommentService.removed(true);
      });
    } else {
      this.bazaarCommentsService.destroy(comment.id).subscribe(() => {
        this.comments.splice(idx, 1);
        this.postedCommentService.removed();
      });
    }
  }

}
