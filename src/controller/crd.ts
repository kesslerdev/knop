import { BaseController } from './base';
import { KubernetesObject } from '@kubernetes/client-node';
import { ResourceEventType } from '../client';

export abstract class CRDController extends BaseController {
  protected abstract kind: string;
  protected abstract apiGroup: string;
  protected abstract apiVersion: string;
  protected abstract pluralName: string;

  protected abstract async handleCreation(obj: KubernetesObject): Promise<object>;
  protected abstract async handleModification(obj: KubernetesObject): Promise<object>;
  protected abstract async handleDeletion(obj: KubernetesObject): Promise<boolean>;

  protected stopHandle: () => void;

  public async init(): Promise<void> {
    await this.checkInit();
    this.logger.info('Controller initializing');
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
    }, async (e) => {
      const object = e.object;

      switch (e.type) {
        case ResourceEventType.Added:
          return this.handleCreation(object);
        case ResourceEventType.Modified:
          return this.handleModification(object);
        case ResourceEventType.Deleted:
          return this.handleDeletion(object);
      }
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
