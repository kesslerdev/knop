import { Logger } from 'pino';
import { OperatorBroker } from 'src/broker';
import { Controller } from './types';
import { KubeClient } from '../client';

export abstract class BaseController implements Controller {
  public abstract init(): Promise<void>;
  public abstract start(): Promise<void>;
  public abstract stop(): Promise<void>;

  public name: string;
  protected logger: Logger;
  protected client: KubeClient;

  protected initialized = false;
  protected started = false;

  public constructor(private broker: OperatorBroker) {
    this.name = this.constructor.name;
    this.logger = this.broker.getLogger().child({ caller: this.name });
    this.client = this.broker.getClient();
  }

  public async checkInit(): Promise<void> {
    if (this.initialized) {
      const err = new Error('Controller already initialized');
      this.logger.error(err);
      throw err;
    }
  }
  public async checkStart(): Promise<void> {
    if (this.started) {
      const err = new Error('Controller already started');
      this.logger.error(err);
      throw err;
    }

    if (!this.initialized) {
      await this.init();
    }
  }

  public async checkStop(): Promise<void> {
    if (!this.started) {
      const err = new Error('Controller not started');
      this.logger.error(err);
      throw err;
    }
  }
}
