import {AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from "@angular/core";
import {Topic, TopicsService} from "@sos/sos-ui-shared";


declare const $: any;


@Component({
  selector: 'sos-bazaar-propose-topics',
  templateUrl: './topics.component.html',
  styleUrls: ['../propose.scss']
})
export class TopicsComponent implements OnChanges, AfterViewInit {

  @Input() topics: Topic[];
  @Input() editing: boolean;
  @Output() onInvalidUpdated = new EventEmitter<boolean>();

  private foundTopics: { [name: string]: Topic } = {};
  public invalidModel: boolean;

  constructor(private topicsService: TopicsService) {}

  ngAfterViewInit(): void {
    $('#idea-topic-search').tagEditor({
      initialTags: this.topics.map(t => t.topic),
      delimiter: ',,',
      autocomplete: {
        source: (req, res) => {
          if (!req.term || req.term.length < 3)
            res([]);
          else
            this.topicsService.search(req.term).subscribe(topics => {
              topics.forEach(topic => {
                this.foundTopics[topic.topic] = topic;
              });
              res(topics.map(t => t.topic));
            });
        }
      },
      beforeTagSave: (field, editor, tags, tag, val) => {
        this.removeTopic(tag);
        this.addTopic(val);
      },
      beforeTagDelete: (field, editor, tags, val) => {
        this.removeTopic(val);
      }
    });
  }

  private static validTopics(topics: Topic[]): boolean {
    return topics.filter(t => !t._delete).length === 0;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.topics)
      return;

    this.invalidModel = TopicsComponent.validTopics(changes.topics.currentValue);
    this.onInvalidUpdated.emit(this.invalidModel);
  }

  private addTopic(topic: string) {
    if (!topic) return;
    this.topics.push(this.foundTopics[topic] || new Topic(0, topic));
    this.invalidModel = false;
    this.onInvalidUpdated.emit(this.invalidModel);
  }

  private removeTopic(topic: string) {
    if (!topic) return;
    let index = this.topics.map(t => t.topic).indexOf(topic);
    if (index === -1) return;
    if (this.editing && this.topics[index].id !== 0) {
      this.topics[index]._delete = true;
    } else {
      this.topics.splice(index, 1);
    }

    this.invalidModel = TopicsComponent.validTopics(this.topics);
    this.onInvalidUpdated.emit(this.invalidModel);
  }

}
