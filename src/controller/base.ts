import { Logger } from 'pino';
import { ApiRoot } from 'kubernetes-client';
import { OperatorBroker } from 'src/broker';
import { Controller } from './types';

export abstract class BaseController implements Controller {
  public abstract init(): Promise<void>;
  public abstract start(): Promise<void>;
  public abstract stop(): Promise<void>;

  public name: string;
  protected logger: Logger;
  protected client: ApiRoot;

  public constructor(private broker: OperatorBroker) {
    this.name = this.constructor.name;
    this.logger = this.broker.getLogger().child({ caller: this.name });
    this.client = this.broker.getClient();
  }
}
