import { OperatorEngine, OperatorEnginePayload, OperatorEngineResult } from './types';
import { KubernetesObject } from '@kubernetes/client-node';
import { ResourceEventType } from '../client';

export interface BasicOperatorEngineOptions {
  debug: boolean;
  handleCreation(obj: KubernetesObject): Promise<object>;
  handleModification(obj: KubernetesObject, diff: object|boolean): Promise<object>;
  handleDeletion(obj: KubernetesObject): Promise<boolean>;
}

export class BasicOperatorEngine implements OperatorEngine {

  public constructor(private opts : BasicOperatorEngineOptions) { }

  async onEvent(payload: OperatorEnginePayload): Promise<OperatorEngineResult> {

    console.log("engine onEvent", payload.event.type);
    const object = payload.event.object;
    try {
      let result;
      switch (payload.event.type) {
        case ResourceEventType.Added:
          result = await this.opts.handleCreation(object);
          break;
        case ResourceEventType.Modified:
          result = await this.opts.handleModification(object, payload.diff);
          break;
        case ResourceEventType.Deleted:
          result = await this.opts.handleDeletion(object);
          break;
      }

      return {
        isSuccess: true,
        result
      }
    } catch (error) {
      return {
        isSuccess: false,
        error
      }
    }
  }
  
}
