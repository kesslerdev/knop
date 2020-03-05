import { BaseController } from './base';
import { OperatorEngine } from '../engine';

export abstract class CRDEngineController extends BaseController {
  protected abstract kind: string;
  protected abstract apiGroup: string;
  protected abstract apiVersion: string;
  protected abstract pluralName: string;

  protected stopHandle: () => void;
  protected engine: OperatorEngine;

  protected abstract async initEngine(): Promise<OperatorEngine>;

  public async init(): Promise<void> {
    await this.checkInit();
    this.logger.info('Controller initializing');
    this.engine = await this.initEngine();
    this.initialized = true;
    this.logger.info('Controller initialized');
  }

  public async start(): Promise<void> {
    await this.checkStart();

    this.logger.info('Controller starting');
    this.started = true;

    await this.client.watchUniqueResource({
      apiGroup: this.apiGroup,
      apiVersion: this.apiVersion,
      namespace: process.env.WATCH_NAMESPACE,
      pluralKind: this.pluralName
    }, async (event, diff) => {
      
      const res = await this.engine.onEvent({
        event,
        diff
      })

      return res.result
      
    });
    this.logger.info('Controller started');
  }

  public async stop(): Promise<void> {
    await this.checkStop();

    this.logger.info('Controller stopping');
    this.started = false;
    this.logger.info('Controller stopped');
  }
}
