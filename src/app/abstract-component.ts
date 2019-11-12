import {
  Activity,
  ActivityEvent,
  ActivitySlim,
  ActivityTeach,
  BazaarEvent,
  BazaarIdea,
  BazaarIdeaFramework,
  BazaarLearn,
  BazaarResearch,
  BazaarTeach,
  EnumHelpersService,
  PaymentMethod
} from '@sos/sos-ui-shared';
import * as _ from "lodash";


export abstract class AbstractComponent {

  public enumerateEnum = EnumHelpersService.enumerateEnum;
  public frameworks = EnumHelpersService.frameworks;
  public audienceTypes = EnumHelpersService.audienceTypes;
  public teachActivityTypes = EnumHelpersService.teachActivityTypes;
  public eventActivityTypes = EnumHelpersService.eventActivityTypes;
  public levels = EnumHelpersService.levels;
  public fundingTypes = EnumHelpersService.fundingTypes;
  public recurringEntities = EnumHelpersService.recurringEntities;

  public frameworkOfIdea = (idea: BazaarIdea): BazaarIdeaFramework => {
    if (idea instanceof BazaarEvent)
      return BazaarIdeaFramework.EntertainmentFramework;
    else if (idea instanceof BazaarTeach || idea instanceof BazaarLearn)
      return BazaarIdeaFramework.TeachingFramework;
    else if (idea instanceof BazaarResearch)
      return BazaarIdeaFramework.ResearchFramework;
    else
      throw new Error(`wrong kind of BazaarIdea ${JSON.stringify(idea)}`)
  };

  // noinspection JSMethodCanBeStatic
  public translateEnum(name: string, value: string) {
    return `bazaar.filters.${name}.${_.snakeCase(value)}`;
  }

  public translateActivityActivityType(activity: ActivityEvent | ActivityTeach): string {
    const type = (activity as Activity).type;

    let typeStr;
    if (type === 'teach') {
      const activityC = activity as ActivityTeach;
      typeStr = this.teachActivityTypes[activityC.activityType];
    } else {
      const activityC = activity as ActivityEvent;
      typeStr = this.eventActivityTypes[activityC.activityType];
    }

    return `activities.activityTypes.${type}.${_.snakeCase(typeStr)}`;
  }

  // noinspection JSMethodCanBeStatic
  public translateActivityType(activity: Activity | ActivitySlim): string {
    return `activities.type.${activity.type}`;
  }

  // noinspection JSMethodCanBeStatic
  public translatePaymentMethod(paymentMethod: PaymentMethod): string {
    return `paymentMethods.${paymentMethod}`;
  }

}
